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
  if (!redis) return { error: "Authentication system not configured (Redis missing)." };
  
  const emailKey = "auth:email:" + email.toLowerCase();
  const existing = await redis.get(emailKey);
  if (existing) return { error: "Account already exists for this email." };
  
  const id = crypto.randomUUID();
  const salt = crypto.randomBytes(16).toString("hex");
  const hashed = hashPassword(password, salt);
  
  const user = { id, name, email: email.toLowerCase(), hash: hashed, salt };
  
  await redis.set(emailKey, id);
  await redis.set("auth:user:" + id, user);
  
  return await createSession(id);
}

export async function signIn(email: string, password: string) {
  const redis = getRedis();
  if (!redis) return { error: "Authentication system not configured." };
  
  const emailKey = "auth:email:" + email.toLowerCase();
  const userId = await redis.get<string>(emailKey);
  
  if (!userId) return { error: "Invalid email or password." };
  
  const user = await redis.get<any>("auth:user:" + userId);
  if (!user) return { error: "Invalid email or password." };
  
  const hashed = hashPassword(password, user.salt);
  if (hashed !== user.hash) return { error: "Invalid email or password." };
  
  return await createSession(userId);
}

async function createSession(userId: string) {
  const redis = getRedis();
  const sessionId = crypto.randomBytes(32).toString("hex");
  
  // Expiry in 7 days
  await redis?.set("auth:session:" + sessionId, userId, { ex: 604800 });
  
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
