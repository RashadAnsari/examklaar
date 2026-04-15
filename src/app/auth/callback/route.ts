import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] Failed to exchange code for session:", error.message);
    }
  }

  const raw = searchParams.get("next") ?? "/dashboard";
  // Reject protocol-relative (//evil.com) and absolute URLs — only allow
  // paths that start with "/" but not "//".
  const next = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/dashboard";
  redirect(next);
}
