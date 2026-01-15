"use client";

import Link from "next/link";
import { ChevronRight, LayoutList } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export default function PlaylistHeader({ playlist }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-6 border-b border-border/40">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Link href="/playlists" className="hover:text-foreground transition-colors flex items-center gap-1">
            <LayoutList className="w-3.5 h-3.5" />
            <span>{t("sequences")}</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {playlist?.name || "Loading..."}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {playlist?.name || "Loading..."}
        </h2>
      </div>
    </div>
  );
}
