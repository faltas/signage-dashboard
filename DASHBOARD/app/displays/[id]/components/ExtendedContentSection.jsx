import { Maximize2, PlayCircle, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ExtendedContentSection({ duplicateContents, extendedContents, onToggleExtend }) {
  return (
    <Card className="p-6 border border-border/40 shadow-sm bg-card">
      <div className="flex items-center gap-3 mb-4">
        <Maximize2 className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Contenuti Estendibili</h2>
        <Badge variant="secondary" className="text-xs">{duplicateContents.length} contenuti condivisi</Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-6">
        I seguenti contenuti sono presenti in più schermi. 
        Estendili per un effetto video wall.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {duplicateContents.map(({ content, screens }) => (
          <div 
            key={content.id}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              extendedContents.includes(content.id) 
                ? "bg-primary/5 border-primary/20 shadow-sm" 
                : "bg-muted/10 border-border hover:bg-muted/20"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center border border-border/10">
                {content.type === "immagine" || content.type === "image" ? (
                  <img src={content.url} className="w-full h-full object-cover" alt={content.name} />
                ) : (
                  <PlayCircle className="w-6 h-6 text-muted-foreground/50" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm truncate max-w-[150px] text-foreground">{content.name}</p>
                <p className="text-xs text-muted-foreground">
                  Schermi: {screens.map(s => s.screenIndex + 1).join(", ")}
                </p>
              </div>
            </div>
            
            <Button
              variant={extendedContents.includes(content.id) ? "default" : "outline"}
              size="sm"
              onClick={() => onToggleExtend(content.id)}
              className="gap-2"
            >
              {extendedContents.includes(content.id) ? <Check className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {extendedContents.includes(content.id) ? "Esteso" : "Estendi"}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
