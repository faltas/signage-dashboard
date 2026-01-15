"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, Clock, Image as ImageIcon, Video as VideoIcon, Activity } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TimelineItem({
  item,
  index,
  isActive,
  removeItem,
  provided,
}) {
  const isImage = item.contents.type === "immagine";

  return (
    <Card
      ref={provided.innerRef}
      {...provided.draggableProps}
      className={`border border-border/40 bg-card p-5 md:p-6 rounded-xl transition-all flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center ${
        isActive ? "border-primary/40 shadow-sm bg-primary/5" : ""
      }`}
    >
      <div
        {...provided.dragHandleProps}
        className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-primary transition-colors mt-1"
      >
        <GripVertical className="w-5 h-5 md:w-6 md:h-6" />
      </div>

      <div className="w-full sm:w-32 h-24 rounded-lg overflow-hidden bg-muted border border-border relative shrink-0">
        {isImage ? (
          <img
            src={item.contents.url}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <VideoIcon className="w-7 h-7 md:w-8 md:h-8 text-primary/40" />
          </div>
        )}

        {isActive && (
          <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
            <Activity className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-base md:text-lg font-semibold text-foreground truncate">
            {item.contents.name}
          </h4>
          {item.is_sticky && (
            <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px] font-medium uppercase">
              Sempre in Play
            </Badge>
          )}
          {item.expand_to_all_screens && (
            <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 text-[10px] font-medium uppercase">
              Snap
            </Badge>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {item.duration_seconds}s
          </span>
          <span className="flex items-center gap-1">
            <ImageIcon className="w-3.5 h-3.5" /> {item.contents.type}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 md:h-12 md:w-12 rounded-xl text-rose-500 hover:bg-rose-500/10 transition-all"
          onClick={() => removeItem(item.id)}
        >
          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
        </Button>
      </div>
    </Card>
  );
}
