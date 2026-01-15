"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const supabase = useSupabase();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setSession(data.session);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-400">
        Verifica sessione...
      </div>
    );
  }

  return children;
}
