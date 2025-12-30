"use client";

import { useEffect, useRef, useState } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { MobileSideBar } from "@/components/MobileSideBar";
import { TopBar } from "@/components/TopBar";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

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
  const [newFolderName, setNewFolderName] = useState("");

  const lastClickRef = useRef(null);

  const currentFolder = currentFolderId
    ? folders.find((f) => f.id === currentFolderId) || null
    : null;

  async function loadFolders() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("content_folders")
      .select("*")
      .eq("user_id", user.id)
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("contents")
      .select("*")
      .eq("folder", currentFolderId)
      .eq("user_id", user.id)
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("content_folders").insert({
      name: newFolderName.trim(),
      user_id: user.id,
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

      const {
        data: { user },
      } = await supabase.auth.getUser();

      await supabase.from("contents").insert({
        name: file.name,
        type,
        url: publicUrl,
        size_bytes: file.size,
        folder: currentFolderId,
        user_id: user.id,
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
    <ProtectedRoute>
      <div className="flex min-h-screen bg-[linear-gradient(135deg,rgba(255,255,255,0.97),rgba(245,248,255,0.95))] text-slate-900 backdrop-blur-2xl">

        <div className="hidden md:block w-64 fixed top-0 left-0 h-screen">
          <Sidebar />
        </div>

        <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

        <div className="flex-1 md:pl-64 flex flex-col">
          <TopBar
            title="Contenuti"
            subtitle="File manager premium per i tuoi media"
            onMenuClick={() => setMenuOpen(true)}
          />

          <main className="flex-1 px-6 md:px-10 py-8 space-y-10">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">
                  File system
                </div>

                <div className="text-sm md:text-base text-slate-500 mt-1">
                  {!currentFolderId
                    ? `${folders.length} cartelle in Root`
                    : `${contents.length} elementi`}
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-600">
                  <button
                    onClick={goRoot}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-semibold transition ${
                      !currentFolderId
                        ? "bg-white shadow-sm border-slate-300 text-slate-900"
                        : "bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    Root
                  </button>

                  {currentFolder && (
                    <>
                      <span className="text-slate-400">›</span>
                      <span className="px-3 py-1.5 rounded-lg bg-white shadow-sm border border-slate-300 text-slate-900">
                        {currentFolder.name}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="px-4 py-2 text-sm md:text-base font-semibold bg-white border border-slate-300 rounded-xl shadow-sm hover:bg-slate-100 transition"
              >
                {viewMode === "grid" ? "Vista lista" : "Vista griglia"}
              </button>
            </div>

            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-slate-600">
                Cartelle
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nuova cartella…"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="bg-white text-sm md:text-base px-3 py-2 rounded-lg border border-slate-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 text-slate-900 placeholder-slate-400"
                />

                <button
                  onClick={createFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 text-sm md:text-base font-bold bg-indigo-500 hover:bg-indigo-600 rounded-lg text-white shadow-md disabled:bg-slate-300 disabled:text-slate-500"
                >
                  +
                </button>
              </div>
            </div>

            {!currentFolderId && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-6">
                {folders.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => handleFolderClick(f.id)}
                    onDoubleClick={() => openFolder(f.id)}
                    className="
                      cursor-pointer flex flex-col items-center p-5 rounded-2xl
                      bg-white border border-slate-200 shadow-sm
                      hover:shadow-lg hover:shadow-slate-200/60 hover:bg-slate-50
                      transition-all select-none group
                    "
                  >
                    <div
                      className="
                        w-16 h-12 rounded-lg
                        bg-gradient-to-b from-indigo-200 to-indigo-300
                        border border-indigo-100 shadow-sm
                        group-hover:scale-105 transition-transform
                      "
                    />
                    <div className="text-base md:text-lg font-semibold text-slate-900 truncate w-full text-center mt-3">
                      {f.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showUpload && (
              <form
                onSubmit={handleUpload}
                className="
                  rounded-2xl border border-dashed border-slate-300 bg-white/80
                  px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4
                  shadow-sm hover:shadow-md transition
                "
              >
                <div>
                  <div className="text-lg md:text-xl font-bold text-slate-900">
                    Carica nuovo contenuto
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    Verrà salvato in:{" "}
                    <span className="text-slate-900 font-semibold">
                      {currentFolder?.name}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="
                      text-sm text-slate-700
                      file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border file:border-slate-300
                      file:text-sm file:font-semibold file:bg-white file:text-slate-800
                      hover:file:bg-slate-100
                    "
                  />

                  <button
                    type="submit"
                    disabled={!file || uploading}
                    className="
                      px-4 py-2 rounded-xl text-sm md:text-base font-semibold
                      bg-indigo-500 text-white
                      hover:bg-indigo-600
                      disabled:bg-slate-300 disabled:text-slate-500
                      shadow-md shadow-indigo-200/50
                      transition
                    "
                  >
                    {uploading ? "Caricamento..." : "Carica"}
                  </button>
                </div>
              </form>
            )}

            {currentFolderId && (
              <>
                {loading ? (
                  <div className="text-sm text-slate-500">
                    Caricamento contenuti...
                  </div>
                ) : contents.length === 0 ? (
                  <div className="mt-10 text-center text-sm text-slate-500 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center text-slate-500 text-xl">
                      📁
                    </div>
                    Nessun contenuto in questa cartella.
                  </div>
                ) : viewMode === "grid" ? (
                  <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                    {contents.map((c) => (
                      <div
                        key={c.id}
                        className="
                          rounded-2xl border border-slate-200 bg-white/90
                          overflow-hidden flex flex-col
                          hover:bg-white hover:shadow-xl hover:shadow-slate-200/70
                          transition-all
                        "
                      >
                        {c.type === "immagine" ? (
                          <div className="h-48 bg-white border-b border-slate-200 overflow-hidden flex items-center justify-center">
                            <img
                              src={c.url}
                              alt={c.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="h-48 bg-slate-100 border-b border-slate-200 flex items-center justify-center text-sm text-slate-500">
                            Anteprima non disponibile ({c.type})
                          </div>
                        )}

                        <div className="p-5 flex-1 flex flex-col">
                          <div
                            className="text-base md:text-lg font-semibold text-slate-900 truncate"
                            title={c.name}
                          >
                            {c.name}
                          </div>

                          <div className="text-sm text-slate-500 mt-1">
                            {c.type} • {formatBytes(c.size_bytes)}
                          </div>

                          <div className="mt-auto pt-4 flex items-center justify-between gap-2">
                            <a
                              href={c.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                            >
                              Apri
                            </a>

                            <button
                              onClick={() => handleDelete(c.id, c.url)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Elimina
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {contents.map((c) => (
                      <div
                        key={c.id}
                        className="
                          flex items-center justify-between
                          bg-white/80 border border-slate-200 rounded-xl
                          px-4 py-3
                          hover:bg-white hover:shadow-md hover:shadow-slate-200/60
                          transition
                        "
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center text-xs text-slate-500">
                            {c.type === "immagine"
                              ? "IMG"
                              : c.type === "video"
                              ? "VID"
                              : c.type === "documento"
                              ? "PDF"
                              : "FILE"}
                          </div>

                          <div className="min-w-0">
                            <div className="text-sm md:text-base font-semibold text-slate-900 truncate max-w-[180px] sm:max-w-[260px]">
                              {c.name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {formatBytes(c.size_bytes)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm text-indigo-600 hover:text-indigo-700 underline"
                          >
                            Apri
                          </a>

                          <button
                            onClick={() => handleDelete(c.id, c.url)}
                            className="text-sm text-red-600 hover:text-red-700"
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
    </ProtectedRoute>
  );
}
