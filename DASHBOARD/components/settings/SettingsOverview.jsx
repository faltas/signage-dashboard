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
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
      {sections.map((s, i) => (
        <Card
          key={i}
          className="glass-premium p-4 md:p-5 border-none relative group rounded-xl shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white/5 flex items-center justify-center ${s.color}`}>
              <s.icon className="w-4.5 h-4.5" />
            </div>

            <div className="space-y-0.5">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                {s.label}
              </p>
              <p className="text-sm font-black leading-none">{s.status}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
