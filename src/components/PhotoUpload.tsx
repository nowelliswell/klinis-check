import { useRef, useState, useEffect } from "react";
import { Camera, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
  error?: boolean;
}

export function PhotoUpload({ value, onChange, label = "Bukti Foto Kepatuhan", error }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {preview ? (
        <div className="relative overflow-hidden rounded-2xl border border-border shadow-soft">
          <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="absolute top-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-background/90 text-destructive shadow-lift backdrop-blur"
            aria-label="Hapus foto"
          >
            <X className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lift"
          >
            <Camera className="h-4 w-4" /> Ganti
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors",
            "bg-accent/30 hover:bg-accent/50 active:bg-accent/60",
            error ? "border-destructive" : "border-border",
          )}
        >
          <div className="grid h-14 w-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft">
            <Camera className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Ketuk untuk ambil foto</p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" /> Kamera belakang akan otomatis terbuka
            </p>
          </div>
        </button>
      )}
      {error && <p className="text-xs font-medium text-destructive">Foto wajib diunggah.</p>}
    </div>
  );
}
