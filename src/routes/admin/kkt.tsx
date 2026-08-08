import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { getKkt, getExportUrl, getPhotoUrl, type KktRecord } from "@/lib/admin-api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/kkt")({
  component: AdminKkt,
});

const unitOptions = ["Ruang Tindakan", "Apotek", "Administrasi"];

function complianceBadge(val: string) {
  if (val === "HR") return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">HR</span>;
  if (val === "HW") return <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">HW</span>;
  return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Tidak</span>;
}

function AdminKkt() {
  const [data, setData] = useState<KktRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [unit, setUnit] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<KktRecord | null>(null);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getKkt({ page: p, limit: 15, from, to, unit: unit === "__all__" ? "" : unit, search });
      setData(res.data);
      setTotal(res.total);
      setPages(res.pages);
      setPage(res.page);
    } catch (err) {
      toast.error("Gagal memuat data KKT.", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [from, to, unit, search]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleReset = () => {
    setFrom(""); setTo(""); setUnit(""); setSearch("");
  };

  const handleExport = () => {
    window.open(getExportUrl("kkt", from, to), "_blank");
  };

  // Compute compliance %
  const totalMoments = total * 5;
  const complianceNote = total > 0
    ? `${total} records • ${totalMoments} total moment observasi`
    : "";

  const columns = [
    { key: "id", header: "#", className: "w-12" },
    {
      key: "tanggal_pengumpulan", header: "Tanggal",
      render: (r: KktRecord) => new Date(r.tanggal_pengumpulan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { key: "nama_observer", header: "Observer" },
    { key: "unit", header: "Unit" },
    { key: "nama_petugas", header: "Petugas" },
    { key: "m1_sebelum_kontak", header: "M1", render: (r: KktRecord) => complianceBadge(r.m1_sebelum_kontak) },
    { key: "m2_sebelum_tindakan", header: "M2", render: (r: KktRecord) => complianceBadge(r.m2_sebelum_tindakan) },
    { key: "m3_setelah_cairan", header: "M3", render: (r: KktRecord) => complianceBadge(r.m3_setelah_cairan) },
    { key: "m4_setelah_kontak", header: "M4", render: (r: KktRecord) => complianceBadge(r.m4_setelah_kontak) },
    { key: "m5_setelah_lingkungan", header: "M5", render: (r: KktRecord) => complianceBadge(r.m5_setelah_lingkungan) },
    {
      key: "bukti_foto", header: "Foto",
      render: (r: KktRecord) => r.bukti_foto
        ? <span className="text-xs text-primary underline">Lihat</span>
        : <span className="text-xs text-muted-foreground">—</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Data Kebersihan Tangan (KKT)</h1>
        {complianceNote && <p className="mt-1 text-sm text-muted-foreground">{complianceNote}</p>}
      </div>

      <FilterToolbar
        from={from} to={to} onFromChange={setFrom} onToChange={setTo}
        search={search} onSearchChange={setSearch}
        unit={unit} onUnitChange={setUnit} unitOptions={unitOptions}
        onReset={handleReset}
        onExport={handleExport}
      />

      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        page={page}
        pages={pages}
        total={total}
        onPageChange={fetchData}
        onRowClick={(row) => setSelected(row)}
      />

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Observasi KKT #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Tanggal" value={selected.tanggal_pengumpulan} />
                <DetailItem label="Unit" value={selected.unit} />
                <DetailItem label="Observer" value={selected.nama_observer} />
                <DetailItem label="Petugas" value={selected.nama_petugas} />
              </div>
              <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Indikator 5 Moments</p>
                <div className="space-y-1.5">
                  <MomentRow label="1. Sebelum kontak" value={selected.m1_sebelum_kontak} />
                  <MomentRow label="2. Sebelum tindakan aseptik" value={selected.m2_sebelum_tindakan} />
                  <MomentRow label="3. Setelah kena cairan tubuh" value={selected.m3_setelah_cairan} />
                  <MomentRow label="4. Setelah kontak" value={selected.m4_setelah_kontak} />
                  <MomentRow label="5. Setelah kontak lingkungan" value={selected.m5_setelah_lingkungan} />
                </div>
              </div>
              {selected.bukti_foto && (
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Bukti Foto</p>
                  <img
                    src={getPhotoUrl(selected.bukti_foto)}
                    alt="Bukti foto"
                    className="max-h-72 rounded-xl border border-border object-contain"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-foreground">{value}</p>
    </div>
  );
}

function MomentRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground">{label}</span>
      {complianceBadge(value)}
    </div>
  );
}
