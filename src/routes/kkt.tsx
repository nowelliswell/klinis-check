import { createFileRoute } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { FormShell, SectionCard, Field, IndicatorBlock } from "@/components/FormShell";
import { BigChoice } from "@/components/BigChoice";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { submitForm } from "@/lib/submit";
import { API_BASE } from "@/lib/api-config";

export const Route = createFileRoute("/kkt")({
  head: () => ({
    meta: [
      { title: "Form KKT — Kebersihan Tangan | Monitoring Kepatuhan Klinis" },
      { name: "description", content: "Formulir observasi kepatuhan kebersihan tangan (5 Moments)." },
    ],
  }),
  component: KKTPage,
});

const indikator = [
  "Sebelum kontak dengan pengguna layanan/spesimen",
  "Sebelum Tindakan Aseptik",
  "Setelah kena cairan tubuh pengguna layanan/spesimen",
  "Setelah kontak dengan pengguna layanan/spesimen",
  "Setelah kontak lingkungan",
];

const opsi = [
  { value: "HR", label: "HR", tone: "positive" as const },
  { value: "HW", label: "HW", tone: "positive" as const },
  { value: "TIDAK", label: "Tidak", tone: "negative" as const },
];

const unitList = ["Ruang Tindakan", "Apotek", "Administrasi"];

function KKTPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [observer, setObserver] = useState("");
  const [unit, setUnit] = useState("");
  const [petugas, setPetugas] = useState("");
  const [answers, setAnswers] = useState<(string | null)[]>(Array(indikator.length).fill(null));
  const [foto, setFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!tanggal) errs.tanggal = true;
    if (!observer.trim()) errs.observer = true;
    if (!unit) errs.unit = true;
    if (!petugas.trim()) errs.petugas = true;
    answers.forEach((a, i) => { if (!a) errs[`i${i}`] = true; });
    if (!foto) errs.foto = true;
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Lengkapi semua isian terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      await submitForm(`${API_BASE}/save_kkt.php`, {
        jenis: "KKT",
        tanggal,
        observer,
        unit,
        petugas,
        indikator: indikator.map((label, i) => ({ label, jawaban: answers[i] })),
      }, foto);
      toast.success("Data KKT berhasil dikirim.");
      setTimeout(() => router.navigate({ to: "/" }), 900);
    } catch (err) {
      toast.error("Gagal mengirim data.", { description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormShell
      title="Kepatuhan Kebersihan Tangan"
      subtitle="5 Moments Hand Hygiene"
      accent="teal"
    >
      <form onSubmit={handleSubmit} noValidate>
        <SectionCard title="Metadata Observasi">
          <Field label="Tanggal Pengumpulan Data" error={errors.tanggal ? "Wajib diisi" : undefined}>
            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="h-12" />
          </Field>
          <Field label="Nama Observer" error={errors.observer ? "Wajib diisi" : undefined}>
            <Input value={observer} onChange={(e) => setObserver(e.target.value)} placeholder="Nama lengkap" className="h-12" />
          </Field>
          <Field label="Unit / Ruangan" error={errors.unit ? "Pilih unit" : undefined}>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="!h-12"><SelectValue placeholder="Pilih unit" /></SelectTrigger>
              <SelectContent>
                {unitList.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nama Petugas yang Diobservasi" error={errors.petugas ? "Wajib diisi" : undefined}>
            <Input value={petugas} onChange={(e) => setPetugas(e.target.value)} placeholder="Nama petugas" className="h-12" />
          </Field>
        </SectionCard>

        <SectionCard title="Indikator 5 Moments" description="HR = Handrub • HW = Handwash • Tidak = Tidak dilakukan">
          {indikator.map((label, i) => (
            <IndicatorBlock
              key={i}
              index={i + 1}
              label={label}
              error={errors[`i${i}`] ? "Pilih salah satu opsi" : undefined}
            >
              <BigChoice
                options={opsi}
                value={answers[i]}
                onChange={(v) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)))}
              />
            </IndicatorBlock>
          ))}
        </SectionCard>

        <SectionCard>
          <PhotoUpload value={foto} onChange={setFoto} error={errors.foto} />
        </SectionCard>

        <SubmitButton submitting={submitting} />
      </form>
    </FormShell>
  );
}

function SubmitButton({ submitting }: { submitting: boolean }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-hero px-4 py-4 text-base font-bold text-white shadow-lift transition-all active:scale-[0.98] disabled:opacity-70"
    >
      {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim...</> : <><Save className="h-5 w-5" /> Simpan Data</>}
    </button>
  );
}
