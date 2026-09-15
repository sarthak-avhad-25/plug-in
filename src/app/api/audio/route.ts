import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("v");
  if (!videoId) {
    return new Response("Missing video ID", { status: 400 });
  }

  try {
    // Redirect to a public Invidious instance that provides direct streaming URLs
    const invidiousUrl = `https://invidious.tiekoetter.com/latest_version?id=${videoId}&itag=140`;
    return NextResponse.redirect(invidiousUrl);
  } catch (error) {
    console.error("Audio stream error:", error);
    return new Response("Failed to stream audio", { status: 500 });
  }
}
