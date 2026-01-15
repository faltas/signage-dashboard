import { Card } from "@/components/ui/card";
import { Shield, Cpu, Cloud, Settings2 } from "lucide-react";

export function SettingsOverview() {
  const sections = [
    { label: "Security", icon: Shield, status: "Active", color: "text-emerald-400" },
    { label: "Computing", icon: Cpu, status: "Normal", color: "text-blue-400" },
    { label: "Cloud Sync", icon: Cloud, status: "Synced", color: "text-primary" },
    { label: "Protocols", icon: Settings2, status: "v4.0", color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {sections.map((s, i) => (
        <Card key={i} className="glass-premium p-6 border-none relative group">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-2xl bg-white/5 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <p className="text-sm font-black">{s.status}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
