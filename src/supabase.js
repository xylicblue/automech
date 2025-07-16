import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // Get from .env file
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // Get from .env file

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Supabase URL or Anon Key not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
  );
  // You might want to throw an error or handle this more gracefully depending on your app's needs
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
