import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, MoreHorizontal, Layers, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/language-provider";
import { useState, useEffect } from "react";
import { useSupabase } from "@/app/providers";

export function PlaylistGrid({ playlists }) {
  const { t } = useLanguage();  
  const supabase = useSupabase();

  const [itemsMap, setItemsMap] = useState({});

  async function loadData() {
    const map = {};

    for (const pl of playlists) {
      const { data: it } = await supabase
        .from("playlist_items")
        .select("*, contents(*)")
        .eq("playlist_id", pl.id);

      map[pl.id] = it || [];
    }

    setItemsMap(map);
  }

  useEffect(() => {
    if (playlists?.length > 0) loadData();
  }, [playlists]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {playlists.map((pl) => (
        <Link key={pl.id} href={`/playlists/${pl.id}`} className="group">
          <Card className="h-full border border-border/40 bg-card shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-200 overflow-hidden flex flex-col">
            
            <div className="p-6 flex-1 flex flex-col gap-6">
              {/* HEADER */}
              <div className="flex justify-between items-start">
                <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform duration-200">
                  <PlayCircle className="w-6 h-6" />
                </div>
                
                {/* 
                  TODO: Implement actions menu
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                */}
              </div>

              {/* CONTENT */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors truncate" title={pl.name}>
                  {pl.name}
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                  {pl.description || t('default_playlist_descr')}
                </p>
              </div>

              {/* STATS */}
              <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>{itemsMap[pl.id]?.length || 0} items</span>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="bg-muted/30 px-6 py-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
              <span>{t('mgnt_playlist')}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </div>

          </Card>
        </Link>
      ))}
    </div>
  );
}
