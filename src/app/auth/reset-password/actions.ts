"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function resetPassword(password: string): Promise<{ error: string | null }> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();
  if (sessionError || !user) {
    return { error: "Invalid or expired reset link. Please request a new one." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(user.id, { password });
  return { error: error?.message ?? null };
}
