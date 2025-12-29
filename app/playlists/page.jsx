"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import Link from "next/link";

export default function PlaylistsPage() {
		
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setCheckingAuth(false);
      }
    });
  }, [router]);

  if (checkingAuth) {
    return null; // nessun flash della pagina
  }

  const [menuOpen, setMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  async function loadPlaylists() {
    setLoading(true);
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPlaylists(data);
    setLoading(false);
  }

  useEffect(() => {
    loadPlaylists();
  }, []);

  async function createPlaylist(e) {
    e.preventDefault();
    if (!newName.trim()) return;

    const { error } = await supabase.from("playlists").insert({
      name: newName.trim(),
      description: newDescription.trim(),
    });

    if (!error) {
      setShowNewModal(false);
      setNewName("");
      setNewDescription("");
      loadPlaylists();
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Playlist"
          subtitle="Gestisci le playlist e assegnale ai display"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Tutte le playlist
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {loading ? "Caricamento..." : `${playlists.length} playlist`}
              </div>
            </div>

            <button
              onClick={() => setShowNewModal(true)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/40"
            >
              + Nuova playlist
            </button>
          </div>

          {loading ? (
            <div className="text-sm text-slate-500">Caricamento playlist...</div>
          ) : playlists.length === 0 ? (
            <div className="text-center text-sm text-slate-500 mt-10">
              Nessuna playlist creata.
            </div>
          ) : (
            <div className="space-y-3">
              {playlists.map((pl) => (
                <Link
                  key={pl.id}
                  href={`/playlists/${pl.id}`}
                  className="block px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors"
                >
                  <div className="text-sm font-medium">{pl.name}</div>
                  <div className="text-xs text-slate-500 truncate">
                    {pl.description || "Nessuna descrizione"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-semibold">Nuova playlist</div>
                <div className="text-xs text-slate-500">
                  Inserisci nome e descrizione
                </div>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-500 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={createPlaylist} className="space-y-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Nome playlist
                </label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Descrizione
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-slate-900 border border-slate-700"
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg text-xs bg-indigo-500 text-white"
                >
                  Crea playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
