"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/app/providers";
import { useRouter } from "next/navigation";

export function TopBar({ title, subtitle, onMenuClick }) {
  const router = useRouter();
  const supabase = useSupabase();

  const [user, setUser] = useState(undefined); // undefined = loading
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Carica utente + listener per aggiornamenti
  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      if (mounted) setUser(data?.user || null);
    }

    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (mounted) setUser(session?.user || null);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  // Chiudi dropdown cliccando fuori
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  // Avatar
  const Avatar = () => {
    if (user === undefined) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />
      );
    }

    const letter =
      user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
      user?.email?.charAt(0)?.toUpperCase() ||
      "?";

    return (
      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
        {letter}
      </div>
    );
  };

  return (
    <header className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-800 bg-slate-950">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-700"
        >
          ☰
        </button>

        <div>
          <h1 className="text-base md:text-lg font-semibold">{title}</h1>
          <p className="text-[10px] md:text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>

      {/* Right */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-2 md:px-3 py-2 rounded-lg hover:bg-slate-900 transition"
        >
          <Avatar />

          {/* Nome utente */}
          <span className="hidden sm:block text-sm text-slate-300">
            {user === undefined
              ? ""
              : user?.user_metadata?.name || user?.email || ""}
          </span>
        </button>

        {/* Dropdown */}
        {open && user && (
          <div className="absolute right-0 mt-2 w-44 md:w-48 bg-slate-900 border border-slate-700 rounded-lg shadow-xl p-2 z-50">
            <div className="px-3 py-2">
              <div className="text-sm font-semibold text-slate-100">
                {user?.user_metadata?.name || user?.email}
              </div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-slate-800 rounded-md"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
