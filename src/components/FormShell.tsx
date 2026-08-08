import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

interface FormShellProps {
  title: string;
  subtitle?: string;
  accent?: "teal" | "violet" | "green";
  children: ReactNode;
}

const accentMap = {
  teal: "bg-gradient-card-1",
  violet: "bg-gradient-card-2",
  green: "bg-gradient-card-3",
} as const;

export function FormShell({ title, subtitle, accent = "teal", children }: FormShellProps) {
  return (
    <div className="min-h-screen bg-background pb-16">
      <header className={`${accentMap[accent]} text-white`}>
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 pb-8 pt-6">
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 backdrop-blur transition-colors hover:bg-white/25"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold sm:text-xl">{title}</h1>
            {subtitle && <p className="truncate text-xs text-white/85">{subtitle}</p>}
          </div>
        </div>
      </header>
      <main className="mx-auto -mt-4 max-w-2xl px-4">{children}</main>
    </div>
  );
}

export function SectionCard({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-5">
      {title && (
        <div className="mb-4">
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {children}
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}

export function IndicatorBlock({
  index,
  label,
  error,
  children,
}: {
  index: number;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/70 bg-secondary/40 p-3">
      <div className="mb-3 flex items-start gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
          {index}
        </span>
        <p className="min-w-0 text-sm font-medium leading-snug text-foreground">{label}</p>
      </div>
      {children}
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
