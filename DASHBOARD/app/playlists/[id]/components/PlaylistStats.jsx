"use client";

import { Button } from "@/components/ui/button";
import { Plus, Clock, Layers } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export default function PlaylistStats({ items, totalDuration, onAdd }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 -mt-4">
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{totalDuration}s</span>
          <span>{t("total_playtime")}</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">{items.length}</span>
          <span>{t("objects_count")}</span>
        </div>
      </div>

      <Button 
        onClick={onAdd} 
        variant="ghost" 
        size="icon" 
        className="rounded-full w-12 h-12 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
