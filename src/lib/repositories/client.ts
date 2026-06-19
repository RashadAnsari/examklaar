import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The Supabase client a repository operates through. Repositories take the
 * client as a constructor argument so the caller decides the auth context:
 * the cookie-scoped server client (RLS enforced, for the current user) or the
 * service-role admin client (RLS bypassed, for trusted server-side writes).
 */
export type DbClient = SupabaseClient;
