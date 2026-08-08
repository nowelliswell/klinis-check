import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, RotateCcw, Download } from "lucide-react";

interface FilterToolbarProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  search: string;
  onSearchChange: (v: string) => void;
  /** Optional unit filter */
  unit?: string;
  onUnitChange?: (v: string) => void;
  unitOptions?: string[];
  onReset: () => void;
  /** Export handler or URL */
  onExport?: () => void;
}

export function FilterToolbar({
  from, to, onFromChange, onToChange,
  search, onSearchChange,
  unit, onUnitChange, unitOptions,
  onReset, onExport,
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
      <div className="flex w-full gap-3 sm:w-auto">
        <div className="flex-1 space-y-1 sm:flex-none">
          <label className="text-xs font-medium text-muted-foreground">Dari</label>
          <Input type="date" value={from} onChange={(e) => onFromChange(e.target.value)} className="h-9 w-full sm:w-36" />
        </div>
        <div className="flex-1 space-y-1 sm:flex-none">
          <label className="text-xs font-medium text-muted-foreground">Sampai</label>
          <Input type="date" value={to} onChange={(e) => onToChange(e.target.value)} className="h-9 w-full sm:w-36" />
        </div>
      </div>
      
      {unitOptions && onUnitChange && (
        <div className="w-full space-y-1 sm:w-auto">
          <label className="text-xs font-medium text-muted-foreground">Unit</label>
          <Select value={unit || ""} onValueChange={onUnitChange}>
            <SelectTrigger className="h-9 w-full sm:w-40">
              <SelectValue placeholder="Semua Unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Semua Unit</SelectItem>
              {unitOptions.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="w-full space-y-1 sm:w-auto">
        <label className="text-xs font-medium text-muted-foreground">Cari</label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Observer / Petugas"
            className="h-9 w-full pl-8 sm:w-52"
          />
        </div>
      </div>
      
      <div className="flex w-full items-center gap-2 sm:w-auto">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:flex-none"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
        {onExport && (
          <button
            type="button"
            onClick={onExport}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 sm:flex-none"
          >
            <Download className="h-3.5 w-3.5" /> Export CSV
          </button>
        )}
      </div>
    </div>
  );
}
