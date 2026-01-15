import { Search, Plus, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/language-provider";

export function PlaylistHeader({ searchQuery, setSearchQuery, onNewClick }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <Sparkles className="w-3 h-3" /> {t('sequences')} / Studio / Playlists
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-foreground">
          {t('sequences')}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card/50 p-2 rounded-2xl border border-border backdrop-blur-sm w-full lg:w-auto">
        <div className="relative flex-1 lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('search_playlist')}
            className="pl-12 bg-transparent border-none focus-visible:ring-0 text-sm md:text-lg font-bold placeholder:text-muted-foreground/50 h-10 md:h-12 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:block w-px h-8 bg-border mx-2" />
        <Button 
          onClick={onNewClick}
          className="btn-premium h-10 md:h-12 px-6 md:px-8 rounded-xl font-black shadow-lg text-xs md:text-sm"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5 mr-2" />
          {t('new_sequence').toUpperCase()}
        </Button>
      </div>
    </div>
  );
}
