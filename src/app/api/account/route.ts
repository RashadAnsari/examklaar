import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function DELETE() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    console.warn("[account] Unauthorized delete request");
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[account] Failed to delete user=%s:", user.id, error.message);
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
