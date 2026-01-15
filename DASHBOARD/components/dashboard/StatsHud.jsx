import { Card } from "@/components/ui/card";

export function StatsHud({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card
          key={i}
          className="p-4 md:p-6 border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow duration-200"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </p>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-bold tracking-tight text-foreground">
              {stat.value}
            </h3>
          </div>
        </Card>
      ))}
    </div>
  );
}
