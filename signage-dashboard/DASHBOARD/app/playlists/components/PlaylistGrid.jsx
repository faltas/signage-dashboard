import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, MoreHorizontal, Layers, Clock, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/language-provider";

export function PlaylistGrid({ playlists }) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
      {playlists.map((pl) => (
        <Link key={pl.id} href={`/playlists/${pl.id}`} className="group">
          <Card className="glass-premium card-premium p-8 flex flex-col gap-8 border-none relative overflow-hidden h-full">
            <div className="flex justify-between items-start relative z-10">
              <div className="p-5 bg-primary/10 rounded-[2rem] group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-2xl shadow-primary/20">
                <PlayCircle className="w-8 h-8" />
              </div>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/40 hover:text-white transition-colors hover:bg-white/5 rounded-xl"><MoreHorizontal className="w-5 h-5" /></Button>
            </div>
            <div className="space-y-3 relative z-10">
              <h4 className="text-2xl font-black tracking-tight group-hover:text-primary transition-colors duration-500 truncate">{pl.name}</h4>
              <p className="text-sm text-muted-foreground font-medium line-clamp-2 min-h-[40px] leading-relaxed">
                {pl.description || t('default_playlist_descr')}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 relative z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Layers className="w-3 h-3" /> {t('count_contents')}</p>
                <p className="text-lg font-black tracking-tight">0 Media</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Clock className="w-3 h-3" /> {t('lenght_playlist')}</p>
                <p className="text-lg font-black tracking-tight">0s</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-primary font-black text-xs tracking-[0.2em] pt-4 group-hover:gap-4 transition-all duration-500 relative z-10">
              {t('mgnt_playlist')} <ArrowRight className="w-5 h-5" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
