"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import LoginPage from "./login/page";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setLoggedIn(true);
        router.replace("/displays");
      } else {
        setLoggedIn(false);
      }
      setChecking(false);
    });
  }, [router]);

  if (checking) return null;

  if (!loggedIn) return <LoginPage />;

  return null;
}
