import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./SupabaseClient";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (mounted) {
        setUser(user);
        setLoading(false);
      }
    });

    const { subscription } = supabase.auth.onAuthStateChange((_event, session) => {
  setUser(session?.user ?? null);
});

return () => {
  if (subscription?.unsubscribe) {
    subscription.unsubscribe();
  }
};

  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
