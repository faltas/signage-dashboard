"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Layout, Grid3x3, Monitor, Plus, Trash2, Edit, Eye, Link2, Unlink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function WallManager({ userId }) {
  const supabase = useSupabase();
  const [walls, setWalls] = useState([]);
  const [displays, setDisplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [editingWall, setEditingWall] = useState(null);
  const [selectedWall, setSelectedWall] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    type: "videowall",
    pixel_width: 1920,
    pixel_height: 1080,
    rows: 1,
    columns: 1,
    description: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    
    // Load walls with associated displays
    const { data: wallsData, error: wallsError } = await supabase
      .from("walls")
      .select(`
        *,
        displays:displays(id, name, status)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!wallsError) {
      setWalls(wallsData || []);
    }

    // Load all user displays (for assignment)
    const { data: displaysData } = await supabase
      .from("displays")
      .select("id, name, status, wall_id")
      .eq("user_id", userId)
      .order("name", { ascending: true });

    setDisplays(displaysData || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (editingWall) {
      const { error } = await supabase
        .from("walls")
        .update(formData)
        .eq("id", editingWall.id);

      if (!error) {
        await loadData();
        closeDialog();
      }
    } else {
      const { error } = await supabase
        .from("walls")
        .insert([{ ...formData, user_id: userId }]);

      if (!error) {
        await loadData();
        closeDialog();
      }
    }
  }

  async function handleDelete(wallId) {
    if (!confirm("Sei sicuro di voler eliminare questo wall? Tutti i display associati verranno scollegati.")) {
      return;
    }

    // First unlink all displays from this wall
    await supabase
      .from("displays")
      .update({ wall_id: null })
      .eq("wall_id", wallId);

    // Then delete the wall
    const { error } = await supabase
      .from("walls")
      .delete()
      .eq("id", wallId);

    if (!error) {
      await loadData();
    }
  }

  async function assignDisplayToWall(displayId, wallId) {
    const { error } = await supabase
      .from("displays")
      .update({ wall_id: wallId })
      .eq("id", displayId);

    if (!error) {
      await loadData();
    }
  }

  async function unlinkDisplayFromWall(displayId) {
    const { error } = await supabase
      .from("displays")
      .update({ wall_id: null })
      .eq("id", displayId);

    if (!error) {
      await loadData();
    }
  }

  function openDialog(wall = null) {
    if (wall) {
      setEditingWall(wall);
      setFormData({
        name: wall.name,
        type: wall.type,
        pixel_width: wall.pixel_width,
        pixel_height: wall.pixel_height,
        rows: wall.rows,
        columns: wall.columns,
        description: wall.description || ""
      });
    } else {
      setEditingWall(null);
      setFormData({
        name: "",
        type: "videowall",
        pixel_width: 1920,
        pixel_height: 1080,
        rows: 1,
        columns: 1,
        description: ""
      });
    }
    setShowDialog(true);
  }

  function closeDialog() {
    setShowDialog(false);
    setEditingWall(null);
  }

  function openAssignDialog(wall) {
    setSelectedWall(wall);
    setShowAssignDialog(true);
  }

  const availableDisplays = displays.filter(d => !d.wall_id || d.wall_id === selectedWall?.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Video Walls</h2>
          <p className="text-muted-foreground text-sm font-medium mt-1">Gestisci configurazioni multi-schermo</p>
        </div>
        <Button onClick={() => openDialog()} className="btn-premium">
          <Plus className="w-4 h-4 mr-2" />
          Crea Wall
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin mx-auto" />
        </div>
      ) : walls.length === 0 ? (
        <Card className="glass-premium p-12 text-center border-none">
          <Layout className="w-16 h-16 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-bold mb-2">Nessun Wall Configurato</h3>
          <p className="text-muted-foreground mb-6">Crea il tuo primo video wall per gestire display multi-schermo</p>
          <Button onClick={() => openDialog()}>Crea Wall</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {walls.map((wall) => (
            <Card key={wall.id} className="glass-premium p-6 space-y-4 border-none">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-primary/10">
                    {wall.type === "videowall" ? (
                      <Grid3x3 className="w-8 h-8 text-primary" />
                    ) : (
                      <Monitor className="w-8 h-8 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{wall.name}</h3>
                    <Badge variant="outline" className="mt-1 text-xs">
                      {wall.type === "videowall" ? "Video Wall" : "LED Wall"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Risoluzione:</span>
                  <span className="font-semibold">{wall.pixel_width}x{wall.pixel_height}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Griglia:</span>
                  <span className="font-semibold">{wall.rows}x{wall.columns}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Display associati:</span>
                  <span className="font-semibold">{wall.displays?.length || 0}</span>
                </div>
              </div>

              {/* Display associati preview */}
              {wall.displays && wall.displays.length > 0 && (
                <div className="pt-2 space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Display:</p>
                  <div className="flex flex-wrap gap-2">
                    {wall.displays.slice(0, 3).map(d => (
                      <Link key={d.id} href={`/displays/${d.id}`}>
                        <Badge variant="secondary" className="cursor-pointer hover:bg-primary/20">
                          <Monitor className="w-3 h-3 mr-1" />
                          {d.name || "Display"}
                        </Badge>
                      </Link>
                    ))}
                    {wall.displays.length > 3 && (
                      <Badge variant="outline">+{wall.displays.length - 3}</Badge>
                    )}
                  </div>
                </div>
              )}

              {wall.description && (
                <p className="text-xs text-muted-foreground">{wall.description}</p>
              )}

              {/* Wall preview */}
              <div className="bg-muted/30 rounded-xl p-3">
                <div 
                  className="grid gap-1 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${wall.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${wall.rows}, 1fr)`,
                    maxWidth: "150px"
                  }}
                >
                  {Array.from({ length: wall.rows * wall.columns }).map((_, i) => (
                    <div key={i} className="aspect-video bg-primary/20 border border-primary/40 rounded" />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => openAssignDialog(wall)}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  Associa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openDialog(wall)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(wall.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={closeDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              {editingWall ? "Modifica Wall" : "Crea Nuovo Wall"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold">Nome</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="es. Wall Reception"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Tipo</label>
                <select
                  className="w-full px-4 py-2 rounded-lg border bg-background"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="videowall">Video Wall</option>
                  <option value="ledwall">LED Wall</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Larghezza Canvas (px)</label>
                <Input
                  type="number"
                  value={formData.pixel_width}
                  onChange={(e) => setFormData({ ...formData, pixel_width: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Altezza Canvas (px)</label>
                <Input
                  type="number"
                  value={formData.pixel_height}
                  onChange={(e) => setFormData({ ...formData, pixel_height: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Righe</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.rows}
                  onChange={(e) => setFormData({ ...formData, rows: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Colonne</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.columns}
                  onChange={(e) => setFormData({ ...formData, columns: parseInt(e.target.value) })}
                  required
                />
              </div>

              <div className="col-span-2 space-y-2">
                <label className="text-sm font-semibold">Descrizione (Opzionale)</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Note aggiuntive su questo wall"
                />
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-3">Anteprima:</p>
              <div className="flex items-center gap-6">
                <div className="text-sm space-y-1">
                  <div>Schermi totali: <span className="font-bold">{formData.rows * formData.columns}</span></div>
                  <div>Griglia: <span className="font-bold">{formData.rows}x{formData.columns}</span></div>
                  <div>Canvas: <span className="font-bold">{formData.pixel_width}x{formData.pixel_height}</span></div>
                </div>
                <div 
                  className="grid gap-1 p-3 bg-background rounded-xl border"
                  style={{
                    gridTemplateColumns: `repeat(${formData.columns}, 1fr)`,
                    gridTemplateRows: `repeat(${formData.rows}, 1fr)`
                  }}
                >
                  {Array.from({ length: formData.rows * formData.columns }).map((_, i) => (
                    <div key={i} className="w-10 h-7 bg-primary/20 border border-primary/40 rounded flex items-center justify-center text-xs font-bold text-primary/60">
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={closeDialog} className="flex-1">
                Annulla
              </Button>
              <Button type="submit" className="flex-1 btn-premium">
                {editingWall ? "Salva modifiche" : "Crea Wall"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Assign Display Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={() => setShowAssignDialog(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-black">
              Associa Display a "{selectedWall?.name}"
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Seleziona i display da associare a questo video wall. I display associati condivideranno la configurazione del wall.
            </p>

            {availableDisplays.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Monitor className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nessun display disponibile</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {availableDisplays.map(display => {
                  const isAssigned = display.wall_id === selectedWall?.id;
                  return (
                    <div 
                      key={display.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        isAssigned ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className={`w-5 h-5 ${isAssigned ? "text-primary" : "text-muted-foreground"}`} />
                        <div>
                          <p className="font-semibold">{display.name || "Display senza nome"}</p>
                          <p className="text-xs text-muted-foreground">
                            {display.status === "on" || display.status === "online" ? "Online" : "Offline"}
                          </p>
                        </div>
                      </div>
                      {isAssigned ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => unlinkDisplayFromWall(display.id)}
                        >
                          <Unlink className="w-4 h-4 mr-1" /> Scollega
                        </Button>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => assignDisplayToWall(display.id, selectedWall.id)}
                        >
                          <Link2 className="w-4 h-4 mr-1" /> Associa
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Button variant="outline" onClick={() => setShowAssignDialog(false)} className="w-full">
            Chiudi
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
