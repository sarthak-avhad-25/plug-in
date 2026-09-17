import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { cookies } from "next/headers";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  
  const redirectBase = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${error}`, redirectBase));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", redirectBase));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${redirectBase}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/?error=missing_google_env", redirectBase));
  }

  try {
    // 1. Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/?error=google_token_failed", redirectBase));
    }

    // 2. Fetch user profile from Google
    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const profileData = await profileRes.json();
    
    if (!profileData.email) {
      return NextResponse.redirect(new URL("/?error=google_profile_failed", redirectBase));
    }

    // 3. Save or retrieve user in Redis
    const redis = getRedis();
    if (!redis) {
      return NextResponse.redirect(new URL("/?error=redis_failed", redirectBase));
    }
    
    const emailKey = `auth:email:${profileData.email.toLowerCase()}`;
    let userId = await redis.get<string>(emailKey);
    
    if (!userId) {
      // Create new user via Google
      userId = crypto.randomUUID();
      const user = {
        id: userId,
        name: profileData.name || profileData.given_name || "Google User",
        email: profileData.email.toLowerCase(),
        googleId: profileData.id,
        picture: profileData.picture
      };
      await redis.set(emailKey, userId);
      await redis.set(`auth:user:${userId}`, user);
    }
    
    // 4. Create Session
    const sessionId = crypto.randomBytes(32).toString("hex");
    await redis.set(`auth:session:${sessionId}`, userId, { ex: 604800 });
    
    const cookieStore = await cookies();
    cookieStore.set("plugin_session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 604800,
      path: "/"
    });

    // 5. Redirect back to app
    return NextResponse.redirect(new URL("/", redirectBase));
    
  } catch (err) {
    console.error("Google Auth Error:", err);
    return NextResponse.redirect(new URL("/?error=google_auth_failed", redirectBase));
  }
}
