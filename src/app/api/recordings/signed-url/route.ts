import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { RecordingsRepository } from "@/lib/repositories/recordingsRepository";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
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

  const recordings = new RecordingsRepository(createAdminClient());

  // Check the file still exists before issuing a signed URL.
  // Recordings are auto-deleted after 30 days, so this can legitimately return nothing.
  const lastSlash = path.lastIndexOf("/");
  const dir = path.slice(0, lastSlash);
  const filename = path.slice(lastSlash + 1);
  const listed = await recordings.findInDir(dir, filename);
  if (!listed.length) {
    console.warn(
      "[signed-url] File not found when attempting to create signed URL — user=%s path=%s",
      user.id,
      path
    );
    return NextResponse.json({ expired: true }, { status: 404 });
  }

  const { data, error } = await recordings.createSignedUrl(path, 300); // 5 minutes

  if (error || !data) {
    console.error(
      "[signed-url] Failed to create signed URL — user=%s path=%s error=%o",
      user.id,
      path,
      error
    );
    return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
