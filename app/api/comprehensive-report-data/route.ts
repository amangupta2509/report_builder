import { NextResponse } from "next/server";

function deprecatedResponse() {
  return NextResponse.json(
    {
      error:
        "This legacy endpoint has been retired. Use /api/patients-data for persisted report data.",
    },
    { status: 410 },
  );
}

export async function GET() {
  return deprecatedResponse();
}

export async function POST() {
  return deprecatedResponse();
}
