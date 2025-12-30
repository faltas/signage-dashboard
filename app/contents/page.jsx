"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export default function ContentsPage() {
  const router = useRouter();
  const supabase = useSupabase();

  const [menuOpen, setMenuOpen] = useState(false);
  const [contents, setContents] = useState([]);
  const [folders, setFolders] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [newFolderName, setNewFolderName] = useState("");

  const lastClickRef = useRef(null);

  const currentFolder = currentFolderId
    ? folders.find((f) => f.id === currentFolderId) || null
    : null;

  async function loadFolders() {
    const { data } = await supabase
      .from("content_folders")
      .select("*")
      .order("name", { ascending: true });

    setFolders(data || []);
  }

  async function loadContents() {
    setLoading(true);

    if (!currentFolderId) {
      setContents([]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("contents")
      .select("*")
      .eq("folder", currentFolderId)
      .order("created_at", { ascending: false });

    setContents(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadFolders();
  }, []);

  useEffect(() => {
    loadContents();
  }, [currentFolderId]);

  function openFolder(folderId) {
    setCurrentFolderId(folderId);
  }

  function goRoot() {
    setCurrentFolderId(null);
  }

  function handleFolderClick(folderId) {
    const now = Date.now();
    if (lastClickRef.current && now - lastClickRef.current < 300) {
      openFolder(folderId);
    }
    lastClickRef.current = now;
  }

  async function createFolder() {
    if (!newFolderName.trim()) return;

    await supabase.from("content_folders").insert({
      name: newFolderName.trim(),
    });

    setNewFolderName("");
    loadFolders();
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !currentFolderId) return;

    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${Date.now()}-${file.name}`;
      const contentType = file.type || "application/octet-stream";

      const { data: storageData } = await supabase.storage
        .from("contents")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });

      const {
        data: { publicUrl },
      } = supabase.storage.from("contents").getPublicUrl(storageData.path);

      let type = "altro";
      if (contentType.startsWith("image/")) type = "immagine";
      else if (contentType.startsWith("video/")) type = "video";
      else if (contentType === "application/pdf") type = "documento";
      else if (ext === "html") type = "html";

      await supabase.from("contents").insert({
        name: file.name,
        type,
        url: publicUrl,
        size_bytes: file.size,
        folder: currentFolderId,
      });

      setFile(null);
      loadContents();
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id, url) {
    if (!confirm("Sei sicuro di voler eliminare questo contenuto?")) return;

    try {
      const parts = url.split("/contents/");
      if (parts[1]) {
        await supabase.storage.from("contents").remove([parts[1]]);
      }
    } catch {}

    await supabase.from("contents").delete().eq("id", id);
    setContents((prev) => prev.filter((c) => c.id !== id));
  }

  const showUpload = currentFolderId !== null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Contenuti"
          subtitle="File manager per i tuoi media"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6 space-y-6">

          {/* HEADER */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                File system
              </div>

              <div className="text-xs text-slate-500 mt-1">
                {!currentFolderId
                  ? `${folders.length} cartelle in Root`
                  : `${contents.length} elementi`}
              </div>

              {/* BREADCRUMB */}
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-2">
                <button
                  onClick={goRoot}
                  className={`px-2 py-1 rounded hover:bg-slate-800 ${
                    !currentFolderId ? "bg-slate-800 text-slate-100" : "text-slate-300"
                  }`}
                >
                  Root
                </button>

                {currentFolder && (
                  <>
                    <span className="text-slate-600">›</span>
                    <span className="px-2 py-1 rounded bg-slate-800 text-slate-100">
                      {currentFolder.name}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="px-3 py-1.5 text-xs bg-slate-900 rounded-full border border-slate-700 hover:border-slate-400 hover:bg-slate-800 transition"
            >
              {viewMode === "grid" ? "Vista lista" : "Vista griglia"}
            </button>
          </div>

          {/* CARTELLE HEADER + CREA CARTELLA INLINE */}
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-slate-400">Cartelle</div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Nuova cartella…"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="bg-slate-900 text-xs px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />

              <button
                onClick={createFolder}
                disabled={!newFolderName.trim()}
                className="px-2 py-1 text-xs bg-indigo-500 hover:bg-indigo-400 rounded-lg text-white disabled:bg-slate-700 disabled:text-slate-400"
              >
                +
              </button>
            </div>
          </div>

          {/* CARTELLE (solo in Root) */}
          {!currentFolderId && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
              {folders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleFolderClick(f.id)}
                  onDoubleClick={() => openFolder(f.id)}
                  className="cursor-pointer flex flex-col items-center p-3 rounded-xl hover:bg-slate-900/60 transition select-none group"
                >
                  <div className="w-14 h-10 sm:w-16 sm:h-12 bg-gradient-to-b from-blue-400 to-blue-500 rounded-lg shadow-md border border-blue-300 group-hover:scale-105 transition-transform" />
                  <div className="text-[12px] sm:text-xs text-slate-200 truncate w-full text-center mt-2">
                    {f.name}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* UPLOAD (solo dentro una cartella) */}
          {showUpload && (
            <form
              onSubmit={handleUpload}
              className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 px-4 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div>
                <div className="text-sm font-medium">Carica nuovo contenuto</div>
                <div className="text-xs text-slate-500 mt-1">
                  Verrà salvato in:{" "}
                  <span className="text-slate-200 font-semibold">
                    {currentFolder?.name}
                  </span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
                />
                <button
                  type="submit"
                  disabled={!file || uploading}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-400 text-white shadow-lg shadow-indigo-500/40"
                >
                  {uploading ? "Caricamento..." : "Carica"}
                </button>
              </div>
            </form>
          )}

          {/* CONTENUTI (solo dentro una cartella) */}
          {currentFolderId && (
            <>
              {loading ? (
                <div className="text-sm text-slate-500">Caricamento contenuti...</div>
              ) : contents.length === 0 ? (
                <div className="mt-10 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                  <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-500 text-xl">
                    📁
                  </div>
                  Nessun contenuto in questa cartella.
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {contents.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col hover:bg-slate-900/70 transition"
                    >
                      {c.type === "immagine" ? (
                        <div className="h-40 bg-slate-900 border-b border-slate-800 overflow-hidden flex items-center justify-center">
                          <img
                            src={c.url}
                            alt={c.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="h-40 bg-slate-900 border-b border-slate-800 flex items-center justify-center text-[12px] text-slate-500">
                          Anteprima non disponibile ({c.type})
                        </div>
                      )}

                      <div className="p-3 flex-1 flex flex-col">
                        <div className="text-xs font-medium truncate" title={c.name}>
                          {c.name}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {c.type} • {formatBytes(c.size_bytes)}
                        </div>
                        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-indigo-300 hover:text-indigo-200 underline"
                          >
                            Apri
                          </a>
                          <button
                            onClick={() => handleDelete(c.id, c.url)}
                            className="text-[11px] text-red-400 hover:text-red-300"
                          >
                            Elimina
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {contents.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-xl px-4 py-3 hover:bg-slate-900/60 transition"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center text-[12px] text-slate-400">
                          {c.type === "immagine"
                            ? "IMG"
                            : c.type === "video"
                            ? "VID"
                            : c.type === "documento"
                            ? "PDF"
                            : "FILE"}
                        </div>

                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate max-w-[180px] sm:max-w-[260px]">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {formatBytes(c.size_bytes)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] text-indigo-300 hover:text-indigo-200 underline"
                        >
                          Apri
                        </a>
                        <button
                          onClick={() => handleDelete(c.id, c.url)}
                          className="text-[12px] text-red-400 hover:text-red-300"
                        >
                          Elimina
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
