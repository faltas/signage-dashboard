"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FolderPlus,
  Upload,
  ChevronRight,
  Folder as FolderIcon,
  ImageIcon,
  VideoIcon,
  FileText,
  File,
  HardDrive,
  Cloud,
  Loader2,
  Folder
} from "lucide-react";
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
  switch (type) {
    case "immagine":
      return <ImageIcon className="w-6 h-6" />;
    case "video":
      return <VideoIcon className="w-6 h-6" />;
    case "documento":
      return <FileText className="w-6 h-6" />;
    default:
      return <File className="w-6 h-6" />;
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

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  const currentFolder = currentFolderId
    ? folders.find((f) => f.id === currentFolderId) || null
    : null;

  useEffect(() => { loadFolders(); }, []);
  useEffect(() => { loadContents(currentFolderId); }, [currentFolderId]);

  async function createFolder() {
    if (!newFolderName.trim()) return;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    if (!userId) {
      alert("Sessione scaduta. Effettua nuovamente il login.");
      return;
    }

    await supabase.from("content_folders").insert({
      name: newFolderName.trim(),
      user_id: userId,
    });

    setNewFolderName("");
    loadFolders();
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !currentFolderId) return;

    setUploading(true);

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;

    const path = `${Date.now()}-${file.name}`;
    const contentType = file.type || "application/octet-stream";

    const { data: storageData, error: storageError } = await supabase.storage
      .from("contents")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType });

    if (storageError) {
      alert(`Errore caricamento file: ${storageError.message}`);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("contents")
      .getPublicUrl(storageData.path);

    let type = "altro";
    if (contentType.startsWith("image/")) type = "immagine";
    else if (contentType.startsWith("video/")) type = "video";
    else if (contentType === "application/pdf") type = "documento";

    await supabase.from("contents").insert({
      name: file.name,
      type,
      url: urlData.publicUrl,
      file_size: file.size,
      folder_id: currentFolderId,
      user_id: userId,
    });

    setFile(null);
    loadContents(currentFolderId);
    setUploading(false);
  }

  async function handleDelete(id, url) {
    if (!confirm("Sei sicuro di voler eliminare questo contenuto?")) return;

    const parts = url.split("/contents/");
    if (parts[1]) await supabase.storage.from("contents").remove([parts[1]]);

    await supabase.from("contents").delete().eq("id", id);
    loadContents(currentFolderId);
  }

  const filteredContents = contents.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative overflow-x-hidden">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
          <TopBar
            title={t("media_vault")}
            subtitle="Centralized Content Management"
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 md:px-8 py-8 space-y-8 w-full max-w-[1920px] mx-auto">

            <MediaHeader
              currentFolder={currentFolder}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {!currentFolderId && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <Folder className="w-5 h-5 text-primary" />
                      {t("directories")}
                    </h3>
                    <p className="text-sm text-muted-foreground">Manage your content organization</p>
                  </div>

                  <div className="flex w-full sm:w-auto items-center gap-2">
                    <Input
                      placeholder={t("new_directory_name")}
                      className="w-full sm:w-64"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                      <FolderPlus className="w-4 h-4 mr-2" /> {t("create")}
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {folders.map((f) => (
                    <Card
                      key={f.id}
                      onClick={() => setCurrentFolderId(f.id)}
                      className="group cursor-pointer p-6 flex flex-col items-center gap-4 hover:shadow-md transition-all duration-200 border-border/40 hover:border-primary/50 bg-card"
                    >
                      <div className="p-4 bg-primary/10 rounded-full group-hover:scale-110 transition-transform duration-300">
                        <FolderIcon className="w-8 h-8 text-primary" />
                      </div>
                      <span className="font-medium text-foreground truncate w-full text-center">
                        {f.name}
                      </span>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentFolderId && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-muted/30 p-4 rounded-xl border border-border/40">
                  <Button
                    variant="ghost"
                    className="gap-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setCurrentFolderId(null)}
                  >
                    <ChevronRight className="w-4 h-4 rotate-180" /> {t("back_to_root")}
                  </Button>

                  <form
                    onSubmit={handleUpload}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto"
                  >
                    <Input
                      type="file"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="bg-background w-full sm:w-80 cursor-pointer text-sm"
                    />

                    <Button
                      disabled={!file || uploading}
                      type="submit"
                      className="w-full sm:w-auto"
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {t("syncing")}
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" /> {t("deploy_asset")}
                        </>
                      )}
                    </Button>
                  </form>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-sm font-medium">Loading contents...</p>
                  </div>
                ) : (
                  <MediaGrid
                    items={filteredContents}
                    viewMode={isMobile ? "grid" : viewMode}
                    formatBytes={formatBytes}
                    getFileIcon={getFileIcon}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
