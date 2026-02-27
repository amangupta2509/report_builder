// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "@/lib/encryption";
import { createSession } from "@/lib/auth";
import { z } from "zod";

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      await logAuditEvent(
        "login_failed",
        { email, reason: "user_not_found" },
        request
      );
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      await logAuditEvent(
        "login_failed",
        { email, reason: "account_inactive" },
        request
      );
      return NextResponse.json(
        { error: "Account is disabled. Please contact support." },
        { status: 403 }
      );
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / 1000 / 60
      );
      await logAuditEvent(
        "login_failed",
        { email, reason: "account_locked" },
        request
      );
      return NextResponse.json(
        {
          error: `Account is locked due to multiple failed login attempts. Try again in ${remainingTime} minutes.`,
        },
        { status: 429 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = user.loginAttempts + 1;
      const shouldLock = newAttempts >= MAX_LOGIN_ATTEMPTS;

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newAttempts,
          lockedUntil: shouldLock
            ? new Date(Date.now() + LOCKOUT_DURATION)
            : null,
        },
      });

      await logAuditEvent(
        "login_failed",
        { email, reason: "invalid_password", attempts: newAttempts },
        request
      );

      if (shouldLock) {
        return NextResponse.json(
          {
            error:
              "Account locked due to multiple failed login attempts. Try again in 15 minutes.",
          },
          { status: 429 }
        );
      }

      const attemptsRemaining = MAX_LOGIN_ATTEMPTS - newAttempts;
      return NextResponse.json(
        {
          error: `Invalid email or password. ${attemptsRemaining} attempt(s) remaining.`,
        },
        { status: 401 }
      );
    }

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Create session
    await createSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as "admin" | "viewer",
      createdAt: user.createdAt,
    });

    await logAuditEvent(
      "login_success",
      { userId: user.id, email: user.email },
      request
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

async function logAuditEvent(
  action: string,
  details: any,
  request: NextRequest
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        details,
        ipAddress:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip") ||
          "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
