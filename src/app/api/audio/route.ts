import ytdl from "@distube/ytdl-core";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("v");
  if (!videoId) {
    return new Response("Missing video ID", { status: 400 });
  }

  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const info = await ytdl.getInfo(url);

    // Pick the best audio-only format
    const format = ytdl.chooseFormat(info.formats, {
      quality: "highestaudio",
      filter: "audioonly",
    });

    if (!format || !format.url) {
      return new Response("No audio format found", { status: 404 });
    }

    // Stream the audio through to the client
    const audioResponse = await fetch(format.url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        ...(request.headers.get("range")
          ? { Range: request.headers.get("range")! }
          : {}),
      },
    });

    const headers = new Headers();
    headers.set(
      "Content-Type",
      format.mimeType?.split(";")[0] || "audio/webm"
    );
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=3600");

    if (audioResponse.headers.get("content-length")) {
      headers.set(
        "Content-Length",
        audioResponse.headers.get("content-length")!
      );
    }
    if (audioResponse.headers.get("content-range")) {
      headers.set(
        "Content-Range",
        audioResponse.headers.get("content-range")!
      );
    }

    return new Response(audioResponse.body, {
      status: audioResponse.status,
      headers,
    });
  } catch (error) {
    console.error("Audio stream error:", error);
    return new Response("Failed to stream audio", { status: 500 });
  }
}
