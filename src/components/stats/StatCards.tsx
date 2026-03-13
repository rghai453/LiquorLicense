import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface Stat {
  label: string;
  value: string | number;
  icon?: LucideIcon;
}

interface StatCardsProps {
  stats: Stat[];
}

export function StatCards({ stats }: StatCardsProps): React.ReactElement {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.label} size="sm">
            <CardContent className="flex items-start gap-3">
              {Icon && (
                <Icon className="size-5 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-2xl font-semibold leading-tight">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {stat.label}
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
