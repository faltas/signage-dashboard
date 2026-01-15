"use client";

import { useRef, useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FolderPlus, Upload, ChevronRight, Folder as FolderIcon, ImageIcon, VideoIcon, FileText, File } from "lucide-react";
import { MediaHeader } from "@/components/media/MediaHeader";
import { useMedia } from "./hooks/useMedia";
import { MediaGrid } from "./components/MediaGrid";
import { useSupabase } from "@/app/providers";
import { useLanguage } from "@/app/language-provider";

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return "-";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

const getFileIcon = (type) => {
  switch(type) {
    case 'immagine': return <ImageIcon className="w-8 h-8" />;
    case 'video': return <VideoIcon className="w-8 h-8" />;
    case 'documento': return <FileText className="w-8 h-8" />;
    default: return <File className="w-8 h-8" />;
  }
};

export default function ContentsPage() {
  const supabase = useSupabase();
  const { folders, contents, loading, loadFolders, loadContents } = useMedia();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const lastClickRef = useRef(null);
  const currentFolder = currentFolderId ? folders.find((f) => f.id === currentFolderId) || null : null;

  useEffect(() => { loadFolders(); }, []);
  useEffect(() => { loadContents(currentFolderId); }, [currentFolderId]);

  async function createFolder() {
    if (!newFolderName.trim()) return;
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert("Sessione scaduta. Effettua nuovamente il login.");
          return;
        }
      }
      const activeUserId = userId || (await supabase.auth.getSession()).data.session.user.id;
      
      const { data, error } = await supabase.from("content_folders").insert({ 
        name: newFolderName.trim(), 
        user_id: activeUserId
      }).select();
      
      if (error) {
        console.error("Supabase error detail:", error);
        alert(`Errore Supabase: ${error.message} (Codice: ${error.code})`);
      } else {
        setNewFolderName("");
        await loadFolders();
      }
    } catch (err) {
      console.error("Unexpected catch error:", err);
      alert("Errore imprevisto durante la creazione della cartella.");
    }
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !currentFolderId) return;
    setUploading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      const userId = user?.id;
      
      if (!userId) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          alert("Sessione scaduta. Effettua nuovamente il login.");
          setUploading(false);
          return;
        }
      }
      const activeUserId = userId || (await supabase.auth.getSession()).data.session.user.id;

      const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${Date.now()}-${file.name}`;
      const contentType = file.type || "application/octet-stream";
      
      const { data: storageData, error: storageError } = await supabase.storage
        .from("contents")
        .upload(path, file, { cacheControl: "3600", upsert: false, contentType });

      if (storageError) {
        console.error("Storage Error:", storageError);
        alert(`Errore caricamento file: ${storageError.message}`);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("contents").getPublicUrl(storageData.path);

      let type = "altro";
      if (contentType.startsWith("image/")) type = "immagine";
      else if (contentType.startsWith("video/")) type = "video";
      else if (contentType === "application/pdf") type = "documento";
      else if (ext === "html") type = "html";

      const { error: dbError } = await supabase.from("contents").insert({ 
        name: file.name, 
        type, 
        url: publicUrl, 
        file_size: file.size, 
        folder_id: currentFolderId, 
        user_id: activeUserId 
      });

      if (dbError) {
        console.error("Database Insert Error:", dbError);
        alert(`Errore salvataggio database: ${dbError.message}`);
      } else {
        setFile(null);
        loadContents(currentFolderId);
      }
    } catch (error) {
      console.error("Unexpected upload error:", error);
      alert("Errore inaspettato durante l'upload.");
    } finally { 
      setUploading(false); 
    }
  }

  async function handleDelete(id, url) {
    if (!confirm("Sei sicuro di voler eliminare questo contenuto?")) return;
    try {
      const parts = url.split("/contents/");
      if (parts[1]) await supabase.storage.from("contents").remove([parts[1]]);
    } catch {}
    await supabase.from("contents").delete().eq("id", id);
    loadContents(currentFolderId);
  }

  const filteredContents = contents.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar title={t('media_vault')} subtitle="Secure Asset Storage" onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-8 py-10 space-y-12 max-w-[1600px] mx-auto w-full">
            <MediaHeader currentFolder={currentFolder} searchQuery={searchQuery} setSearchQuery={setSearchQuery} viewMode={viewMode} setViewMode={setViewMode} />
            {!currentFolderId && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{t('directories')}</h3>
                   <div className="flex items-center gap-3">
                    <Input placeholder={t('new_directory_name')} className="w-64 h-11 bg-card/30 border-white/10 font-bold rounded-xl" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} />
                    <Button onClick={createFolder} disabled={!newFolderName.trim()} className="btn-premium h-11 px-6 rounded-xl font-black">
                      <FolderPlus className="w-5 h-5 mr-2" /> {t('create')}
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                  {folders.map((f) => (
                    <Card key={f.id} onClick={() => setCurrentFolderId(f.id)} className="glass-premium card-premium p-8 cursor-pointer group flex flex-col items-center text-center gap-6 border-none relative overflow-hidden">
                      <div className="p-6 bg-primary/10 rounded-[2.5rem] group-hover:bg-primary/20 transition-all duration-500 shadow-2xl relative z-10">
                        <FolderIcon className="w-12 h-12 text-primary group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <span className="text-lg font-black tracking-tight block text-black">{f.name}</span>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {currentFolderId && (
              <div className="space-y-10">
                <div className="flex items-center justify-between">
                   <Button variant="ghost" className="font-black text-xs uppercase tracking-widest hover:bg-white/5" onClick={() => setCurrentFolderId(null)}>
                      <ChevronRight className="w-4 h-4 mr-2 rotate-180" /> {t('back_to_root')}
                   </Button>
                   <form onSubmit={handleUpload} className="flex items-center gap-4">
                      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="bg-card/30 border-white/10 w-80 h-11 rounded-xl cursor-pointer" />
                      <Button disabled={!file || uploading} type="submit" className="btn-premium h-11 px-8 rounded-xl font-black">
                        {uploading ? t('syncing') : <><Upload className="w-5 h-5 mr-2" /> {t('deploy_asset')}</>}
                      </Button>
                   </form>
                </div>
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-40 gap-6">
                    <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : (
                  <MediaGrid items={filteredContents} viewMode={viewMode} formatBytes={formatBytes} getFileIcon={getFileIcon} onDelete={handleDelete} />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
