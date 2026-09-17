"use server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";
import { cookies } from "next/headers";

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

// Helper to hash password
function hashPassword(password: string, salt: string) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export async function createAccount(name: string, email: string, password: string) {
  const redis = getRedis();
  if (!redis) {
    console.error("[Auth Error] Redis configuration missing for createAccount");
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }
  
  const emailKey = "auth:email:" + email.toLowerCase();
  try {
    const existing = await redis.get(emailKey);
    if (existing) return { error: "An account with this email already exists." };
  } catch (err) {
    console.error("[Auth Error] Redis connection failed in createAccount", err);
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }
  
  const id = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString("hex");
  const hashed = hashPassword(password, salt);
  
  const user = { id, name, email: email.toLowerCase(), hash: hashed, salt };
  
  try {
    await redis.set(emailKey, id);
    await redis.set("auth:user:" + id, user);
    return await createSession(id);
  } catch (err) {
    console.error("[Auth Error] Failed to persist new user", err);
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }
}

export async function signIn(email: string, password: string) {
  const redis = getRedis();
  if (!redis) {
    console.error("[Auth Error] Redis configuration missing for signIn");
    return { error: "Sign in is temporarily unavailable. Please try again later." };
  }
  
  const emailKey = "auth:email:" + email.toLowerCase();
  let userId;
  try {
    userId = await redis.get<string>(emailKey);
  } catch (err) {
    console.error("[Auth Error] Redis connection failed in signIn", err);
    return { error: "Sign in is temporarily unavailable. Please try again later." };
  }
  
  if (!userId) return { error: "Incorrect email or password." };
  
  let user;
  try {
    user = await redis.get<any>("auth:user:" + userId);
  } catch(err) {
    console.error("[Auth Error] Failed to retrieve user data", err);
    return { error: "Sign in is temporarily unavailable. Please try again later." };
  }
  
  if (!user) return { error: "Incorrect email or password." };
  
  const hashed = hashPassword(password, user.salt);
  if (hashed !== user.hash) return { error: "Incorrect email or password." };
  
  return await createSession(userId);
}

async function createSession(userId: string) {
  const redis = getRedis();
  const sessionId = crypto.randomBytes(32).toString("hex");
  
  // Expiry in 7 days
  try {
    await redis?.set("auth:session:" + sessionId, userId, { ex: 604800 });
  } catch(err) {
    console.error("[Auth Error] Failed to save session to Redis", err);
    // Continue anyway to set cookie, though session might fail verification later if redis is totally down
  }
  
  const cookieStore = await cookies();
  cookieStore.set("plugin_session", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 604800,
    path: "/"
  });
  
  return { success: true };
}

export async function getSessionUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("plugin_session")?.value;
  if (!sessionId) return null;
  
  const redis = getRedis();
  if (!redis) return null;
  
  const userId = await redis.get<string>("auth:session:" + sessionId);
  if (!userId) return null;
  
  const user = await redis.get<any>("auth:user:" + userId);
  if (!user) return null;
  
  return { id: user.id, name: user.name, email: user.email };
}

export async function logout() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("plugin_session")?.value;
  if (sessionId) {
    const redis = getRedis();
    await redis?.del("auth:session:" + sessionId);
  }
  cookieStore.delete("plugin_session");
  return { success: true };
}

export async function checkGoogleAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return { configured: false };
  }
  return { configured: true };
}

export async function getGoogleAuthUrl() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback/google` : "http://localhost:3000/api/auth/callback/google";
  
  if (!clientId) return null;
  
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "email profile");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  
  return url.toString();
}
