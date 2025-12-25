// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { destroySession, getSession } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "logout",
          details: { email: session.email },
        },
      });
    }

    await destroySession();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
