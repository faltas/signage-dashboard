import { Search, Grid, List, HardDrive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/language-provider";

export function MediaHeader({ currentFolder, searchQuery, setSearchQuery, viewMode, setViewMode }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-6 border-b border-border/40">
      
      {/* LEFT SIDE */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <HardDrive className="w-3.5 h-3.5" />
          <span>{t("media_vault")}</span>
          <span className="text-border/60">/</span>
          <span>{t("storage")}</span>
          <span className="text-border/60">/</span>
          <span className="text-foreground font-semibold">{!currentFolder ? t("root") : currentFolder.name}</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {!currentFolder ? t("media_vault") : currentFolder.name}
        </h2>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        
        {/* SEARCH */}
        <div className="relative w-full sm:w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search_assets")}
            className="pl-9 bg-background border-border/60 focus-visible:ring-primary/20 h-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* VIEW MODE SWITCHER */}
        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-lg border border-border/20">
          <Button
            variant={viewMode === "grid" ? "white" : "ghost"}
            size="icon"
            className={`h-8 w-8 rounded-md transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setViewMode("grid")}
          >
            <Grid className="w-4 h-4" />
          </Button>

          <Button
            variant={viewMode === "list" ? "white" : "ghost"}
            size="icon"
            className={`h-8 w-8 rounded-md transition-all ${viewMode === "list" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
