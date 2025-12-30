"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PlaylistsPage() {
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const supabase = useSupabase();

  async function loadPlaylists() {
    setLoading(true);
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setPlaylists(data || []);
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
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))] text-slate-900 backdrop-blur-2xl">
        <Sidebar />
        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 flex flex-col">
          <TopBar
            title="Playlist"
            subtitle="Gestisci le playlist"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-8 space-y-10">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  Tutte le playlist
                </div>
                <div className="text-sm text-slate-500 mt-1">
                  {loading ? "Caricamento..." : `${playlists.length} playlist`}
                </div>
              </div>

              <button
                onClick={() => setShowNewModal(true)}
                className="
                  px-4 py-2 rounded-xl text-sm font-semibold
                  bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                  hover:bg-indigo-600 transition
                "
              >
                + Nuova playlist
              </button>
            </div>

            {/* LISTA PLAYLIST */}
            {loading ? (
              <div className="text-sm text-slate-500">Caricamento playlist...</div>
            ) : playlists.length === 0 ? (
              <div className="text-center text-sm text-slate-500 mt-10">
                Nessuna playlist creata.
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {playlists.map((pl) => (
                  <Link
                    key={pl.id}
                    href={`/playlists/${pl.id}`}
                    className="
                      block p-6 rounded-2xl border border-slate-200 bg-white/90
                      hover:bg-white hover:shadow-xl hover:shadow-slate-200/70
                      transition-all
                    "
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src="/icons/playlist.png"
                        className="w-8 h-8 opacity-90"
                        alt="playlist"
                      />
                      <div className="text-lg font-bold text-slate-900">
                        {pl.name}
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 truncate">
                      {pl.description || "Nessuna descrizione"}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* MODAL NUOVA PLAYLIST */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50">
            <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    Nuova playlist
                  </div>
                  <div className="text-sm text-slate-500">
                    Inserisci nome e descrizione
                  </div>
                </div>

                <button
                  onClick={() => setShowNewModal(false)}
                  className="text-slate-500 hover:text-slate-700 text-xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={createPlaylist} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Nome playlist
                  </label>
                  <input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="
                      w-full rounded-xl bg-white border border-slate-300
                      px-4 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-300
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Descrizione
                  </label>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="
                      w-full rounded-xl bg-white border border-slate-300
                      px-4 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-300
                    "
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="
                      px-4 py-2 rounded-xl text-sm font-semibold
                      bg-white border border-slate-300 text-slate-700
                      hover:bg-slate-100 shadow-sm
                    "
                  >
                    Annulla
                  </button>

                  <button
                    type="submit"
                    className="
                      px-4 py-2 rounded-xl text-sm font-semibold
                      bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                      hover:bg-indigo-600 transition
                    "
                  >
                    Crea playlist
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
