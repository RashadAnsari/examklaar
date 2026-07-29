import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth-session";
import { recordingExists, recordingSignedUrl } from "@/lib/storage/recordings";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = req.nextUrl.searchParams.get("path");
  if (!path) {
    console.warn("[signed-url] Missing path parameter in request — user=%s", user.id);
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // Ensure the path belongs to the requesting user
  if (!path.startsWith(`${user.id}/`)) {
    console.warn(
      "[signed-url] User attempted to access a path that does not belong to them — user=%s path=%s",
      user.id,
      path
    );
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Check the file still exists before issuing a signed URL.
  // Recordings are auto-deleted after 30 days, so this can legitimately miss.
  if (!(await recordingExists(path))) {
    console.warn(
      "[signed-url] File not found when attempting to create signed URL — user=%s path=%s",
      user.id,
      path
    );
    return NextResponse.json({ expired: true }, { status: 404 });
  }

  try {
    const url = await recordingSignedUrl(path, 300); // 5 minutes
    return NextResponse.json({ url });
  } catch (error) {
    console.error(
      "[signed-url] Failed to create signed URL — user=%s path=%s error=%o",
      user.id,
      path,
      error
    );
    return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
  }
}
