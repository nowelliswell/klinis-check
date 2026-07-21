import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { getIdentifikasi, getExportUrl, type IdentifikasiRecord } from "@/lib/admin-api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/identifikasi")({
  component: AdminIdentifikasi,
});

function statusBadge(val: string) {
  if (val === "YA")
    return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Ya</span>;
  if (val === "TIDAK")
    return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Tidak</span>;
  return <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">N/A</span>;
}

function AdminIdentifikasi() {
  const [data, setData] = useState<IdentifikasiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IdentifikasiRecord | null>(null);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getIdentifikasi({ page: p, limit: 15, from, to, search });
      setData(res.data);
      setTotal(res.total);
      setPages(res.pages);
      setPage(res.page);
    } catch (err) {
      toast.error("Gagal memuat data Identifikasi.", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [from, to, search]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleReset = () => { setFrom(""); setTo(""); setSearch(""); };

  const handleExport = () => {
    window.open(getExportUrl("identifikasi", from, to), "_blank");
  };

  const columns = [
    { key: "id", header: "#", className: "w-12" },
    {
      key: "tanggal_observasi", header: "Tanggal",
      render: (r: IdentifikasiRecord) => new Date(r.tanggal_observasi).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { key: "nama_observer", header: "Observer" },
    { key: "nama_petugas", header: "Petugas" },
    { key: "pemberian_obat", header: "Obat", render: (r: IdentifikasiRecord) => statusBadge(r.pemberian_obat) },
    { key: "pencabutan_gigi", header: "Gigi", render: (r: IdentifikasiRecord) => statusBadge(r.pencabutan_gigi) },
    { key: "pemberian_kontrasepsi", header: "Kontrasepsi", render: (r: IdentifikasiRecord) => statusBadge(r.pemberian_kontrasepsi) },
    { key: "imunisasi", header: "Imunisasi", render: (r: IdentifikasiRecord) => statusBadge(r.imunisasi) },
    { key: "kegawatdaruratan", header: "Darurat", render: (r: IdentifikasiRecord) => statusBadge(r.kegawatdaruratan) },
    { key: "pengambilan_sample", header: "Sample", render: (r: IdentifikasiRecord) => statusBadge(r.pengambilan_sample) },
    { key: "tindakan_lainnya", header: "Lainnya", render: (r: IdentifikasiRecord) => statusBadge(r.tindakan_lainnya) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Data Identifikasi Pasien</h1>
        {total > 0 && <p className="mt-1 text-sm text-muted-foreground">{total} total records</p>}
      </div>

      <FilterToolbar
        from={from} to={to} onFromChange={setFrom} onToChange={setTo}
        search={search} onSearchChange={setSearch}
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
            <DialogTitle>Detail Identifikasi Pasien #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Tanggal" value={selected.tanggal_observasi} />
                <DetailItem label="Observer" value={selected.nama_observer} />
                <DetailItem label="Petugas" value={selected.nama_petugas} />
              </div>
              <div className="space-y-2 rounded-xl border border-border bg-secondary/30 p-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Indikator</p>
                <div className="space-y-1.5">
                  <IndikatorRow label="Pemberian obat" value={selected.pemberian_obat} />
                  <IndikatorRow label="Pencabutan gigi" value={selected.pencabutan_gigi} />
                  <IndikatorRow label="Pemberian kontrasepsi" value={selected.pemberian_kontrasepsi} />
                  <IndikatorRow label="Imunisasi" value={selected.imunisasi} />
                  <IndikatorRow label="Kegawatdaruratan" value={selected.kegawatdaruratan} />
                  <IndikatorRow label="Pengambilan sample" value={selected.pengambilan_sample} />
                  <IndikatorRow label="Tindakan lainnya" value={selected.tindakan_lainnya} />
                </div>
              </div>
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

function IndikatorRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-foreground">{label}</span>
      {statusBadge(value)}
    </div>
  );
}
