import { randomUUID } from "crypto";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const filename = searchParams.get("filename") ?? "upload";
  const contentType = searchParams.get("contentType") ?? "application/octet-stream";

  const ext = path.extname(filename).toLowerCase() || "";
  const key = `invitations/${session.user.id}/${randomUUID()}${ext}`;

  const workerUrl = process.env.R2_WORKER_URL;
  const uploadToken = process.env.R2_UPLOAD_SECRET;

  if (!workerUrl || !uploadToken) {
    return NextResponse.json({ error: "Upload not configured" }, { status: 503 });
  }

  return NextResponse.json({
    uploadUrl: `${workerUrl}/${key}`,
    uploadToken,
    publicUrl: `${workerUrl}/${key}`,
    contentType,
  });
}
