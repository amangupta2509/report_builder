// lib/auth.ts
import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

const SESSION_DURATION = 8 * 60 * 60; // 8 hours in seconds
const REFRESH_TOKEN_DURATION = 7 * 24 * 60 * 60; // 7 days

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "CRITICAL: JWT_SECRET environment variable is not set. Please set a strong secret in your .env file with at least 32 characters.",
    );
  }

  return new TextEncoder().encode(secret);
}

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

function isSessionPayload(payload: unknown): payload is SessionPayload {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const candidate = payload as Record<string, unknown>;

  return (
    typeof candidate.userId === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.exp === "number" &&
    typeof candidate.iat === "number"
  );
}

/**
 * Create access token (8 hours validity)
 */
export async function createAccessToken(user: User): Promise<string> {
  return await new SignJWT({
    userId: user.id,
    email: user.email,
    role: user.role.toLowerCase(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getJwtSecret());
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
    .sign(getJwtSecret());
}

/**
 * Verify JWT token
 */
export async function verifyToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (!isSessionPayload(payload)) {
      return null;
    }

    return payload;
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
    secure: false,
    sameSite: "lax",
    maxAge: SESSION_DURATION,
    path: "/",
  });

  // Set refresh token
  cookieStore.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
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
