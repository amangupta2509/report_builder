import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import {
  createSharePayload,
  hashPassword,
  generateSecureToken,
} from "@/lib/encryption";

const prisma = new PrismaClient();

/**
 * POST - Create a new share token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      reportId,
      patientId,
      password,
      expiresInDays,
      maxViews,
      createdBy,
    } = body;

    // Validate required fields
    if (!reportId || !patientId) {
      return NextResponse.json(
        { error: "Missing reportId or patientId" },
        { status: 400 }
      );
    }

    // Verify report and patient exist
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { patient: true },
    });

    if (!report || report.patientId !== patientId) {
      return NextResponse.json(
        { error: "Report not found or does not belong to patient" },
        { status: 404 }
      );
    }

    // Create encrypted token
    const token = createSharePayload(reportId, patientId);

    // Calculate expiration
    let expiresAt: Date | null = null;
    if (expiresInDays && expiresInDays > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    }

    // Hash password if provided
    let hashedPassword: string | null = null;
    if (password && password.trim()) {
      hashedPassword = await hashPassword(password);
    }

    // Create share token in database
    const shareToken = await prisma.shareToken.create({
      data: {
        token,
        reportId,
        patientId,
        password: hashedPassword,
        expiresAt,
        maxViews: maxViews || null,
        createdBy: createdBy || null,
        isActive: true,
      },
    });

    // Generate shareable URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const shareUrl = `${baseUrl}/shared/${token}`;

    return NextResponse.json({
      success: true,
      shareToken: {
        id: shareToken.id,
        url: shareUrl,
        token: shareToken.token,
        expiresAt: shareToken.expiresAt,
        maxViews: shareToken.maxViews,
        hasPassword: !!hashedPassword,
        createdAt: shareToken.createdAt,
        message: hashedPassword
          ? "Anyone with the password can access this report unlimited times"
          : "Public link - anyone with the URL can access",
      },
    });
  } catch (error: any) {
    console.error("Error creating share token:", error);
    return NextResponse.json(
      { error: "Failed to create share link", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET - List all share tokens for a report
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const patientId = searchParams.get("patientId");

    if (!reportId && !patientId) {
      return NextResponse.json(
        { error: "Missing reportId or patientId parameter" },
        { status: 400 }
      );
    }

    const where: any = { isActive: true };
    if (reportId) where.reportId = reportId;
    if (patientId) where.patientId = patientId;

    const shareTokens = await prisma.shareToken.findMany({
      where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        maxViews: true,
        viewCount: true,
        createdAt: true,
        lastAccessedAt: true,
        isActive: true,
        password: true, // Just to check if exists
        report: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Format response
    const formatted = shareTokens.map((st) => ({
      id: st.id,
      token: st.token,
      url: `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/shared/${st.token}`,
      expiresAt: st.expiresAt,
      maxViews: st.maxViews,
      viewCount: st.viewCount,
      hasPassword: !!st.password,
      createdAt: st.createdAt,
      lastAccessedAt: st.lastAccessedAt,
      isActive: st.isActive,
      reportName: st.report.name || "Untitled Report",
      isExpired: st.expiresAt ? new Date() > st.expiresAt : false,
      isMaxViewsReached: st.maxViews ? st.viewCount >= st.maxViews : false,
    }));

    return NextResponse.json({
      success: true,
      shareTokens: formatted,
    });
  } catch (error: any) {
    console.error("Error fetching share tokens:", error);
    return NextResponse.json(
      { error: "Failed to fetch share tokens", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * DELETE - Revoke a share token
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get("tokenId");

    if (!tokenId) {
      return NextResponse.json(
        { error: "Missing tokenId parameter" },
        { status: 400 }
      );
    }

    // Deactivate instead of delete to maintain audit trail
    await prisma.shareToken.update({
      where: { id: tokenId },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: "Share token revoked successfully",
    });
  } catch (error: any) {
    console.error("Error revoking share token:", error);
    return NextResponse.json(
      { error: "Failed to revoke share token", details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
