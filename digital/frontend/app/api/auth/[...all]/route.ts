import { NextRequest, NextResponse } from "next/server";

// Dynamic imports keep lib/auth (pg pool + optional Redis connect) out of the
// build-time module graph.
async function getAuthHandlers() {
  const { auth } = await import("@/lib/auth");
  const { toNextJsHandler } = await import("better-auth/next-js");
  return toNextJsHandler(auth);
}

export async function GET(req: NextRequest) {
  try {
    const { GET: authGET } = await getAuthHandlers();
    return await authGET(req);
  } catch (err: unknown) {
    console.error("auth GET error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { POST: authPOST } = await getAuthHandlers();
    return await authPOST(req);
  } catch (err: unknown) {
    console.error("auth POST error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
