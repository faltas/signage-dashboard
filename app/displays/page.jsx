"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DisplayPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/login");
    });
  }, []);

export default function DisplaysPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadDisplays() {
    setLoading(true);

    const { data } = await supabase
      .from("displays")
      .select("*, playlists(name)")
      .order("name", { ascending: true });

    setDisplays(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadDisplays();

    const channel = supabase
      .channel("displays-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "displays" },
        () => loadDisplays()
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

function IsOnline(status) {
  if (status === "on") return "bg-green-500";
  if (status === "off") return "bg-red-500";
  if (status === "mgmt") return "bg-orange-500";
  return "bg-gray-500";
}


  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Display"
          subtitle="Gestisci i display connessi e invia comandi in tempo reale"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6">
          <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500 mb-4">
            Tutti i display
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Caricamento...</div>
          ) : displays.length === 0 ? (
            <div className="text-sm text-slate-500 mt-10 text-center">
              Nessun display registrato.
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {displays.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">{d.name}</div>
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        IsOnline(d.status)
                      }`}
                    />
                  </div>

                  <div className="text-xs text-slate-500">
                    Playlist:{" "}
                    {d.playlists?.name || (
                      <span className="text-slate-600">Nessuna</span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    Ultimo contatto:{" "}
                    {d.last_seen_at
                      ? new Date(d.last_seen_at).toLocaleString()
                      : "Mai"}
                  </div>

                  <Link
                    href={`/displays/${d.id}`}
                    className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900 border border-slate-700 text-slate-100 hover:bg-slate-800 text-center"
                  >
                    Dettagli
                  </Link>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
