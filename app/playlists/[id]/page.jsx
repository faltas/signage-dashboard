"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  if (!id) return null;

  const supabase = useSupabase();

  // Layout
  const [menuOpen, setMenuOpen] = useState(false);

  // Dati playlist
  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal picker
  const [showAddModal, setShowAddModal] = useState(false);

  // Stato navigazione picker
  const [pickerFolderId, setPickerFolderId] = useState(null); // null = Root
  const [pickerFolders, setPickerFolders] = useState([]); // cartelle del livello corrente
  const [pickerContents, setPickerContents] = useState([]); // contenuti della cartella corrente
  const [pickerPath, setPickerPath] = useState([]); // [{id, name}]
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSort, setPickerSort] = useState("name-asc");
  const [pickerLoading, setPickerLoading] = useState(false);

  async function loadData() {
    setLoading(true);

    const { data: pl } = await supabase
      .from("playlists")
      .select("*")
      .eq("id", id)
      .single();
    setPlaylist(pl);

    const { data: it } = await supabase
      .from("playlist_items")
      .select("*, contents(*)")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    setItems(it || []);
    setLoading(false);
  }

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  // -------- Picker: caricamento dati per cartella corrente --------
  async function loadPickerData(folderId, search, sortKey) {
    setPickerLoading(true);

    let foldersQuery = supabase
      .from("content_folders")
      .select("*")
      .order("name", { ascending: true });

    if (folderId) {
      foldersQuery = foldersQuery.eq("parent_id", folderId);
    } else {
      foldersQuery = foldersQuery.is("parent_id", null);
    }

    const { data: f } = await foldersQuery;

    let c = [];
    if (folderId) {
      const { data: contentsData } = await supabase
        .from("contents")
        .select("*")
        .eq("folder", folderId)
        .order("created_at", { ascending: false });
      c = contentsData || [];
    }

    let filteredFolders = f || [];
    let filteredContents = c || [];

    if (search && search.trim()) {
      const s = search.toLowerCase();
      filteredFolders = filteredFolders.filter((folder) =>
        (folder.name || "").toLowerCase().includes(s)
      );
      filteredContents = filteredContents.filter((content) =>
        (content.name || "").toLowerCase().includes(s)
      );
    }

    function sortArrays(arr, key, asc = true) {
      return [...arr].sort((a, b) => {
        const va = (a[key] || "").toString().toLowerCase();
        const vb = (b[key] || "").toString().toLowerCase();
        if (va < vb) return asc ? -1 : 1;
        if (va > vb) return asc ? 1 : -1;
        return 0;
      });
    }

    if (sortKey === "name-asc") {
      filteredFolders = sortArrays(filteredFolders, "name", true);
      filteredContents = sortArrays(filteredContents, "name", true);
    } else if (sortKey === "name-desc") {
      filteredFolders = sortArrays(filteredFolders, "name", false);
      filteredContents = sortArrays(filteredContents, "name", false);
    } else if (sortKey === "date-desc") {
      filteredContents = [...filteredContents].sort((a, b) => {
        const da = new Date(a.created_at || 0).getTime();
        const db = new Date(b.created_at || 0).getTime();
        return db - da;
      });
    } else if (sortKey === "type-asc") {
      filteredContents = sortArrays(filteredContents, "type", true);
    }

    setPickerFolders(filteredFolders);
    setPickerContents(filteredContents);
    setPickerLoading(false);
  }

  useEffect(() => {
    if (!showAddModal) return;
    loadPickerData(pickerFolderId, pickerSearch, pickerSort);
  }, [showAddModal, pickerFolderId, pickerSearch, pickerSort]);

  function openPickerRoot() {
    setPickerFolderId(null);
    setPickerPath([]);
  }

  function openPickerFolder(folder) {
    setPickerFolderId(folder.id);
    setPickerPath((prev) => [...prev, { id: folder.id, name: folder.name }]);
  }

  function goToPathIndex(index) {
    if (index < 0) {
      setPickerFolderId(null);
      setPickerPath([]);
      return;
    }

    const target = pickerPath[index];
    setPickerFolderId(target.id);
    setPickerPath(pickerPath.slice(0, index + 1));
  }

  async function addContentToPlaylist(contentId) {
    const newPosition = items.length;

    await supabase.from("playlist_items").insert({
      playlist_id: id,
      content_id: contentId,
      position: newPosition,
      duration_seconds: 10,
    });

    setShowAddModal(false);
    setPickerFolderId(null);
    setPickerPath([]);
    setPickerSearch("");
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
              {/* HEADER */}
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
                  onClick={() => {
                    setShowAddModal(true);
                    openPickerRoot();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/40 transition"
                >
                  + Aggiungi contenuto
                </button>
              </div>

              {/* DRAG & DROP LIST */}
              <DragDropContext onDragEnd={reorderItems}>
                <Droppable droppableId="playlist">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-3 mt-4"
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
                              className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition shadow-sm"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                                  {item.contents.type === "immagine" ? (
                                    <img
                                      src={item.contents.url}
                                      className="max-w-full max-h-full object-cover"
                                    />
                                  ) : item.contents.type === "video" ? (
                                    <video
                                      src={item.contents.url}
                                      className="max-w-full max-h-full object-cover"
                                      muted
                                      loop
                                    />
                                  ) : (
                                    <span className="text-[11px] text-slate-500 uppercase">
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
                                className="text-[11px] text-red-400 hover:text-red-300 transition"
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

      {/* MODAL FILE PICKER */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-full max-w-3xl bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl shadow-black/40">
            {/* HEADER MODAL */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Aggiungi contenuto</div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Seleziona una cartella e poi un contenuto da aggiungere alla playlist.
                </div>
              </div>

              <button
                onClick={() => {
                  setShowAddModal(false);
                  openPickerRoot();
                  setPickerSearch("");
                }}
                className="text-slate-500 hover:text-slate-200 text-lg"
              >
                ✕
              </button>
            </div>

            {/* TOOLBAR: BREADCRUMB + SEARCH + SORT */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              {/* Breadcrumb */}
              <div className="flex items-center flex-wrap gap-1 text-xs text-slate-400">
                <button
                  onClick={openPickerRoot}
                  className={`px-2 py-1 rounded hover:bg-slate-800 ${
                    !pickerFolderId && pickerPath.length === 0
                      ? "bg-slate-800 text-slate-100"
                      : "text-slate-300"
                  }`}
                >
                  Root
                </button>

                {pickerPath.map((segment, index) => (
                  <div key={segment.id} className="flex items-center gap-1">
                    <span className="text-slate-600">›</span>
                    <button
                      onClick={() => goToPathIndex(index)}
                      className={`px-2 py-1 rounded hover:bg-slate-800 ${
                        index === pickerPath.length - 1
                          ? "bg-slate-800 text-slate-100"
                          : "text-slate-300"
                      }`}
                    >
                      {segment.name}
                    </button>
                  </div>
                ))}
              </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Cerca per nome..."
                  className="bg-slate-900 text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <select
                  value={pickerSort}
                  onChange={(e) => setPickerSort(e.target.value)}
                  className="bg-slate-900 text-xs px-2 py-1.5 rounded-lg border border-slate-700"
                >
                  <option value="name-asc">Nome (A-Z)</option>
                  <option value="name-desc">Nome (Z-A)</option>
                  <option value="date-desc">Più recenti</option>
                  <option value="type-asc">Tipo</option>
                </select>
              </div>
            </div>

            {/* CONTENUTO MODAL */}
            {pickerLoading ? (
              <div className="text-sm text-slate-500 mt-4">Caricamento...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)] gap-4 mt-3">
                {/* COLONNA SINISTRA: CARTELLE */}
                <div>
                  <div className="text-xs text-slate-400 mb-2">Cartelle</div>
                  {pickerFolders.length === 0 ? (
                    <div className="text-[12px] text-slate-600 italic">
                      Nessuna cartella in questa posizione.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {pickerFolders.map((f) => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => openPickerFolder(f)}
                          className="cursor-pointer flex flex-col items-center p-3 rounded-xl hover:bg-slate-900/60 transition select-none group"
                        >
                          <div className="w-14 h-10 bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg shadow-md border border-blue-300 group-hover:scale-105 transition-transform" />
                          <div className="text-[12px] text-slate-200 truncate w-full text-center mt-2">
                            {f.name}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLONNA DESTRA: CONTENUTI DELLA CARTELLA CORRENTE */}
                <div>
                  <div className="text-xs text-slate-400 mb-2">
                    {pickerFolderId
                      ? "Contenuti nella cartella selezionata"
                      : "Seleziona una cartella per vedere i contenuti"}
                  </div>

                  {!pickerFolderId ? (
                    <div className="text-[12px] text-slate-600 italic">
                      Nessuna cartella selezionata.
                    </div>
                  ) : pickerContents.length === 0 ? (
                    <div className="text-[12px] text-slate-600 italic">
                      Nessun contenuto in questa cartella.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-2">
                      {pickerContents.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => addContentToPlaylist(c.id)}
                          className="w-full text-left px-3 py-2 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition flex items-center gap-4"
                        >
                          <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex items-center justify-center shadow-inner">
                            {c.type === "immagine" ? (
                              <img
                                src={c.url}
                                className="max-w-full max-h-full object-cover"
                              />
                            ) : c.type === "video" ? (
                              <video
                                src={c.url}
                                className="max-w-full max-h-full object-cover"
                                muted
                                loop
                              />
                            ) : (
                              <span className="text-[11px] text-slate-500 uppercase">
                                {c.type}
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="text-sm font-medium truncate max-w-[200px]">
                              {c.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {c.type}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
