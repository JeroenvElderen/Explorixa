// src/utils/auth.js
import { supabase } from "../SupabaseClient";

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user || null;
}
