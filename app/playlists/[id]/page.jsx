"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  if (!id) return null;

  const [ready, setReady] = useState(false);

  // 🔐 Protezione login
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/login");
      } else {
        setReady(true);
      }
    });
  }, [router]);

  // ⛔ Finché non sappiamo se l’utente è loggato, NON renderizziamo nulla
  if (!ready) return null;

  // 🔽 Stato locale della pagina
  const [menuOpen, setMenuOpen] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // 📡 Caricamento dati playlist
  async function loadData() {
    setLoading(true);

    // 1) playlist
    const { data: pl } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", id)
      .single();

    setPlaylist(pl);

    // 2) contenuti disponibili
    const { data: cts } = await supabase
      .from("contents")
      .select("*")
      .order("created_at", { ascending: false });

    setContents(cts || []);

    // 3) items playlist
    const { data: it } = await supabase
      .from("playlist_items")
      .select("*, contents(*)")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    setItems(it || []);

    setLoading(false);
  }

  // 🔄 Caricamento SOLO dopo ready
  useEffect(() => {
    if (!ready || !id) return;
    loadData();
  }, [ready, id]);

  async function addContentToPlaylist(contentId) {
    const newPosition = items.length;

    await supabase.from("playlist_items").insert({
      playlist_id: id,
      content_id: contentId,
      position: newPosition,
      duration_seconds: 10,
    });

    setShowAddModal(false);
    loadData();
  }

  async function reorderItems(result) {
    if (!result.destination) return;

    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updated = reordered.map((item, index) => ({
      ...item,
      position: index,
    }));

    setItems(updated);

    for (const item of updated) {
      await supabase
        .from("playlist_items")
        .update({ position: item.position })
        .eq("id", item.id);
    }
  }

  async function removeItem(itemId) {
    await supabase.from("playlist_items").delete().eq("id", itemId);
    loadData();
  }

  function totalDuration() {
    return items.reduce((acc, i) => acc + (i.duration_seconds || 0), 0);
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title={playlist?.name || "Playlist"}
          subtitle="Modifica contenuti e ordine di riproduzione"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6 space-y-6">
          {loading ? (
            <div className="text-sm text-slate-500">Caricamento...</div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                    Contenuti nella playlist
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Durata totale: {totalDuration()} secondi
                  </div>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/40"
                >
                  + Aggiungi contenuto
                </button>
              </div>

              {/* Drag & Drop */}
              <DragDropContext onDragEnd={reorderItems}>
                <Droppable droppableId="playlist">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3"
                    >
                      {items.map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                                  {item.contents.type === "immagine" ? (
                                    <img
                                      src={item.contents.url}
                                      className="max-w-full max-h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] text-slate-500">
                                      {item.contents.type}
                                    </span>
                                  )}
                                </div>

                                <div>
                                  <div className="text-sm font-medium">
                                    {item.contents.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Durata: {item.duration_seconds}s
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-[11px] text-red-400 hover:text-red-300"
                              >
                                Elimina
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}

                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </>
          )}
        </main>
      </div>

      {/* Modal aggiunta contenuto */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Aggiungi contenuto</div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-500 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {contents.map((c) => (
                <button
                  key={c.id}
                  onClick={() => addContentToPlaylist(c.id)}
                  className="w-full text-left px-3 py-2 rounded-lg border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-colors flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center">
                    {c.type === "immagine" ? (
                      <img
                        src={c.url}
                        className="max-w-full max-h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-slate-500">
                        {c.type}
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-slate-500">{c.type}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
