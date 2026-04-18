import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
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
    return NextResponse.json({ error: "Missing path" }, { status: 400 });
  }

  // Ensure the path belongs to the requesting user
  if (!path.startsWith(`${user.id}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();

  // Check the file still exists before issuing a signed URL.
  // Recordings are auto-deleted after 30 days, so this can legitimately return nothing.
  const lastSlash = path.lastIndexOf("/");
  const dir = path.slice(0, lastSlash);
  const filename = path.slice(lastSlash + 1);
  const { data: listed } = await admin.storage.from("speaking-recordings").list(dir, {
    search: filename,
  });
  if (!listed?.length) {
    return NextResponse.json({ expired: true }, { status: 404 });
  }

  const { data, error } = await admin.storage
    .from("speaking-recordings")
    .createSignedUrl(path, 300); // 5 minutes

  if (error || !data) {
    return NextResponse.json({ error: "Failed to create signed URL" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
