import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { writeFileSync } = await import("fs");
    writeFileSync("test-hit.txt", "HIT AT " + new Date().toISOString() + " PATH: " + req.nextUrl.pathname);
    const { auth } = await import("@/lib/auth");
    const { toNextJsHandler } = await import("better-auth/next-js");
    const { GET: authGET } = toNextJsHandler(auth);
    return await authGET(req);
  } catch (err: any) {
    console.error("LAZY GET ERROR:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const { toNextJsHandler } = await import("better-auth/next-js");
    const { POST: authPOST } = toNextJsHandler(auth);
    return await authPOST(req);
  } catch (err: any) {
    console.error("LAZY POST ERROR:", err);
    return NextResponse.json({ error: err.message, stack: err.stack }, { status: 500 });
  }
}
