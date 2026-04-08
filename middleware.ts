// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "CRITICAL: JWT_SECRET environment variable is not set. Please set a strong secret in your .env file with at least 32 characters.",
    );
  }

  return new TextEncoder().encode(secret);
}

// Public routes that don't require authentication
const publicRoutes = ["/login", "/api/auth/login", "/api/auth/setup"];

// Shared report routes - NO LOGIN REQUIRED, only password
const sharedReportRoutes = ["/shared/", "/api/shared-access"];

// Routes that require admin role
const adminRoutes = [
  "/admin",
  "/api/patients-data",
  "/api/nutrition",
  "/api/upload-image",
  "/api/upload-signature",
  "/api/sports-images",
  "/api/lifestyle-images",
  "/api/lifestyle-upload",
  "/api/digestive-images",
  "/api/addiction-images",
  "/api/allergies-image",
  "/api/sleep-image",
  "/api/share-report",
];

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    console.log("TOKEN PAYLOAD:", payload);
    return payload;
  } catch (error) {
    console.error("TOKEN VERIFICATION ERROR:", error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ PRIORITY 0: Allow all static assets and images from public folder
  // This includes: /sleep/, /digestive/, /allergies/, /addiction/, /sports/, /lifestyle/, etc.
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes("/favicon") ||
    pathname.match(
      /\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/,
    ) ||
    // Allow all image folders from public directory
    pathname.startsWith("/sleep/") ||
    pathname.startsWith("/digestive/") ||
    pathname.startsWith("/allergies/") ||
    pathname.startsWith("/addiction/") ||
    pathname.startsWith("/sports/") ||
    pathname.startsWith("/lifestyle/") ||
    pathname.startsWith("/life/") ||
    pathname.startsWith("/table/") ||
    pathname.startsWith("/uploads/") ||
    pathname.startsWith("/public/")
  ) {
    return NextResponse.next();
  }

  // ✅ PRIORITY 1: Allow shared report access (NO LOGIN REQUIRED)
  if (sharedReportRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ PRIORITY 2: Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // ✅ PRIORITY 3: Require authentication for all other routes
  const accessToken = request.cookies.get("accessToken")?.value;

  if (!accessToken) {
    // Redirect to login for web pages
    if (!pathname.startsWith("/api")) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API routes
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  // Verify token
  const session = await verifyToken(accessToken);

  if (!session) {
    // Clear invalid token
    const response = pathname.startsWith("/api")
      ? NextResponse.json(
          { error: "Invalid or expired session" },
          { status: 401 },
        )
      : NextResponse.redirect(new URL("/login?session=expired", request.url));

    response.cookies.delete("accessToken");
    response.cookies.delete("refreshToken");
    return response;
  }

  // Check admin access for protected routes
  const requiresAdmin = adminRoutes.some((route) => pathname.startsWith(route));

  if (requiresAdmin && session.role?.toLowerCase() !== "admin") {
    if (pathname.startsWith("/api")) {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 },
      );
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  // Forward user info to downstream server handlers via request headers.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.userId as string);
  requestHeaders.set("x-user-email", session.email as string);
  requestHeaders.set("x-user-role", session.role as string);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
