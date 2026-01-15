import { ImageIcon, VideoIcon, FileText, File, Grid, List, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowUpRight } from "lucide-react";

export function MediaGrid({ items, viewMode, formatBytes, getFileIcon, onDelete }) {
  if (viewMode === "list") {
    return (
      <div className="glass-premium rounded-3xl border-none divide-y divide-white/5 overflow-hidden">
        {items.map((c) => (
          <div key={c.id} className="p-5 flex items-center justify-between hover:bg-white/5 transition-all duration-300 group">
            <div className="flex items-center gap-6 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500 shadow-xl">
                {getFileIcon(c.type)}
              </div>
              <div className="min-w-0">
                <h4 className="text-lg font-black tracking-tight text-black group-hover:text-primary transition-colors">{c.name}</h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatBytes(c.size_bytes)} • {c.type} • {new Date(c.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="rounded-xl font-black text-xs tracking-widest hover:bg-white/10" asChild>
                <a href={c.url} target="_blank" rel="noreferrer">OPEN</a>
              </Button>
              <Button variant="ghost" className="h-12 w-12 rounded-xl text-rose-400 hover:bg-rose-500 hover:text-black transition-all duration-500" onClick={() => onDelete(c.id, c.url)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
      {items.map((c) => (
        <Card key={c.id} className="glass-premium card-premium border-none overflow-hidden group">
          <div className="aspect-square bg-muted relative overflow-hidden flex items-center justify-center border-b border-white/5">
            {c.type === "immagine" ? (
              <img src={c.url} alt={c.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            ) : (
              <div className="flex flex-col items-center gap-4 text-primary/40 group-hover:text-primary transition-colors duration-500">
                {getFileIcon(c.type)}
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">{c.type}</span>
              </div>
            )}
            <div className="absolute top-4 right-4 translate-x-12 group-hover:translate-x-0 transition-transform duration-500">
              <Badge variant="secondary" className="bg-black/60 backdrop-blur-xl border-white/10 font-black px-3 py-1 text-[10px]">{formatBytes(c.size_bytes)}</Badge>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-1">
              <h4 className="text-lg font-black tracking-tight truncate text-black group-hover:text-primary transition-colors">{c.name}</h4>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()} • {c.type}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl bg-black/5 border-white/10 font-bold hover:bg-white/10" asChild>
                <a href={c.url} target="_blank" rel="noreferrer"><ArrowUpRight className="w-4 h-4 mr-2" /> INSPECT</a>
              </Button>
              <Button variant="outline" className="w-12 h-12 rounded-xl bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-black transition-all duration-500" onClick={() => onDelete(c.id, c.url)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
