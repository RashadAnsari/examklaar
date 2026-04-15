import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_PUBLIC_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createAdminClient = () =>
  createClient(supabaseUrl!, supabaseKey!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
