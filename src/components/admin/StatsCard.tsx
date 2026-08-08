import type { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: number | string;
  sub?: string;
  gradient?: string;
}

export function StatsCard({ icon, label, value, sub, gradient = "bg-gradient-card-1" }: StatsCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-all hover:shadow-lift">
      <div className={`${gradient} absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 transition-transform group-hover:scale-150`} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className={`${gradient} grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white`}>
            {icon}
          </div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
        </div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight text-foreground">{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}
