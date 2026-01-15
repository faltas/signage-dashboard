"use client";

import { ArrowUpRight, Trash2, File, Image as ImageIcon, Video as VideoIcon, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function MediaGrid({ items, viewMode, formatBytes, getFileIcon, onDelete }) {
  // LIST VIEW
  if (viewMode === "list") {
    return (
      <div className="rounded-xl border border-border/40 overflow-hidden bg-card shadow-sm">
        <div className="divide-y divide-border/20">
          {items.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors group"
            >
              {/* LEFT SIDE */}
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {/* ICON */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  {getFileIcon(c.type)}
                </div>

                {/* TEXT */}
                <div className="min-w-0 flex-1">
					<h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors max-w-[60vw] sm:max-w-full">
					  {c.name}
					</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">{formatBytes(c.size_bytes)}</span>
                    <span>•</span>
                    <span className="capitalize">{c.type}</span>
                    <span>•</span>
                    <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE — ACTIONS */}
              <div className="flex items-center gap-2 ml-4 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                  asChild
                >
                  <a href={c.url} target="_blank" rel="noreferrer">
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => onDelete(c.id, c.url)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // GRID VIEW
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {items.map((c) => (
        <Card
          key={c.id}
          className="group overflow-hidden border border-border/40 shadow-sm hover:shadow-md hover:border-border transition-all duration-200 bg-card flex flex-col"
        >
          {/* MEDIA */}
          <div className="aspect-video bg-muted/50 relative overflow-hidden flex items-center justify-center border-b border-border/20">
            {c.type === "immagine" ? (
              <img
                src={c.url}
                alt={c.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                {getFileIcon(c.type)}
              </div>
            )}
  
            {/* DESKTOP HOVER OVERLAY */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center justify-center gap-3">
              <Button
                variant="secondary"
                size="icon"
                className="h-9 w-9 rounded-full bg-white/90 hover:bg-white text-black shadow-sm"
                asChild
              >
                <a href={c.url} target="_blank" rel="noreferrer">
                  <ArrowUpRight className="w-5 h-5" />
                </a>
              </Button>
  
              <Button
                variant="destructive"
                size="icon"
                className="h-9 w-9 rounded-full bg-rose-50/90 hover:bg-rose-500 text-black shadow-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id, c.url);
                }}
              >
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
  
          {/* CONTENT */}
          <div className="p-3 space-y-1 flex flex-col">
            <h4
              className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors"
              title={c.name}
            >
              {c.name}
            </h4>
  
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{formatBytes(c.size_bytes)}</span>
              <span className="capitalize">{c.type}</span>
            </div>
  
			{/* MOBILE ICON ACTIONS */}
			<div className="flex items-center justify-between pt-2 md:hidden">
			<Button
				variant="ghost"
				size="icon"
				className="h-9 w-9 rounded-full border border-border/40"
				asChild
			>
				<a href={c.url} target="_blank" rel="noreferrer">
				<ArrowUpRight className="w-5 h-5" />
				</a>
			</Button>
			
			<Button
				variant="ghost"
				size="icon"
				className="h-9 w-9 rounded-full border border-border/40 text-destructive"
				onClick={() => onDelete(c.id, c.url)}
			>
				<Trash2 className="w-5 h-5" />
			</Button>
			</div>

          </div>
        </Card>
      ))}
    </div>
  );
}
