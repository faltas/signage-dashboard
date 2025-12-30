"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useSupabase } from "@/app/providers";

const menuItems = [
  { href: "/displays", label: "Display", icon: "/icons/display.png" },
  { href: "/playlists", label: "Playlist", icon: "/icons/playlist.png" },
  { href: "/contents", label: "Contenuti", icon: "/icons/folder.png" },
  { href: "/settings", label: "Impostazioni", icon: "/icons/settings.png" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <aside
      className="
        hidden md:flex w-64 h-screen flex-col
        border-r border-slate-200
        bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(250,250,255,0.88))]
        backdrop-blur-xl
        shadow-[4px_0_25px_rgba(0,0,0,0.05)]
      "
    >
      {/* HEADER */}
      <div className="px-6 py-7 border-b border-slate-200/80">
        <div className="flex items-center gap-4">
          <img
            src="/icons/logo.png"
            alt="Logo"
            className="w-10 h-10 rounded-xl shadow-md shadow-slate-300/40"
          />
          <div>
            <div className="text-base font-bold tracking-wide text-slate-900">
              Signage Cloud
            </div>
            <div className="text-sm font-medium text-slate-600">
              Dashboard
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const active = pathname?.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-xl text-base font-semibold
                transition-all duration-200
                ${
                  active
                    ? "bg-gradient-to-r from-white to-indigo-100 border border-indigo-200 text-slate-900 shadow-sm"
                    : "text-slate-700 hover:bg-slate-100 hover:shadow-sm hover:translate-x-1"
                }
              `}
            >
              <img
                src={item.icon}
                alt=""
                className="w-6 h-6 opacity-95"
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="px-4 py-5 border-t border-slate-200/80">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-100 transition"
        >
          <img src="/icons/logout.png" className="w-5 h-5 opacity-90" />
          Logout
        </button>
      </div>
    </aside>
  );
}
