"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
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


  // 🔽 Stato locale della pagina
  const [menuOpen, setMenuOpen] = useState(false);
  const [contents, setContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // 📡 Caricamento contenuti
  async function loadContents() {
    setLoading(true);
    const { data, error } = await supabase
      .from("contents")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Errore caricamento contenuti:", error);
      setErrorMsg("Errore nel caricamento dei contenuti.");
    } else {
      setContents(data || []);
      setErrorMsg("");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadContents();
  }, []);

  // 📤 Upload contenuto
  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;

    setErrorMsg("");
    setUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${Date.now()}-${file.name}`;
      const contentType = file.type || "application/octet-stream";

      // 1) Upload su Storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from("contents")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType,
        });

      if (storageError) {
        console.error(storageError);
        setErrorMsg("Errore nell'upload del file.");
        setUploading(false);
        return;
      }

      // 2) URL pubblico
      const {
        data: { publicUrl },
      } = supabase.storage.from("contents").getPublicUrl(storageData.path);

      // 3) Tipo logico
      let type = "altro";
      if (contentType.startsWith("image/")) type = "immagine";
      else if (contentType.startsWith("video/")) type = "video";
      else if (contentType === "application/pdf") type = "documento";
      else if (ext === "html") type = "html";

      // 4) Salva record in tabella
      const { error: insertError } = await supabase.from("contents").insert({
        name: file.name,
        type,
        url: publicUrl,
        size_bytes: file.size,
      });

      if (insertError) {
        console.error(insertError);
        setErrorMsg("File caricato ma errore nel salvataggio dei metadati.");
        setUploading(false);
        return;
      }

      setFile(null);
      await loadContents();
    } catch (err) {
      console.error(err);
      setErrorMsg("Errore imprevisto durante l'upload.");
    } finally {
      setUploading(false);
    }
  }

  // 🗑️ Eliminazione contenuto
  async function handleDelete(id, url) {
    if (!confirm("Sei sicuro di voler eliminare questo contenuto?")) return;

    try {
      const parts = url.split("/contents/");
      if (parts[1]) {
        const path = parts[1];
        await supabase.storage.from("contents").remove([path]);
      }
    } catch (err) {
      console.warn("Errore eliminazione file Storage (ignorato):", err);
    }

    const { error } = await supabase.from("contents").delete().eq("id", id);
    if (error) {
      console.error(error);
      setErrorMsg("Errore durante l'eliminazione del contenuto.");
    } else {
      setContents((prev) => prev.filter((c) => c.id !== id));
    }
  }

  // 🎨 Render pagina
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50">
      <Sidebar />
      <MobileSideBar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex-1 flex flex-col">
        <TopBar
          title="Contenuti"
          subtitle="Carica immagini, video e file per le tue playlist"
          onMenuClick={() => setMenuOpen(true)}
        />

        <main className="flex-1 px-6 md:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
                Tutti i contenuti
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {loading
                  ? "Caricamento in corso..."
                  : `${contents.length} contenuti caricati`}
              </div>
            </div>
          </div>

          {/* Form upload */}
          <form
            onSubmit={handleUpload}
            className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-4 md:px-6 md:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
          >
            <div>
              <div className="text-sm font-medium">Carica nuovo contenuto</div>
              <div className="text-xs text-slate-500 mt-1">
                Supporta immagini, video, PDF e altri file.
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-slate-800 file:text-slate-100 hover:file:bg-slate-700"
              />
              <button
                type="submit"
                disabled={!file || uploading}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500 hover:bg-indigo-400 disabled:bg-slate-700 disabled:text-slate-400 text-white shadow-lg shadow-indigo-500/40"
              >
                {uploading ? "Caricamento..." : "Carica"}
              </button>
            </div>
          </form>

          {errorMsg && <div className="text-xs text-red-400">{errorMsg}</div>}

          {/* Lista contenuti */}
          <div>
            {loading ? (
              <div className="text-sm text-slate-500">Caricamento contenuti...</div>
            ) : contents.length === 0 ? (
              <div className="mt-10 text-center text-sm text-slate-500">
                Nessun contenuto ancora caricato.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {contents.map((c) => (
                  <div
                    key={c.id}
                    className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden flex flex-col"
                  >
                    {c.type === "immagine" ? (
                      <div className="h-32 bg-slate-900 border-b border-slate-800 overflow-hidden flex items-center justify-center">
                        <img
                          src={c.url}
                          alt={c.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-32 bg-slate-900 border-b border-slate-800 flex items-center justify-center text-[11px] text-slate-500">
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
                          className="text-[11px] text-slate-300 hover:text-slate-50 underline"
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
