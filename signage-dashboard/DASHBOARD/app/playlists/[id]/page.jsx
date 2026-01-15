"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/app/providers";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Play, 
  Plus, 
  GripVertical, 
  Trash2, 
  Clock, 
  Layout, 
  Maximize2,
  ChevronLeft,
  Settings2,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Folder as FolderIcon,
  Zap,
  Activity,
  ArrowUpRight,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useLanguage } from "@/app/language-provider";

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const supabase = useSupabase();
  const { t } = useLanguage();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [playlist, setPlaylist] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [pickerFolderId, setPickerFolderId] = useState(null);
  const [pickerFolders, setPickerFolders] = useState([]);
  const [pickerContents, setPickerContents] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerSearchQuery, setPickerSearchQuery] = useState("");

  const [ModalContent, setModalContent] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(10);
  const [expandToAllScreens, setExpandToAllScreens] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  const [playerIndex, setPlayerIndex] = useState(0);
  const [playerProgress, setPlayerProgress] = useState(0);

  async function loadData() {
    setLoading(true);
    const { data: pl } = await supabase.from("playlists").select("*").eq("id", id).single();
    setPlaylist(pl);

    const { data: it } = await supabase
      .from("playlist_items")
      .select("*, contents(*)")
      .eq("playlist_id", id)
      .order("position", { ascending: true });

    setItems(it || []);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [id]);

  async function loadPickerData(folderId) {
    setPickerLoading(true);
    const { data: f } = await supabase.from("content_folders").select("*").order("name", { ascending: true });
    setPickerFolders(f || []);

    const query = supabase.from("contents").select("*").order("created_at", { ascending: false });
    if (folderId) {
      query.eq("folder", folderId);
    }
    const { data: c } = await query;
    setPickerContents(c || []);
    setPickerLoading(false);
  }

  useEffect(() => {
    if (showAddModal) loadPickerData(pickerFolderId);
  }, [showAddModal, pickerFolderId]);

  async function confirmAddContentToPlaylist() {
    if (!ModalContent) return;
    const { error } = await supabase.from("playlist_items").insert({
      playlist_id: id,
      content_id: ModalContent.id,
      position: items.length,
      duration_seconds: isSticky ? 0 : durationSeconds,
      expand_to_all_screens: expandToAllScreens,
      is_sticky: isSticky,
    });
    setModalContent(null);
    setExpandToAllScreens(false);
    setIsSticky(false);
    setDurationSeconds(10);
    setShowAddModal(false);
    loadData();
  }

  async function removeItem(itemId) {
    await supabase.from("playlist_items").delete().eq("id", itemId);
    loadData();
  }

  async function onDragEnd(result) {
    if (!result.destination) return;
    const reordered = Array.from(items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    
    const updated = reordered.map((item, index) => ({ ...item, position: index }));
    setItems(updated);

    for (const item of updated) {
      await supabase.from("playlist_items").update({ position: item.position }).eq("id", item.id);
    }
  }

  const totalDuration = items.reduce((acc, i) => acc + (i.duration_seconds || 0), 0);
  const currentPlayerItem = items[playerIndex];
  const progressPercent = currentPlayerItem ? (playerProgress / currentPlayerItem.duration_seconds) * 100 : 0;

  const playerRef = useRef({
    index: 0,
    progress: 0,
    items: []
  });
  
  useEffect(() => {
    // Aggiorna gli items nella ref
    playerRef.current.items = items;
    playerRef.current.index = 0;
    playerRef.current.progress = 0;
  }, [items]);
  
  useEffect(() => {
    if (!items.length) return;
  
    const interval = setInterval(() => {
      const state = playerRef.current;
      
      // Se l'item corrente è "sticky", non avanziamo l'indice
      const currentItem = state.items[state.index];
      if (currentItem?.is_sticky) {
        state.progress += 1;
        setPlayerProgress(state.progress);
        return;
      }

      const duration = currentItem?.duration_seconds || 10;
  
      // Avanza il progress
      state.progress += 1;

      if (state.progress >= duration) {
        // Passa all'item successivo
        state.index = (state.index + 1) % state.items.length;
        state.progress = 0;
      }
  
      // Aggiorna lo stato React SOLO per far ridisegnare la UI
      setPlayerIndex(state.index);
      setPlayerProgress(state.progress);
  
    }, 1000);
  
    return () => clearInterval(interval);
  }, [items.length]);
  
  const filteredPickerContents = pickerContents.filter(c => 
    c.name.toLowerCase().includes(pickerSearchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background relative">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />

        <div className="flex-1 flex flex-col md:pl-72">
          <TopBar
            title={playlist?.name || t('manage_sequence')}
            subtitle={t('system_admin_protocols')}
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 px-4 md:px-8 py-6 md:py-10 space-y-8 md:space-y-12 max-w-[1600px] mx-auto w-full">
            
            {/* EDITOR HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 border-b border-white/5 pb-10">
              <div className="space-y-4">
                <Link href="/playlists" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors">
                  <ChevronLeft className="w-3 h-3" /> {t('back_to_sequences')}
                </Link>
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground leading-tight">
                  {playlist?.name || "Loading..."}
                </h2>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 md:gap-6 w-full lg:w-auto">
                 <div className="flex items-center gap-4 px-4 md:px-6 py-3 md:py-4 bg-card/50 rounded-2xl border border-border">
                    <div className="space-y-0.5">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('total_playtime')}</p>
                       <p className="text-lg md:text-xl font-black tracking-tight text-primary">{totalDuration}s</p>
                    </div>
                    <div className="w-px h-8 bg-border mx-2" />
                    <div className="space-y-0.5 text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{t('objects_count')}</p>
                       <p className="text-lg md:text-xl font-black tracking-tight text-foreground">{items.length}</p>
                    </div>
                 </div>
                 <Button onClick={() => setShowAddModal(true)} className="btn-premium h-14 md:h-16 px-6 md:px-10 rounded-2xl font-black shadow-xl">
                    <Plus className="w-5 h-5 md:w-6 md:h-6 mr-2" /> {t('inject_asset')}
                 </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
              {/* TIMELINE */}
              <div className="lg:col-span-7 space-y-6 md:space-y-8">
                <div className="flex items-center justify-between px-2">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> {t('orchestration_timeline')}</h3>
                  <Badge variant="outline" className="border-border text-[10px] font-black px-3">{t('drag_reorder')}</Badge>
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="playlist">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {items.map((item, index) => (
                          <Draggable key={item.id} draggableId={item.id} index={index}>
                            {(provided) => (
                              <Card 
                                ref={provided.innerRef} 
                                {...provided.draggableProps} 
                                className={`
                                  glass-premium p-4 md:p-6 card-premium border-none flex items-center justify-between group
                                  ${playerIndex === index ? "border-l-4 border-l-primary bg-primary/5" : ""}
                                `}
                              >
                                <div className="flex items-center gap-3 md:gap-6 min-w-0 flex-1">
                                  <div {...provided.dragHandleProps} className="text-muted-foreground/30 hover:text-primary transition-colors cursor-grab active:cursor-grabbing">
                                    <GripVertical className="w-5 h-5 md:w-6 md:h-6" />
                                  </div>
                                  <div className="w-16 h-12 md:w-24 md:h-16 rounded-xl md:rounded-[1.25rem] bg-black/40 overflow-hidden flex items-center justify-center border border-border shrink-0 relative">
                                    {item.contents.type === 'immagine' ? (
                                      <img src={item.contents.url} className="w-full h-full object-cover" />
                                    ) : (
                                      <VideoIcon className="w-5 h-5 md:w-6 md:h-6 text-primary/40" />
                                    )}
                                    {playerIndex === index && (
                                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center backdrop-blur-[2px]">
                                         <Activity className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="text-sm md:text-lg font-black tracking-tight text-foreground group-hover:text-primary transition-colors truncate">{item.contents.name}</h4>
                                      {item.is_sticky && <Badge className="bg-amber-500/20 text-amber-500 border-amber-500/20 text-[8px] font-black uppercase">Sempre in Play</Badge>}
                                      {item.expand_to_all_screens && <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/20 text-[8px] font-black uppercase">Snap</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                                      <span className="flex items-center gap-1"><Clock className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.duration_seconds}s</span>
                                      <span className="flex items-center gap-1 shrink-0"><ImageIcon className="w-3 h-3 md:w-3.5 md:h-3.5" /> {item.contents.type}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 md:gap-3 ml-4">
                                  <Button variant="ghost" size="icon" className="h-10 w-10 md:h-12 md:w-12 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all" onClick={() => removeItem(item.id)}>
                                    <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                  </Button>
                                </div>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {items.length === 0 && (
                          <div className="py-20 flex flex-col items-center justify-center glass-premium rounded-[2.5rem] border-dashed border-2 border-border text-muted-foreground gap-4">
                            <Plus className="w-12 h-12 opacity-20" />
                            <p className="font-black text-[10px] tracking-widest uppercase">{t('timeline_empty')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>

              {/* LIVE SIMULATOR */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-24 space-y-8 md:space-y-10">
                  <div className="px-2">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> {t('live_node_simulator')}</h3>
                  </div>
                  
                  <Card className="overflow-hidden glass-premium border-none shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-0 group">
                    <div className="aspect-video bg-black flex items-center justify-center relative overflow-hidden">
                      {currentPlayerItem ? (
                        currentPlayerItem.contents.type === 'immagine' ? (
                          <img src={currentPlayerItem.contents.url} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-[5s] ease-linear" />
                        ) : (
                          <div className="text-white text-[10px] font-black tracking-[0.4em] uppercase animate-pulse">{t('broadcasting_signal')}</div>
                        )
                      ) : (
                        <div className="text-muted-foreground flex flex-col items-center gap-6">
                          <Play className="w-12 h-12 md:w-16 md:h-16 opacity-10" />
                          <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] opacity-30">{t('waiting_data')}</span>
                        </div>
                      )}
                      
                      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,255,0.03))] z-10 bg-[length:100%_2px,3px_100%]" />
                      
                      <div className="absolute bottom-0 left-0 w-full h-1.5 md:h-2 bg-white/5 z-20">
                        <div className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] transition-all duration-1000 ease-linear" style={{ width: `${progressPercent}%` }} />
                      </div>
                    </div>
                    
                    <div className="p-6 md:p-10 space-y-6 md:space-y-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <Badge variant="outline" className="border-primary/30 text-primary text-[8px] font-black tracking-widest uppercase">{t('transmitting')}</Badge>
                          </div>
                          <h4 className="text-xl md:text-2xl font-black tracking-tighter text-foreground">{currentPlayerItem?.contents.name || "IDLE_STATE"}</h4>
                        </div>
                        <div className="sm:text-right w-full sm:w-auto flex sm:block items-end justify-between border-t sm:border-t-0 pt-4 sm:pt-0 border-border">
                          <div className="text-3xl md:text-5xl font-black text-primary tracking-tighter">{(currentPlayerItem?.duration_seconds || 0) - playerProgress}s</div>
                          <div className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">{t('remaining')}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 md:gap-6">
                         <div className="bg-white/5 rounded-2xl p-4 border border-border">
                            <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">{t('sequence_pos')}</p>
                            <p className="text-base md:text-lg font-black tracking-tight">{items.length > 0 ? playerIndex + 1 : 0} / {items.length}</p>
                         </div>
                         <div className="bg-white/5 rounded-2xl p-4 border border-border">
                            <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">{t('buffer_status')}</p>
                            <p className="text-base md:text-lg font-black tracking-tight text-emerald-500">{t('synced')}</p>
                         </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>

        <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
          <DialogContent className="sm:max-w-6xl glass-premium border-border shadow-2xl rounded-[2rem] md:rounded-[3rem] p-0 overflow-hidden max-w-[95vw]">
            <DialogTitle className="sr-only">{t('vault_picker')}</DialogTitle>
            <DialogDescription className="sr-only">{t('select_nodes_inject')}</DialogDescription>
            <div className="grid grid-cols-1 md:grid-cols-12 h-[85vh] md:h-[750px]">
              {/* PICKER SIDEBAR */}
              <div className="hidden md:flex md:col-span-4 bg-card/30 p-10 border-r border-border flex-col gap-8">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black tracking-tighter text-foreground">{t('vault_picker')}</h3>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t('select_nodes_inject')}</p>
                </div>

                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder={t('search_assets')} 
                    className="pl-12 bg-card/50 border-white/5 h-12 rounded-xl font-bold"
                    value={pickerSearchQuery}
                    onChange={(e) => setPickerSearchQuery(e.target.value)}
                  />
                </div>
                
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary">Configurazione Iniezione</label>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Sempre in riproduzione (Sticky)</span>
                          <input 
                            type="checkbox" 
                            checked={isSticky} 
                            onChange={(e) => setIsSticky(e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-card"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">Estendi su tutti i monitor (Snap)</span>
                          <input 
                            type="checkbox" 
                            checked={expandToAllScreens} 
                            onChange={(e) => setExpandToAllScreens(e.target.checked)}
                            className="w-4 h-4 rounded border-white/10 bg-card"
                          />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">{t('directories')}</h4>
                  <Button 
                    variant={pickerFolderId === null ? "secondary" : "ghost"} 
                    className={`w-full justify-start h-14 rounded-2xl font-black text-xs tracking-widest transition-all ${pickerFolderId === null ? "bg-primary text-white" : "hover:bg-primary/5"}`}
                    onClick={() => setPickerFolderId(null)}
                  >
                    <Layout className={`w-5 h-5 mr-3 ${pickerFolderId === null ? "text-white" : "text-primary"}`} /> All Assets
                  </Button>
                  {pickerFolders.map(f => (
                    <Button 
                      key={f.id} 
                      variant={pickerFolderId === f.id ? "secondary" : "ghost"} 
                      className={`w-full justify-start h-14 rounded-2xl font-black text-xs tracking-widest transition-all ${pickerFolderId === f.id ? "bg-primary text-white" : "hover:bg-primary/5"}`}
                      onClick={() => setPickerFolderId(f.id)}
                    >
                      <FolderIcon className={`w-5 h-5 mr-3 ${pickerFolderId === f.id ? "text-white" : "text-primary"}`} /> {f.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* PICKER GRID */}
              <div className="col-span-12 md:col-span-8 p-6 md:p-10 space-y-6 md:space-y-8 flex flex-col h-full overflow-hidden">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{t('available_assets')}</h4>
                  <Badge variant="outline" className="border-border text-[10px] font-black">{filteredPickerContents.length} {t('results')}</Badge>
                </div>
                
                <div className="md:hidden flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder={t('search_assets')} 
                      className="pl-12 bg-card/50 border-white/5 h-11 rounded-xl font-bold"
                      value={pickerSearchQuery}
                      onChange={(e) => setPickerSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar shrink-0">
                    <Button 
                      variant={pickerFolderId === null ? "secondary" : "ghost"} 
                      className={`h-10 px-4 rounded-xl font-black text-[10px] tracking-widest shrink-0 ${pickerFolderId === null ? "bg-primary text-white" : "bg-card/50"}`}
                      onClick={() => setPickerFolderId(null)}
                    >
                      All
                    </Button>
                    {pickerFolders.map(f => (
                      <Button 
                        key={f.id} 
                        variant={pickerFolderId === f.id ? "secondary" : "ghost"} 
                        className={`h-10 px-4 rounded-xl font-black text-[10px] tracking-widest shrink-0 ${pickerFolderId === f.id ? "bg-primary text-white" : "bg-card/50"}`}
                        onClick={() => setPickerFolderId(f.id)}
                      >
                        {f.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {filteredPickerContents.map(c => (
                    <Card 
                      key={c.id} 
                      className="glass-premium p-3 md:p-4 card-premium border-none group cursor-pointer flex flex-col gap-3 md:gap-4 transition-all hover:scale-[1.02]"
                      onClick={() => setModalContent(c)}
                    >
                      <div className="aspect-video rounded-xl bg-black/40 overflow-hidden relative border border-border">
                        {c.type === 'immagine' ? (
                          <img src={c.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><VideoIcon className="w-5 h-5 md:w-6 md:h-6 text-primary/40" /></div>
                        )}
                        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-500 flex items-center justify-center backdrop-blur-0 group-hover:backdrop-blur-[2px]">
                           <Plus className="w-6 h-6 md:w-8 md:h-8 text-white scale-0 group-hover:scale-100 transition-all duration-500" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-xs md:text-sm font-black truncate block text-foreground">{c.name}</span>
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground">{c.type}</span>
                          <span className="text-[8px] md:text-[9px] font-black text-primary uppercase">Select Asset</span>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {filteredPickerContents.length === 0 && (
                    <div className="col-span-full py-20 md:py-40 flex flex-col items-center justify-center text-muted-foreground/30 gap-6">
                       <Zap className="w-12 h-12 md:w-16 md:h-16 text-primary/20" />
                       <p className="text-[8px] md:text-[10px] font-black tracking-[0.5em] uppercase text-center px-4">{t('select_dir_scan')}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* DIALOG DURATA */}
        <Dialog open={!!ModalContent} onOpenChange={() => setModalContent(null)}>
          <DialogContent className="sm:max-w-md glass-premium border-border shadow-2xl rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 max-w-[95vw]">
            <DialogHeader className="space-y-4">
              <div className="p-3 md:p-4 bg-primary/10 rounded-2xl w-fit">
                <Clock className="w-6 h-6 md:w-8 md:h-8 text-primary" />
              </div>
              <DialogTitle className="text-2xl md:text-3xl font-black tracking-tighter text-foreground">{t('transmission_timing')}</DialogTitle>
              <DialogDescription className="text-sm md:text-lg font-medium text-muted-foreground">
                {t('set_active_duration')}
              </DialogDescription>
            </DialogHeader>
            <div className="py-6 md:py-10 space-y-6">
              {/* Opzione Contenuto Persistente (Sticky) */}
              <div 
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                  isSticky 
                    ? "bg-amber-500/10 border-amber-500/30" 
                    : "bg-card/50 border-border hover:bg-card"
                }`}
                onClick={() => setIsSticky(!isSticky)}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                  isSticky ? "bg-amber-500 border-amber-500" : "border-muted-foreground"
                }`}>
                  {isSticky && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-sm">Contenuto Persistente</p>
                  <p className="text-xs text-muted-foreground">
                    Il contenuto rimane sempre in riproduzione senza passare al successivo (ideale per contenuto singolo)
                  </p>
                </div>
              </div>

              {/* Durata - disabilitata se sticky */}
              <div className={`space-y-3 ${isSticky ? "opacity-50 pointer-events-none" : ""}`}>
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">{t('seconds_loop')}</label>
                <div className="relative">
                   <Input 
                    type="number" 
                    value={isSticky ? 0 : durationSeconds} 
                    onChange={(e) => setDurationSeconds(parseInt(e.target.value) || 10)} 
                    className="bg-card/50 border-border h-14 md:h-16 rounded-2xl px-6 text-xl md:text-2xl font-black"
                    disabled={isSticky}
                   />
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] md:text-[10px] font-black text-muted-foreground tracking-widest uppercase">
                     {isSticky ? "∞" : t('sec')}
                   </div>
                </div>
                {isSticky && (
                  <p className="text-xs text-amber-600">La durata è ignorata per i contenuti persistenti</p>
                )}
              </div>
              
              {/* Video Wall Option */}
              <div className="space-y-3 pt-4 border-t border-border">
                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
                  Opzione Video Wall
                </label>
                <div 
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    expandToAllScreens 
                      ? "bg-primary/10 border-primary/30" 
                      : "bg-card/50 border-border hover:bg-card"
                  }`}
                  onClick={() => setExpandToAllScreens(!expandToAllScreens)}
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    expandToAllScreens ? "bg-primary border-primary" : "border-muted-foreground"
                  }`}>
                    {expandToAllScreens && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Espandi su tutti gli schermi</p>
                    <p className="text-xs text-muted-foreground">
                      Il contenuto verrà mostrato su tutti gli schermi del video wall come un unico grande schermo
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="ghost" className="h-12 md:h-14 px-6 md:px-8 rounded-2xl font-black text-muted-foreground w-full sm:w-auto" onClick={() => setModalContent(null)}>{t('cancel')}</Button>
              <Button onClick={confirmAddContentToPlaylist} className="btn-premium h-12 md:h-14 px-8 md:px-10 rounded-2xl font-black shadow-xl w-full sm:w-auto">{t('inject_asset')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
