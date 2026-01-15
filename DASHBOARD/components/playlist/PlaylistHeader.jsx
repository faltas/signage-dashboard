import { Search, Plus, ListMusic } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/language-provider";

export function PlaylistHeader({ searchQuery, setSearchQuery, onNewClick }) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-6 border-b border-border/40">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <ListMusic className="w-3.5 h-3.5" />
          <span>{t("sequences")}</span>
          <span className="text-border/60">/</span>
          <span className="text-foreground font-semibold">Studio</span>
        </div>

        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {t("sequences")}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        <div className="relative w-full sm:w-64 lg:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t("search_playlist")}
            className="pl-9 bg-background border-border/60 focus-visible:ring-primary/20 h-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Button
          onClick={onNewClick}
          variant="ghost"
          size="icon"
          className="rounded-full w-12 h-12 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
