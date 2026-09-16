"use server";

import YTMusic from "ytmusic-api";

const ytm = new YTMusic();
let isInitialized = false;

async function init() {
  if (!isInitialized) {
    await ytm.initialize();
    isInitialized = true;
  }
}

export async function getItunesCoverArt(title: string, artist: string): Promise<string | null> {
  try {
    const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
    const cleanArtist = typeof artist === 'string' ? artist.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim() : '';
    const query = encodeURIComponent(`${cleanTitle} ${cleanArtist}`);
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const art = data.results[0].artworkUrl100;
      if (art) {
        return art.replace('100x100bb', '1000x1000bb');
      }
    }
  } catch (error) {
    console.error("iTunes search error:", error);
  }
  return null;
}

async function enrichSongsWithItunes(videos: any[]) {
  return await Promise.all(videos.map(async (v) => {
    const art = await getItunesCoverArt(v.title, v.artist);
    if (art) {
      v.image = art;
    }
    return v;
  }));
}

export async function getArtistBackground(artistName: string): Promise<string | null> {
  try {
    await init();
    const artists = await ytm.searchArtists(artistName);
    if (artists && artists.length > 0) {
      const artist = await ytm.getArtist(artists[0].artistId);
      if (artist && (artist as any).banners && (artist as any).banners.length > 0) {
        let url = (artist as any).banners[(artist as any).banners.length - 1].url;
        // Upscale if needed, though they are usually 1920+ wide
        if (url.includes('w212-h106')) {
           url = url.replace(/w\d+-h\d+/, 'w1920-h1080');
        } else if (url.match(/w\d+-h\d+/)) {
           url = url.replace(/w\d+-h\d+/, 'w1920-h1080');
        }
        return url;
      }
    }
  } catch (error) {
    console.error("Artist background fetch error:", error);
  }
  return null;
}

export async function searchYouTube(query: string, searchType: "artist" | "song" | "any" = "any") {
  try {
    await init();
    const results = await ytm.searchSongs(query);
    
    let videos = results.map((v) => {
      const mins = Math.floor((v.duration || 0) / 60);
      const secs = ((v.duration || 0) % 60).toString().padStart(2, "0");
      return {
        id: v.videoId,
        title: v.name,
        artist: v.artist?.name || "Unknown Artist",
        image: v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url.replace(/w\d+-h\d+/, 'w544-h544') : "",
        duration: `${mins}:${secs}`,
        seconds: v.duration || 0,
      };
    });

    if (searchType === "artist") {
      videos = videos.filter((v) => v.artist.toLowerCase().includes(query.toLowerCase()));
    } else if (searchType === "song") {
      videos = videos.filter((v) => v.title.toLowerCase().includes(query.toLowerCase()));
    }

    return await enrichSongsWithItunes(videos);
  } catch (error) {
    console.error("YouTube search error:", error);
    return [];
  }
}

export async function getSearchSuggestions(query: string) {
  if (!query) return [];
  try {
    await init();
    const suggestions = await ytm.getSearchSuggestions(query);
    return suggestions.slice(0, 6);
  } catch (error) {
    console.error("Suggestions error:", error);
    return [];
  }
}

export type SyncedLyric = {
  time: number;
  text: string;
  words?: { text: string; time: number }[];
};

export async function getSyncedLyrics(title: string, artist: string): Promise<SyncedLyric[]> {
  try {
    const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
    const cleanArtist = typeof artist === 'string' ? artist.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim() : '';
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data && data.length > 0) {
      // Find the first result with syncedLyrics
      const result = data.find((d: any) => d.syncedLyrics);
      if (result) {
        const lrc = result.syncedLyrics as string;
        const lines = lrc.split('\n');
        const parsed: SyncedLyric[] = [];
        
        for (const line of lines) {
          const match = line.match(/^\[(\d+):(\d+\.\d+)\](.*)/);
          if (match) {
            const minutes = parseInt(match[1], 10);
            const seconds = parseFloat(match[2]);
            const text = match[3].trim();
            const time = (minutes * 60) + seconds;
            if (text) {
              parsed.push({ time, text });
            }
          }
        }
        
        for (let i = 0; i < parsed.length; i++) {
          const line = parsed[i];
          const nextTime = i < parsed.length - 1 ? parsed[i + 1].time : line.time + 5;
          const duration = nextTime - line.time;
          
          const words = line.text.split(' ');
          const effectiveDuration = Math.min(duration, words.length * 0.45); 
          const timePerWord = effectiveDuration / words.length;
          
          line.words = words.map((w, index) => ({
             text: w,
             time: line.time + (index * timePerWord)
          }));
        }
        
        return parsed;
      }
    }
    
    // Fallback to youtube-music API if no synced lyrics
    await init();
    // We would need videoId to fallback, but we don't have it in this signature.
    // That's fine, we will handle empty array gracefully on client.
    return [];
  } catch (error) {
    console.error("Synced Lyrics error:", error);
    return [];
  }
}

export async function getTrendingWorldwide() {
  try {
    await init();
    const results = await ytm.searchSongs("top trending pop songs worldwide 2024");
    let videos = results.map((v) => {
      const mins = Math.floor((v.duration || 0) / 60);
      const secs = ((v.duration || 0) % 60).toString().padStart(2, "0");
      return {
        id: v.videoId,
        title: v.name,
        artist: v.artist?.name || "Unknown Artist",
        image: v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url.replace(/w\d+-h\d+/, 'w544-h544') : "",
        duration: `${mins}:${secs}`,
        seconds: v.duration || 0,
      };
    });
    return await enrichSongsWithItunes(videos.slice(0, 15));
  } catch (error) {
    console.error("Trending Worldwide error:", error);
    return [];
  }
}

export async function getTrendingIndia() {
  try {
    await init();
    const results = await ytm.searchSongs("top trending bollywood hindi punjabi songs 2024");
    let videos = results.map((v) => {
      const mins = Math.floor((v.duration || 0) / 60);
      const secs = ((v.duration || 0) % 60).toString().padStart(2, "0");
      return {
        id: v.videoId,
        title: v.name,
        artist: v.artist?.name || "Unknown Artist",
        image: v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url.replace(/w\d+-h\d+/, 'w544-h544') : "",
        duration: `${mins}:${secs}`,
        seconds: v.duration || 0,
      };
    });
    return await enrichSongsWithItunes(videos.slice(0, 15));
  } catch (error) {
    console.error("Trending India error:", error);
    return [];
  }
}

export async function getRelatedSongs(videoId: string) {
  try {
    await init();
    const upNext = await ytm.getUpNexts(videoId);
    let videos = upNext.filter(v => (v.type === "SONG" || v.type === "VIDEO") && v.videoId !== videoId).map((v: any) => {
      // duration is string like "3:13"
      let seconds = 0;
      if (v.duration) {
        const parts = v.duration.split(":");
        if (parts.length === 2) {
          seconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
      return {
        id: v.videoId,
        title: v.title,
        artist: v.artists || "Unknown Artist",
        image: (v.thumbnail || "").replace(/w\d+-h\d+/, 'w544-h544'),
        duration: v.duration,
        seconds: seconds,
      };
    });
    return await enrichSongsWithItunes(videos);
  } catch (error) {
    console.error("Related songs error:", error);
    return [];
  }
}


