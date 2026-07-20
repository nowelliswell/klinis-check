import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { FormShell, SectionCard, Field, IndicatorBlock } from "@/components/FormShell";
import { BigChoice } from "@/components/BigChoice";
import { Input } from "@/components/ui/input";
import { submitForm } from "@/lib/submit";

export const Route = createFileRoute("/identifikasi")({
  head: () => ({
    meta: [
      { title: "Form Identifikasi Pasien | Monitoring Kepatuhan Klinis" },
      { name: "description", content: "Formulir observasi kepatuhan identifikasi pasien sebelum tindakan." },
    ],
  }),
  component: IdentifikasiPage,
});

const indikator = [
  "Pemberian obat",
  "Tindakan pencabutan gigi",
  "Tindakan pemberian kontrasepsi",
  "Tindakan imunisasi",
  "Tindakan kegawat daruratan",
  "Prosedur pengambilan sample",
  "Tindakan Lainnya",
];

const opsi = [
  { value: "YA", label: "Ya", tone: "positive" as const },
  { value: "TIDAK", label: "Tidak", tone: "negative" as const },
  { value: "TIDAK_ADA_INTERVENSI", label: "Tidak Ada Intervensi", tone: "neutral" as const },
];

function IdentifikasiPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [observer, setObserver] = useState("");
  const [petugas, setPetugas] = useState("");
  const [answers, setAnswers] = useState<(string | null)[]>(Array(indikator.length).fill(null));
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!tanggal) errs.tanggal = true;
    if (!observer.trim()) errs.observer = true;
    if (!petugas.trim()) errs.petugas = true;
    answers.forEach((a, i) => { if (!a) errs[`i${i}`] = true; });
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Lengkapi semua isian terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      await submitForm("http://localhost/api/save_identifikasi.php", {
        jenis: "IDENTIFIKASI_PASIEN",
        tanggal,
        observer,
        petugas,
        indikator: indikator.map((label, i) => ({ label, jawaban: answers[i] })),
      });
      toast.success("Data Identifikasi Pasien berhasil dikirim.");
      setTimeout(() => router.navigate({ to: "/" }), 900);
    } catch (err) {
      toast.error("Gagal mengirim data.", { description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormShell title="Identifikasi Pasien" subtitle="Verifikasi identitas sebelum tindakan" accent="violet">
      <form onSubmit={handleSubmit} noValidate>
        <SectionCard title="Metadata Observasi">
          <Field label="Tanggal Observasi" error={errors.tanggal ? "Wajib diisi" : undefined}>
            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="h-12" />
          </Field>
          <Field label="Nama Observer" error={errors.observer ? "Wajib diisi" : undefined}>
            <Input value={observer} onChange={(e) => setObserver(e.target.value)} placeholder="Nama lengkap" className="h-12" />
          </Field>
          <Field label="Nama Petugas yang Diobservasi" error={errors.petugas ? "Wajib diisi" : undefined}>
            <Input value={petugas} onChange={(e) => setPetugas(e.target.value)} placeholder="Nama petugas" className="h-12" />
          </Field>
        </SectionCard>

        <SectionCard title="Indikator Identifikasi" description="Pilih hasil observasi untuk tiap indikator">
          {indikator.map((label, i) => (
            <IndicatorBlock key={i} index={i + 1} label={label} error={errors[`i${i}`] ? "Pilih salah satu opsi" : undefined}>
              <BigChoice
                options={opsi}
                value={answers[i]}
                onChange={(v) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? v : a)))}
              />
            </IndicatorBlock>
          ))}
        </SectionCard>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-card-2 px-4 py-4 text-base font-bold text-white shadow-lift transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim...</> : <><Save className="h-5 w-5" /> Simpan Data</>}
        </button>
      </form>
    </FormShell>
  );
}
