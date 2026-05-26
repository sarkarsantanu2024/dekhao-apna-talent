import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, hint, className,
}: { label: string; value: string | number; icon?: LucideIcon; hint?: string; className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-primary/10 p-3 text-primary">
            <Icon className="size-6" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
