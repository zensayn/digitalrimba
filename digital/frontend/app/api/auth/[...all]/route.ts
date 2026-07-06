import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const { toNextJsHandler } = await import("better-auth/next-js");
    const { GET: authGET } = toNextJsHandler(auth);
    return await authGET(req);
  } catch (err: unknown) {
    console.error("auth GET error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { auth } = await import("@/lib/auth");
    const { toNextJsHandler } = await import("better-auth/next-js");
    const { POST: authPOST } = toNextJsHandler(auth);
    return await authPOST(req);
  } catch (err: unknown) {
    console.error("auth POST error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
