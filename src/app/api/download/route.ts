import { NextRequest } from "next/server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("v");
  if (!videoId) {
    return new Response("Missing video ID", { status: 400 });
  }

  try {
    const invidiousUrl = `https://invidious.tiekoetter.com/latest_version?id=${videoId}&itag=140`;
    const res = await fetch(invidiousUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });

    if (!res.ok) {
      return new Response("Upstream failed", { status: res.status });
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'audio/mp4',
        'Content-Length': res.headers.get('content-length') || '',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new Response("Proxy error", { status: 500 });
  }
}
