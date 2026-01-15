import { Grid, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DisplayViewSwitcher({ mode, setMode }) {
  return (
    <div className="flex bg-white/5 rounded-xl p-1">
      <Button 
        variant={mode === 'grid3' ? 'secondary' : 'ghost'} 
        size="icon" 
        className="rounded-lg h-10 w-10" 
        onClick={() => setMode('grid3')}
      >
        <Grid className="w-5 h-5" />
      </Button>
      <Button 
        variant={mode === 'grid5' ? 'secondary' : 'ghost'} 
        size="icon" 
        className="rounded-lg h-10 w-10" 
        onClick={() => setMode('grid5')}
      >
        <Layout className="w-5 h-5" />
      </Button>
    </div>
  );
}
