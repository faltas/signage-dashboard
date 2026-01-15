"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Video as VideoIcon, Plus, Zap } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export default function PickerGrid({
  pickerFolders,
  pickerFolderId,
  pickerContents,
  pickerSearchQuery,
  setPickerSearchQuery,
  setModalContent,
}) {
  const { t } = useLanguage();

  return (
    <div className="col-span-12 md:col-span-8 p-6 md:p-8 space-y-4 md:space-y-6 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-muted-foreground">
          {t("available_assets")}
        </h4>
        <Badge className="border-border text-[11px]">
          {pickerContents.length} {t("results")}
        </Badge>
      </div>

      {/* MOBILE FILTERS + SEARCH */}
      <div className="md:hidden flex flex-col gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search_assets")}
            className="pl-10 bg-card border-border h-10 rounded-md"
            value={pickerSearchQuery}
            onChange={(e) => setPickerSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar shrink-0">
          <Button
            variant={pickerFolderId === null ? "secondary" : "ghost"}
            className={`h-9 px-4 rounded-full text-[11px] shrink-0 ${
              pickerFolderId === null ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
            onClick={() => setPickerFolderId(null)}
          >
            All
          </Button>
          {pickerFolders.map((f) => (
            <Button
              key={f.id}
              variant={pickerFolderId === f.id ? "secondary" : "ghost"}
              className={`h-9 px-4 rounded-full text-[11px] shrink-0 ${
                pickerFolderId === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
              onClick={() => setPickerFolderId(f.id)}
            >
              {f.name}
            </Button>
          ))}
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {pickerContents.map((c) => (
          <Card
            key={c.id}
            className="p-3 border border-border/40 bg-card group cursor-pointer flex flex-col gap-3 md:gap-3 transition-all hover:border-primary/40 hover:shadow-sm rounded-lg"
            onClick={() => setModalContent(c)}
          >
            <div className="aspect-[4/3] rounded-md bg-muted overflow-hidden relative border border-border/40">
              {c.type === "immagine" ? (
                <img
                  src={c.url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground/60" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                <Plus className="w-7 h-7 md:w-8 md:h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs md:text-sm font-medium truncate block text-foreground">
                {c.name}
              </span>
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  {c.type}
                </span>
                <span className="text-[11px] text-primary">
                  Select asset
                </span>
              </div>
            </div>
          </Card>
        ))}
        {pickerContents.length === 0 && (
          <div className="col-span-full py-16 md:py-24 flex flex-col items-center justify-center text-muted-foreground/40 gap-4">
            <Zap className="w-12 h-12 md:w-16 md:h-16 text-primary/20" />
            <p className="text-xs md:text-sm text-center px-4">
              {t("select_dir_scan")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
