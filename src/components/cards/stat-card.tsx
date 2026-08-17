import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label, value, icon: Icon, hint, className,
}: { label: string; value: string | number; icon?: LucideIcon; hint?: string; className?: string }) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex items-center justify-between gap-2 p-4 sm:p-6">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground sm:text-sm">{label}</p>
          <p className="mt-1 text-2xl font-bold sm:mt-2 sm:text-3xl">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (
          <div className="hidden shrink-0 rounded-lg bg-primary/10 p-3 text-primary sm:block">
            <Icon className="size-6" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
