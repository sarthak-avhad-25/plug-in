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

export async function searchYouTube(query: string, searchType: "artist" | "song" | "any" = "any") {
  try {
    await init();
    const results = await ytm.searchSongs(query);
    
    let videos = results.map((v) => {
      const mins = Math.floor(v.duration / 60);
      const secs = (v.duration % 60).toString().padStart(2, "0");
      return {
        id: v.videoId,
        title: v.name,
        artist: v.artist?.name || "Unknown Artist",
        image: v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url : "",
        duration: `${mins}:${secs}`,
        seconds: v.duration,
      };
    });

    if (searchType === "artist") {
      videos = videos.filter((v) => v.artist.toLowerCase().includes(query.toLowerCase()));
    } else if (searchType === "song") {
      videos = videos.filter((v) => v.title.toLowerCase().includes(query.toLowerCase()));
    }

    return videos.slice(0, 10);
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
};

export async function getSyncedLyrics(title: string, artist: string): Promise<SyncedLyric[]> {
  try {
    const url = `https://lrclib.net/api/search?track_name=${encodeURIComponent(title)}&artist_name=${encodeURIComponent(artist)}`;
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
      const mins = Math.floor(v.duration / 60);
      const secs = (v.duration % 60).toString().padStart(2, "0");
      return {
        id: v.videoId,
        title: v.name,
        artist: v.artist?.name || "Unknown Artist",
        image: v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url : "",
        duration: `${mins}:${secs}`,
        seconds: v.duration,
      };
    });
    return videos.slice(0, 10);
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
      const mins = Math.floor(v.duration / 60);
      const secs = (v.duration % 60).toString().padStart(2, "0");
      return {
        id: v.videoId,
        title: v.name,
        artist: v.artist?.name || "Unknown Artist",
        image: v.thumbnails && v.thumbnails.length > 0 ? v.thumbnails[v.thumbnails.length - 1].url : "",
        duration: `${mins}:${secs}`,
        seconds: v.duration,
      };
    });
    return videos.slice(0, 10);
  } catch (error) {
    console.error("Trending India error:", error);
    return [];
  }
}

export async function getRelatedSongs(videoId: string) {
  try {
    await init();
    const upNext = await ytm.getUpNexts(videoId);
    let videos = upNext.filter(v => v.type === "SONG" || v.type === "VIDEO").map((v: any) => {
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
        image: v.thumbnail || "",
        duration: v.duration,
        seconds: seconds,
      };
    });
    return videos;
  } catch (error) {
    console.error("Related songs error:", error);
    return [];
  }
}
