"use client";

import { createContext, useContext, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  const [supabase] = useState(() => createSupabaseBrowserClient());
  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
