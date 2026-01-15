import { Search, Grid, List, HardDrive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/app/language-provider";

export function MediaHeader({ currentFolder, searchQuery, setSearchQuery, viewMode, setViewMode }) {
  const { t } = useLanguage();
  return (
    <div className="flex flex-col lg:flex-row justify-between items-end gap-6 border-b border-white/5 pb-10">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">
          <HardDrive className="w-3 h-3" /> {t('media_vault')} / {t('storage')} / {!currentFolder ? t('root') : currentFolder.name}
        </div>
        <h2 className="text-5xl font-black tracking-tighter text-foreground">
          {!currentFolder ? t('media_vault') : currentFolder.name}
        </h2>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-card/50 p-2 rounded-2xl border border-border backdrop-blur-sm w-full lg:w-auto">
        <div className="relative flex-1 lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={t('search_assets')} 
            className="pl-12 bg-transparent border-none focus-visible:ring-0 text-sm md:text-lg font-bold placeholder:text-muted-foreground/50 h-10 md:h-12 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="hidden sm:block w-px h-8 bg-border mx-2" />
        <div className="flex bg-white/5 rounded-xl p-1 justify-center">
          <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="icon" className="rounded-lg h-10 w-10" onClick={() => setViewMode('grid')}>
            <Grid className="w-5 h-5" />
          </Button>
          <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="icon" className="rounded-lg h-10 w-10" onClick={() => setViewMode('list')}>
            <List className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
