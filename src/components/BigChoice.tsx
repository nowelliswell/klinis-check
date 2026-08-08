import { cn } from "@/lib/utils";

export interface ChoiceOption {
  value: string;
  label: string;
  tone?: "positive" | "negative" | "neutral";
}

interface BigChoiceProps {
  options: ChoiceOption[];
  value: string | null;
  onChange: (value: string) => void;
  error?: boolean;
}

const toneClasses: Record<string, string> = {
  positive:
    "data-[active=true]:bg-success data-[active=true]:text-success-foreground data-[active=true]:border-success",
  negative:
    "data-[active=true]:bg-destructive data-[active=true]:text-destructive-foreground data-[active=true]:border-destructive",
  neutral:
    "data-[active=true]:bg-muted-foreground data-[active=true]:text-background data-[active=true]:border-muted-foreground",
};

export function BigChoice({ options, value, onChange, error }: BigChoiceProps) {
  return (
    <div
      className={cn(
        "grid gap-2",
        options.length === 2 ? "grid-cols-2" : "grid-cols-3",
      )}
    >
      {options.map((opt) => {
        const active = value === opt.value;
        const tone = opt.tone ?? "positive";
        return (
          <button
            key={opt.value}
            type="button"
            data-active={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "min-h-14 rounded-xl border-2 bg-card px-2 py-3 text-sm font-bold uppercase tracking-wide text-foreground transition-all",
              "active:scale-[0.97] hover:border-primary/50",
              error && !active ? "border-destructive/60" : "border-border",
              toneClasses[tone],
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
