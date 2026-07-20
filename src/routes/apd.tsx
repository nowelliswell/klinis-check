import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

import { FormShell, SectionCard, Field, IndicatorBlock } from "@/components/FormShell";
import { BigChoice } from "@/components/BigChoice";
import { PhotoUpload } from "@/components/PhotoUpload";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { submitForm } from "@/lib/submit";

export const Route = createFileRoute("/apd")({
  head: () => ({
    meta: [
      { title: "Form Kepatuhan APD | Monitoring Kepatuhan Klinis" },
      { name: "description", content: "Formulir observasi kepatuhan penggunaan Alat Pelindung Diri (APD)." },
    ],
  }),
  component: APDPage,
});

const opsi = [
  { value: "YA", label: "Ya", tone: "positive" as const },
  { value: "TIDAK", label: "Tidak", tone: "negative" as const },
];

const unitList = ["Ruang Tindakan", "Apotek", "Administrasi"];

function APDPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);
  const [tanggal, setTanggal] = useState(today);
  const [unit, setUnit] = useState("");
  const [observer, setObserver] = useState("");
  const [petugas, setPetugas] = useState("");
  const [jawaban, setJawaban] = useState<string | null>(null);
  const [foto, setFoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, boolean> = {};
    if (!tanggal) errs.tanggal = true;
    if (!unit) errs.unit = true;
    if (!observer.trim()) errs.observer = true;
    if (!petugas.trim()) errs.petugas = true;
    if (!jawaban) errs.jawaban = true;
    if (!foto) errs.foto = true;
    setErrors(errs);
    if (Object.keys(errs).length) {
      toast.error("Lengkapi semua isian terlebih dahulu.");
      return;
    }

    setSubmitting(true);
    try {
      await submitForm("http://localhost/api/save_apd.php", {
        jenis: "APD",
        tanggal,
        unit,
        observer,
        petugas,
        indikator: [{ label: "PENGGUNAAN APD LENGKAP SESUAI INDIKASI", jawaban }],
      }, foto);
      toast.success("Data APD berhasil dikirim.");
      setTimeout(() => router.navigate({ to: "/" }), 900);
    } catch (err) {
      toast.error("Gagal mengirim data.", { description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormShell title="Kepatuhan APD" subtitle="Alat Pelindung Diri sesuai indikasi" accent="green">
      <form onSubmit={handleSubmit} noValidate>
        <SectionCard title="Metadata Observasi">
          <Field label="Tanggal Pengumpulan Data" error={errors.tanggal ? "Wajib diisi" : undefined}>
            <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} className="h-12" />
          </Field>
          <Field label="Unit / Ruangan" error={errors.unit ? "Pilih unit" : undefined}>
            <Select value={unit} onValueChange={setUnit}>
              <SelectTrigger className="!h-12"><SelectValue placeholder="Pilih unit" /></SelectTrigger>
              <SelectContent>
                {unitList.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Nama Observer" error={errors.observer ? "Wajib diisi" : undefined}>
            <Input value={observer} onChange={(e) => setObserver(e.target.value)} placeholder="Nama lengkap" className="h-12" />
          </Field>
          <Field label="Nama Petugas yang Diobservasi" error={errors.petugas ? "Wajib diisi" : undefined}>
            <Input value={petugas} onChange={(e) => setPetugas(e.target.value)} placeholder="Nama petugas" className="h-12" />
          </Field>
        </SectionCard>

        <SectionCard title="Indikator APD">
          <IndicatorBlock
            index={1}
            label="Penggunaan APD lengkap sesuai indikasi"
            error={errors.jawaban ? "Pilih salah satu opsi" : undefined}
          >
            <BigChoice options={opsi} value={jawaban} onChange={setJawaban} />
          </IndicatorBlock>
        </SectionCard>

        <SectionCard>
          <PhotoUpload value={foto} onChange={setFoto} error={errors.foto} />
        </SectionCard>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-card-3 px-4 py-4 text-base font-bold text-white shadow-lift transition-all active:scale-[0.98] disabled:opacity-70"
        >
          {submitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Mengirim...</> : <><Save className="h-5 w-5" /> Simpan Data</>}
        </button>
      </form>
    </FormShell>
  );
}
