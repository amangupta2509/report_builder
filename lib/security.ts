/**
 * Security utilities for handling sensitive operations
 */

import { NextRequest, NextResponse } from "next/server";

/**
 * Sanitize error messages to prevent information disclosure
 * Never expose database errors, file paths, or system details to clients
 */
export function getSafeErrorMessage(error: any, isDevelopment = false): string {
  if (isDevelopment && process.env.NODE_ENV === "development") {
    return error?.message || "An error occurred";
  }

  // Default safe message for production
  return "An error occurred. Please try again later.";
}

/**
 * Rate limiting helper - tracks requests per IP
 * Use with caution and consider database-backed rate limiting for production
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry || now > entry.resetTime) {
    // Create new entry
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Get safe client identifier for rate limiting
 * Uses IP address from request
 */
export function getClientIdentifier(request: NextRequest): string {
  // Try to get client IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-vercel-forwarded-for") ||
    "unknown";
  return ip || "unknown";
}

/**
 * Create safe error response without exposing sensitive information
 */
export function createSafeErrorResponse(
  error: any,
  statusCode: number = 500,
  isDevelopment = false,
): NextResponse {
  const message = getSafeErrorMessage(error, isDevelopment);
  return NextResponse.json({ error: message }, { status: statusCode });
}

/**
 * Validate and sanitize string input
 */
export function sanitizeInput(input: string, maxLength: number = 255): string {
  return input
    .trim()
    .substring(0, maxLength)
    .replace(/[<>"']/g, ""); // Remove potential XSS characters
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  message?: string;
} {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters" };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain an uppercase letter",
    };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain a number" };
  }

  if (!/[!@#$%^&*()_+\-=[\]{};:'"\\|,.<>?~]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain a special character",
    };
  }

  return { valid: true };
}
