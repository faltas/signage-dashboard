"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const supabase = useSupabase();
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/displays");
      } else {
        router.replace("/login");
      }
      setChecking(false);
    });
  }, [router]);

  // NON renderizziamo LoginPage qui
  return null;
}
