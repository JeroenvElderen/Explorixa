// src/hooks/useSupabaseUser.js
import { useEffect, useState } from "react";
import { supabase } from "../SupabaseClient";

export default function useSupabaseUser() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);
  return user;
}
