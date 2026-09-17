"use server";

import { Redis } from "@upstash/redis";

// Initialize Redis client from environment variables
// You must set KV_REST_API_URL and KV_REST_API_TOKEN in your Vercel project settings
// after creating an Upstash Redis store from Vercel Marketplace.
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) {
    console.warn("Redis not configured: KV_REST_API_URL and KV_REST_API_TOKEN are required.");
    return null;
  }
  return new Redis({ url, token });
}

// Keys used in Redis
const PROFILES_KEY = "music_profiles";
const ACTIVE_PROFILE_KEY = "music_active_profile";
const playlistKey = (profileId: string) => `frans_hals_playlists_${profileId}`;

// ─── Profile Types ───────────────────────────────────────────────
type Profile = {
  id: string;
  name: string;
  color: string;
  emoji: string;
  avatar?: string;
};

type Playlist = {
  id: string;
  name: string;
  songs: any[];
};

// ─── Profile CRUD ────────────────────────────────────────────────

export async function loadProfiles(): Promise<Profile[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const data = await redis.get<Profile[]>(PROFILES_KEY);
    return data || [];
  } catch (e) {
    console.error("Failed to load profiles from Redis:", e);
    return [];
  }
}

export async function saveProfilesServer(profiles: Profile[]): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    await redis.set(PROFILES_KEY, profiles);
    return true;
  } catch (e) {
    console.error("Failed to save profiles to Redis:", e);
    return false;
  }
}

export async function loadActiveProfile(): Promise<Profile | null> {
  const redis = getRedis();
  if (!redis) return null;
  try {
    const data = await redis.get<Profile>(ACTIVE_PROFILE_KEY);
    return data || null;
  } catch (e) {
    console.error("Failed to load active profile from Redis:", e);
    return null;
  }
}

export async function saveActiveProfileServer(profile: Profile | null): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    if (profile) {
      await redis.set(ACTIVE_PROFILE_KEY, profile);
    } else {
      await redis.del(ACTIVE_PROFILE_KEY);
    }
    return true;
  } catch (e) {
    console.error("Failed to save active profile to Redis:", e);
    return false;
  }
}

// ─── Playlist CRUD ───────────────────────────────────────────────

export async function loadPlaylistsServer(profileId: string): Promise<Playlist[]> {
  const redis = getRedis();
  if (!redis) return [];
  try {
    const data = await redis.get<Playlist[]>(playlistKey(profileId));
    return data || [];
  } catch (e) {
    console.error("Failed to load playlists from Redis:", e);
    return [];
  }
}

export async function savePlaylistsServer(profileId: string, playlists: Playlist[]): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    await redis.set(playlistKey(profileId), playlists);
    return true;
  } catch (e) {
    console.error("Failed to save playlists to Redis:", e);
    return false;
  }
}

export async function deletePlaylistsServer(profileId: string): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;
  try {
    await redis.del(playlistKey(profileId));
    return true;
  } catch (e) {
    console.error("Failed to delete playlists from Redis:", e);
    return false;
  }
}
