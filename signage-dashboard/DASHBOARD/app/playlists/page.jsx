"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlayCircle, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { PlaylistHeader } from "@/components/playlist/PlaylistHeader";
import { usePlaylists } from "./hooks/usePlaylists";
import { PlaylistGrid } from "./components/PlaylistGrid";
import { useLanguage } from "@/app/language-provider";

export default function PlaylistsPage() {
  const supabase = useSupabase();
  const { playlists, loading, loadPlaylists } = usePlaylists();
  const { t } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => { loadPlaylists(); }, []);

  async function createPlaylist(e) {
    e.preventDefault();
    if (!newName.trim()) return;
	const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("playlists").insert({ name: newName.trim(), description: newDescription.trim(), user_id: user.id, created_at: new Date().toISOString()});
    if (!error) {
      setShowNewModal(false);
      setNewName("");
      setNewDescription("");
      loadPlaylists();
    }
  }

  const filteredPlaylists = playlists.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar title={t('sequences')} subtitle={t('system_admin_protocols')} onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 px-8 py-10 space-y-12 max-w-[1600px] mx-auto w-full">
            <PlaylistHeader searchQuery={searchQuery} setSearchQuery={setSearchQuery} onNewClick={() => setShowNewModal(true)} />
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
              </div>
            ) : filteredPlaylists.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-40 glass-premium rounded-[3rem] border-dashed border-2 border-white/10">
                <PlayCircle className="w-16 h-16 text-primary mb-8" />
                <h3 className="text-3xl font-black mb-2">{t('no_playlists')}</h3>
                <Button onClick={() => setShowNewModal(true)} className="btn-premium px-12 font-black">{t('create_now')}</Button>
              </div>
            ) : (
              <PlaylistGrid playlists={filteredPlaylists} />
            )}
          </main>
        </div>
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogContent className="glass-premium border-white/10 p-6 md:p-12 rounded-[2rem] md:rounded-[2.5rem] max-w-[95vw] md:max-w-lg">
            <DialogHeader className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl md:text-4xl font-black tracking-tighter text-foreground">{t('new_sequence')}</DialogTitle>
              <DialogDescription className="text-sm md:text-lg font-medium text-muted-foreground">{t('define_orchestration')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={createPlaylist} className="space-y-8 py-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('sequence_name')}</label>
                <Input placeholder="NAME" className="bg-white/5 border-white/10 h-16 rounded-2xl px-6 text-xl font-black text-foreground placeholder:text-muted-foreground/50" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('description')}</label>
                <Textarea placeholder="DESC" className="bg-white/5 border-white/10 rounded-2xl p-6 text-lg font-medium text-foreground placeholder:text-muted-foreground/50" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={4} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setShowNewModal(false)}>{t('cancel')}</Button>
                <Button type="submit" className="btn-premium h-16 px-12 rounded-2xl font-black shadow-2xl text-white">{t('create_btn')}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
