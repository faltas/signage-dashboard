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
        <div className="flex-1 flex flex-col md:pl-64 transition-all duration-300">
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
          <DialogContent className="bg-background border-border p-6 rounded-3xl max-w-[95vw] md:max-w-md shadow-2xl">
            <DialogHeader className="space-y-4">
              <div className="p-3 bg-primary/10 rounded-2xl w-fit">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl md:text-2xl font-bold tracking-tight text-foreground">{t('new_sequence')}</DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">{t('define_orchestration')}</DialogDescription>
            </DialogHeader>
            <form onSubmit={createPlaylist} className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('sequence_name')}</label>
                <Input placeholder="NAME" className="bg-muted/30 border-border/50 h-12 rounded-xl px-4 text-lg font-bold text-foreground placeholder:text-muted-foreground/50" value={newName} onChange={(e) => setNewName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{t('description')}</label>
                <Textarea placeholder="DESC" className="bg-muted/30 border-border/50 rounded-xl p-4 text-base font-medium text-foreground placeholder:text-muted-foreground/50 resize-none" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} rows={3} />
              </div>
              <DialogFooter>
                <Button type="button" className="flex-1 h-12 rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-all" 
				variant="ghost" onClick={() => setShowNewModal(false)}>{t('cancel')}
				</Button>
                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg text-black hover:bg-green-50 hover:text-green-500">
				{t('create_btn')}
				</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
