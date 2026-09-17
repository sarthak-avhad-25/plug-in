const fs = require('fs');
fs.writeFileSync('src/app/api/download/route.ts', `import { NextRequest } from "next/server";
import https from "https";

export async function GET(request: NextRequest) {
  const videoId = request.nextUrl.searchParams.get("v");
  if (!videoId) {
    return new Response("Missing video ID", { status: 400 });
  }

  try {
    const invidiousUrl = \`https://invidious.tiekoetter.com/latest_version?id=\${videoId}&itag=140\`;

    return new Promise((resolve) => {
      https.get(invidiousUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res1) => {
        if (res1.statusCode >= 300 && res1.statusCode < 400 && res1.headers.location) {
          // Follow redirect once
          https.get(res1.headers.location, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res2) => {
            if (res2.statusCode !== 200) {
              resolve(new Response("Upstream failed", { status: res2.statusCode }));
            } else {
              // Convert Node stream to Web stream
              const stream = new ReadableStream({
                start(controller) {
                  res2.on('data', chunk => controller.enqueue(chunk));
                  res2.on('end', () => controller.close());
                  res2.on('error', err => controller.error(err));
                }
              });
              resolve(new Response(stream, {
                headers: {
                  'Content-Type': res2.headers['content-type'] || 'audio/mp4',
                  'Content-Length': res2.headers['content-length'] || '',
                  'Access-Control-Allow-Origin': '*'
                }
              }));
            }
          }).on('error', () => resolve(new Response("Proxy stream error", { status: 500 })));
        } else if (res1.statusCode === 200) {
          const stream = new ReadableStream({
            start(controller) {
              res1.on('data', chunk => controller.enqueue(chunk));
              res1.on('end', () => controller.close());
              res1.on('error', err => controller.error(err));
            }
          });
          resolve(new Response(stream, {
            headers: {
              'Content-Type': res1.headers['content-type'] || 'audio/mp4',
              'Content-Length': res1.headers['content-length'] || '',
              'Access-Control-Allow-Origin': '*'
            }
          }));
        } else {
          resolve(new Response("Upstream failed", { status: res1.statusCode }));
        }
      }).on('error', () => resolve(new Response("Proxy error", { status: 500 })));
    });
  } catch (error) {
    console.error("Download proxy error:", error);
    return new Response("Proxy error", { status: 500 });
  }
}
`);
