import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.SUPABASE_PUBLIC_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
