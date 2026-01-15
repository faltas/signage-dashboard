import { Grid, Layout } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DisplayViewSwitcher({ mode, setMode }) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant={mode === "grid1" ? "secondary" : "ghost"}
        size="icon"
        className="rounded-md h-8 w-8 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        onClick={() => setMode("grid1")}
      >
        <Grid className="w-4 h-4" />
      </Button>

      <Button
        variant={mode === "grid2" ? "secondary" : "ghost"}
        size="icon"
        className="rounded-md h-8 w-8 text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
        onClick={() => setMode("grid2")}
      >
        <Layout className="w-4 h-4" />
      </Button>
    </div>
  );
}
