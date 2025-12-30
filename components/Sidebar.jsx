"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const menuItems = [
  { href: "/displays", label: "Display" },
  { href: "/playlists", label: "Playlist" },
  { href: "/contents", label: "Contenuti" },
  { href: "/settings", label: "Impostazioni" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside className="hidden md:flex w-64 h-screen bg-slate-950 border-r border-slate-800 flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500 shadow-lg shadow-indigo-500/40" />
          <div>
            <div className="text-sm font-semibold tracking-wide">
              Signage Cloud
            </div>
            <div className="text-[11px] text-slate-400">Dashboard</div>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors " +
                (active
                  ? "bg-slate-900 border border-slate-700 text-slate-50"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-100")
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

    </aside>
  );
}
