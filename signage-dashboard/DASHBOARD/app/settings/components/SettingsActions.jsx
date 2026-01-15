import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ShieldAlert } from "lucide-react";

export function SettingsActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
       <Card className="glass-premium p-8 border-none space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-primary/10 rounded-2xl">
                <Database className="w-6 h-6 text-primary" />
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight text-white">Database Synced</h3>
                <p className="text-sm text-muted-foreground">Connected to Supabase Node cluster.</p>
             </div>
          </div>
          <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 font-bold hover:bg-white/5">OPTIMIZE STORAGE</Button>
       </Card>

       <Card className="glass-premium p-8 border-none space-y-6">
          <div className="flex items-center gap-4">
             <div className="p-4 bg-rose-500/10 rounded-2xl">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
             </div>
             <div>
                <h3 className="text-xl font-black tracking-tight text-white">Security Audit</h3>
                <p className="text-sm text-muted-foreground">Last scan: 2 minutes ago.</p>
             </div>
          </div>
          <Button variant="outline" className="w-full h-12 rounded-xl border-white/10 font-bold hover:bg-white/5">RUN FULL SCAN</Button>
       </Card>
    </div>
  );
}
