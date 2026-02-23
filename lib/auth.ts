// lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-this-in-production-min-32-chars"
);

const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // 7 days

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "viewer";
  createdAt: Date;
}

export interface SessionPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Create access token (8 hours validity)
 */
export async function createAccessToken(user: User): Promise<string> {
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(JWT_SECRET);
}

/**
 * Create refresh token (7 days validity)
 */
export async function createRefreshToken(user: User): Promise<string> {
  return await new SignJWT({
    userId: user.id,
    type: "refresh",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Create session with HTTP-only cookies
 */
export async function createSession(user: User) {
  const accessToken = await createAccessToken(user);
  const refreshToken = await createRefreshToken(user);

  const cookieStore = await cookies();
  
  // Set access token
  cookieStore.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  // Set refresh token
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: REFRESH_TOKEN_DURATION,
    path: "/",
  });

  return { accessToken, refreshToken };
}

/**
 * Get current session
 */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return null;

    return await verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Destroy session (logout)
 */
export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

/**
 * Require authentication
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session) {
    throw new Error("Unauthorized");
  }

  return session;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  const session = await requireAuth();
  
  if (session.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }

  return session;
}