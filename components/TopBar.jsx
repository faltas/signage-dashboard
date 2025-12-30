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

  // Carica utente + listener
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

  // Avatar premium
  const Avatar = () => {
    if (user === undefined) {
      return (
        <div className="w-9 h-9 rounded-full bg-slate-200 animate-pulse" />
      );
    }

    const letter =
      user?.user_metadata?.name?.charAt(0)?.toUpperCase() ||
      user?.email?.charAt(0)?.toUpperCase() ||
      "?";

    return (
      <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-sm">
        {letter}
      </div>
    );
  };

  return (
    <header
      className="
        flex items-center justify-between
        px-4 md:px-8 py-4
        bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))]
        backdrop-blur-xl
        border-b border-slate-200
        shadow-sm
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="
            md:hidden p-2 rounded-xl
            bg-white border border-slate-300
            shadow-sm hover:bg-slate-100 transition
          "
        >
          ☰
        </button>

        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            {subtitle}
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="
            flex items-center gap-3 px-3 py-2
            rounded-xl bg-white border border-slate-300
            shadow-sm hover:bg-slate-100 transition
          "
        >
          <Avatar />

          {/* Nome utente */}
          <span className="hidden sm:block text-sm font-semibold text-slate-700">
            {user === undefined
              ? ""
              : user?.user_metadata?.name || user?.email || ""}
          </span>
        </button>

        {/* DROPDOWN PREMIUM */}
        {open && user && (
          <div
            className="
              absolute right-0 mt-3 w-52
              bg-white border border-slate-200
              rounded-xl shadow-xl
              backdrop-blur-xl
              p-3 z-50
            "
          >
            <div className="px-2 py-2 border-b border-slate-200">
              <div className="text-sm font-bold text-slate-900">
                {user?.user_metadata?.name || user?.email}
              </div>
              <div className="text-xs text-slate-500">
                {user?.email}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="
                w-full text-left px-3 py-2 mt-2
                text-sm font-semibold text-red-600
                rounded-lg hover:bg-red-50 transition
              "
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
