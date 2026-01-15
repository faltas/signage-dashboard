"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const SupabaseContext = createContext(null);

export function SupabaseProvider({ children }) {
  // Use a state that starts as undefined to avoid hydration mismatch
  const [supabase, setSupabase] = useState(undefined);
  
  useEffect(() => {
    const client = createSupabaseBrowserClient();
    if (client) {
      setSupabase(client);
    } else {
      setSupabase(null);
    }
  }, []);

  // While initializing, return a loading state or the children if you handle null in hooks
  if (supabase === undefined) return null;

  if (supabase === null) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="glass-premium p-10 rounded-[2.5rem] max-w-md space-y-6 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
          <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-foreground tracking-tighter">Connection Required</h2>
          <p className="text-muted-foreground font-medium">Please configure your <span className="text-primary">Supabase credentials</span> in the Replit Secrets tab to enable cloud orchestration.</p>
          <div className="pt-4">
             <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Missing variables:</div>
             <div className="flex flex-wrap justify-center gap-2">
                <code className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-rose-300 border border-white/5">NEXT_PUBLIC_SUPABASE_URL</code>
                <code className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-rose-300 border border-white/5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={supabase}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  return useContext(SupabaseContext);
}
