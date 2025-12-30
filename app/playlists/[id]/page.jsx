"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function PlaylistDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  if (!id) return null;

  const supabase = useSupabase();

  // Layout
  const [menuOpen, setMenuOpen] = useState(false);

  // Playlist data
  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Picker modal
  const [showAddModal, setShowAddModal] = useState(false);

  // Picker state
  const [pickerFolderId, setPickerFolderId] = useState(null);
  const [pickerFolders, setPickerFolders] = useState([]);
  const [pickerContents, setPickerContents] = useState([]);
  const [pickerPath, setPickerPath] = useState([]);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerSort, setPickerSort] = useState("name-asc");
  const [pickerLoading, setPickerLoading] = useState(false);

  // Load playlist + items
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

  // Picker loader
  async function loadPickerData(folderId, search, sortKey) {
    setPickerLoading(true);

    let foldersQuery = supabase
      .from("content_folders")
      .select("*")
      .order("name", { ascending: true });

    if (folderId) foldersQuery = foldersQuery.eq("parent_id", folderId);
    else foldersQuery = foldersQuery.is("parent_id", null);

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

    if (search?.trim()) {
      const s = search.toLowerCase();
      filteredFolders = filteredFolders.filter((x) =>
        x.name.toLowerCase().includes(s)
      );
      filteredContents = filteredContents.filter((x) =>
        x.name.toLowerCase().includes(s)
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
      filteredContents = [...filteredContents].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
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
      openPickerRoot();
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
    openPickerRoot();
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
    <ProtectedRoute>
      <div
        className="
          flex min-h-screen
          bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))]
          text-slate-900 backdrop-blur-2xl
        "
      >
        <Sidebar />
        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 flex flex-col">
          <TopBar
            title={playlist?.name || "Playlist"}
            subtitle="Modifica contenuti e ordine di riproduzione"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-10 space-y-10">

            {loading ? (
              <div className="text-sm text-slate-500">Caricamento...</div>
            ) : (
              <>
                {/* HEADER */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      Contenuti nella playlist
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      Durata totale: {totalDuration()} secondi
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      openPickerRoot();
                    }}
                    className="
                      px-4 py-2 rounded-xl text-sm font-semibold
                      bg-indigo-500 text-white shadow-md shadow-indigo-200/50
                      hover:bg-indigo-600 transition
                    "
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
                        className="space-y-4 mt-6"
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
                                className="
                                  flex items-center justify-between
                                  p-4 rounded-2xl border border-slate-200
                                  bg-white/90 shadow-sm
                                  hover:shadow-lg hover:shadow-slate-200/60
                                  transition-all
                                "
                              >
                                <div className="flex items-center gap-4">
                                  <div className="
                                    w-14 h-14 rounded-xl bg-slate-100
                                    overflow-hidden flex items-center justify-center
                                    shadow-inner
                                  ">
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
                                      <span className="text-xs text-slate-500 uppercase">
                                        {item.contents.type}
                                      </span>
                                    )}
                                  </div>

                                  <div>
                                    <div className="text-base font-semibold text-slate-900">
                                      {item.contents.name}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                      Durata: {item.duration_seconds}s
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="
                                    text-sm font-semibold text-red-600
                                    hover:text-red-700 transition
                                  "
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

        {/* MODAL PICKER */}
        {showAddModal && (
          <div className="
            fixed inset-0 bg-black/40 backdrop-blur-md
            flex items-center justify-center z-50
          ">
            <div className="
              w-full max-w-4xl bg-white rounded-2xl border border-slate-200
              p-6 shadow-2xl space-y-6
            ">
              {/* HEADER */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-bold text-slate-900">
                    Aggiungi contenuto
                  </div>
                  <div className="text-sm text-slate-500">
                    Seleziona una cartella e poi un contenuto.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowAddModal(false);
                    openPickerRoot();
                    setPickerSearch("");
                  }}
                  className="text-slate-500 hover:text-slate-700 text-xl"
                >
                  ✕
                </button>
              </div>

              {/* TOOLBAR */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Breadcrumb */}
                <div className="flex items-center flex-wrap gap-2 text-sm text-slate-600">
                  <button
                    onClick={openPickerRoot}
                    className={`
                      px-3 py-1.5 rounded-lg transition
                      ${
                        !pickerFolderId && pickerPath.length === 0
                          ? "bg-slate-200 text-slate-900"
                          : "hover:bg-slate-100"
                      }
                    `}
                  >
                    Root
                  </button>

                  {pickerPath.map((segment, index) => (
                    <div key={segment.id} className="flex items-center gap-2">
                      <span className="text-slate-400">›</span>
                      <button
                        onClick={() => goToPathIndex(index)}
                        className={`
                          px-3 py-1.5 rounded-lg transition
                          ${
                            index === pickerPath.length - 1
                              ? "bg-slate-200 text-slate-900"
                              : "hover:bg-slate-100"
                          }
                        `}
                      >
                        {segment.name}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Search + Sort */}
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                    placeholder="Cerca..."
                    className="
                      bg-white border border-slate-300 rounded-xl
                      px-3 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-300
                    "
                  />

                  <select
                    value={pickerSort}
                    onChange={(e) => setPickerSort(e.target.value)}
                    className="
                      bg-white border border-slate-300 rounded-xl
                      px-3 py-2 text-sm shadow-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-300
                    "
                  >
                    <option value="name-asc">Nome (A-Z)</option>
                    <option value="name-desc">Nome (Z-A)</option>
                    <option value="date-desc">Più recenti</option>
                    <option value="type-asc">Tipo</option>
                  </select>
                </div>
              </div>

              {/* CONTENT */}
              {pickerLoading ? (
                <div className="text-sm text-slate-500">Caricamento...</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.8fr] gap-6">
                  {/* FOLDERS */}
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">
                      Cartelle
                    </div>

                    {pickerFolders.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Nessuna cartella.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        {pickerFolders.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => openPickerFolder(f)}
                            className="
                              flex flex-col items-center p-3 rounded-xl
                              bg-white border border-slate-200 shadow-sm
                              hover:shadow-md hover:bg-slate-50 transition
                            "
                          >
                            <div className="
                              w-14 h-10 rounded-lg
                              bg-gradient-to-b from-indigo-200 to-indigo-300
                              border border-indigo-100 shadow-sm
                            " />
                            <div className="text-sm font-medium text-slate-900 mt-2 truncate">
                              {f.name}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CONTENTS */}
                  <div>
                    <div className="text-sm font-semibold text-slate-700 mb-2">
                      Contenuti
                    </div>

                    {!pickerFolderId ? (
                      <div className="text-sm text-slate-500 italic">
                        Seleziona una cartella.
                      </div>
                    ) : pickerContents.length === 0 ? (
                      <div className="text-sm text-slate-500 italic">
                        Nessun contenuto.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                        {pickerContents.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => addContentToPlaylist(c.id)}
                            className="
                              w-full flex items-center gap-4 p-3 rounded-xl
                              bg-white border border-slate-200 shadow-sm
                              hover:shadow-md hover:bg-slate-50 transition
                            "
                          >
                            <div className="
                              w-14 h-14 rounded-xl bg-slate-100
                              overflow-hidden flex items-center justify-center
                              shadow-inner
                            ">
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
                                <span className="text-xs text-slate-500 uppercase">
                                  {c.type}
                                </span>
                              )}
                            </div>

                            <div>
                              <div className="text-base font-semibold text-slate-900 truncate max-w-[200px]">
                                {c.name}
                              </div>
                              <div className="text-sm text-slate-500">
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
    </ProtectedRoute>
  );
}
