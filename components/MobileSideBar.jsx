"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { href: "/displays", label: "Display", icon: "/icons/display.png" },
  { href: "/playlists", label: "Playlist", icon: "/icons/playlist.png" },
  { href: "/contents", label: "Contenuti", icon: "/icons/folder.png" },
  { href: "/settings", label: "Impostazioni", icon: "/icons/settings.png" },
];

export function MobileSideBar({ open, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden transition-all duration-300
          ${open ? "opacity-100 backdrop-blur-md" : "opacity-0 backdrop-blur-none pointer-events-none"}
          bg-black/40
        `}
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-72 z-50 md:hidden
          transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(245,245,255,0.88))",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "8px 0 25px rgba(0,0,0,0.08)",
        }}
      >
        {/* HEADER */}
        <div className="px-6 py-7 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <img
              src="/icons/logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-xl shadow-md shadow-slate-300/40"
            />
            <div>
              <div className="text-lg font-bold tracking-wide text-slate-900">
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
                onClick={onClose}
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
        <div className="px-4 py-5 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-red-600 hover:bg-red-100 transition"
          >
            <img src="/icons/logout.png" className="w-5 h-5 opacity-90" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
