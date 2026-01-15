import { Wifi, Activity, Zap, Globe, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StatsHud({ stats }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
      {stats.map((stat, i) => (
        <Card key={i} className="glass-premium p-4 md:p-6 card-premium border-none relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary/10 group-hover:bg-primary transition-all duration-300" />
          <div className="flex justify-between items-start">
            <div className="space-y-0.5 md:space-y-1">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <h3 className="text-xl md:text-3xl font-black tracking-tight">{stat.value}</h3>
            </div>
            <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl bg-primary/5 ${stat.color}`}>
              <stat.icon className="w-4 h-4 md:w-6 md:h-6" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
