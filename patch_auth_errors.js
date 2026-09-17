const fs = require('fs');
let code = fs.readFileSync('src/app/auth.ts', 'utf-8');

const target1 = `  const redis = getRedis();
  if (!redis) return { error: "Authentication system not configured (Redis missing)." };`;
const replace1 = `  const redis = getRedis();
  if (!redis) {
    console.error("[Auth Error] Redis configuration missing for createAccount");
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }`;
code = code.replace(target1, replace1);

const target2 = `  const existing = await redis.get(emailKey);
  if (existing) return { error: "Account already exists for this email." };`;
const replace2 = `  try {
    const existing = await redis.get(emailKey);
    if (existing) return { error: "An account with this email already exists." };
  } catch (err) {
    console.error("[Auth Error] Redis connection failed in createAccount", err);
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }`;
code = code.replace(target2, replace2);

const target3 = `  const redis = getRedis();
  if (!redis) return { error: "Authentication system not configured." };`;
const replace3 = `  const redis = getRedis();
  if (!redis) {
    console.error("[Auth Error] Redis configuration missing for signIn");
    return { error: "Sign in is temporarily unavailable. Please try again later." };
  }`;
code = code.replace(target3, replace3);

const target4 = `  const emailKey = "auth:email:" + email.toLowerCase();
  const userId = await redis.get<string>(emailKey);
  
  if (!userId) return { error: "Invalid email or password." };`;
const replace4 = `  const emailKey = "auth:email:" + email.toLowerCase();
  let userId;
  try {
    userId = await redis.get<string>(emailKey);
  } catch (err) {
    console.error("[Auth Error] Redis connection failed in signIn", err);
    return { error: "Sign in is temporarily unavailable. Please try again later." };
  }
  
  if (!userId) return { error: "Incorrect email or password." };`;
code = code.replace(target4, replace4);

const target5 = `  const user = await redis.get<any>("auth:user:" + userId);
  if (!user) return { error: "Invalid email or password." };
  
  const hashed = hashPassword(password, user.salt);
  if (hashed !== user.hash) return { error: "Invalid email or password." };`;
const replace5 = `  let user;
  try {
    user = await redis.get<any>("auth:user:" + userId);
  } catch(err) {
    console.error("[Auth Error] Failed to retrieve user data", err);
    return { error: "Sign in is temporarily unavailable. Please try again later." };
  }
  
  if (!user) return { error: "Incorrect email or password." };
  
  const hashed = hashPassword(password, user.salt);
  if (hashed !== user.hash) return { error: "Incorrect email or password." };`;
code = code.replace(target5, replace5);

const target6 = `  await redis.set(emailKey, id);
  await redis.set("auth:user:" + id, user);
  
  return await createSession(id);`;
const replace6 = `  try {
    await redis.set(emailKey, id);
    await redis.set("auth:user:" + id, user);
    return await createSession(id);
  } catch (err) {
    console.error("[Auth Error] Failed to persist new user", err);
    return { error: "Sign up is temporarily unavailable. Please try again later." };
  }`;
code = code.replace(target6, replace6);

const target7 = `  // Expiry in 7 days
  await redis?.set("auth:session:" + sessionId, userId, { ex: 604800 });`;
const replace7 = `  // Expiry in 7 days
  try {
    await redis?.set("auth:session:" + sessionId, userId, { ex: 604800 });
  } catch(err) {
    console.error("[Auth Error] Failed to save session to Redis", err);
    // Continue anyway to set cookie, though session might fail verification later if redis is totally down
  }`;
code = code.replace(target7, replace7);

fs.writeFileSync('src/app/auth.ts', code);
