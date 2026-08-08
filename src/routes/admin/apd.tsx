import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/DataTable";
import { FilterToolbar } from "@/components/admin/FilterToolbar";
import { getApd, getExportUrl, getPhotoUrl, type ApdRecord } from "@/lib/admin-api";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/apd")({
  component: AdminApd,
});

const unitOptions = ["Ruang Tindakan", "Apotek", "Administrasi"];

function apdBadge(val: string) {
  if (val === "YA")
    return <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Ya</span>;
  return <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Tidak</span>;
}

function AdminApd() {
  const [data, setData] = useState<ApdRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [unit, setUnit] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ApdRecord | null>(null);

  const fetchData = useCallback(async (p: number) => {
    setLoading(true);
    try {
      const res = await getApd({ page: p, limit: 15, from, to, unit: unit === "__all__" ? "" : unit, search });
      setData(res.data);
      setTotal(res.total);
      setPages(res.pages);
      setPage(res.page);
    } catch (err) {
      toast.error("Gagal memuat data APD.", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  }, [from, to, unit, search]);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleReset = () => { setFrom(""); setTo(""); setUnit(""); setSearch(""); };

  const handleExport = () => {
    window.open(getExportUrl("apd", from, to), "_blank");
  };

  const columns = [
    { key: "id", header: "#", className: "w-12" },
    {
      key: "tanggal_pengumpulan", header: "Tanggal",
      render: (r: ApdRecord) => new Date(r.tanggal_pengumpulan).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    },
    { key: "unit", header: "Unit" },
    { key: "nama_observer", header: "Observer" },
    { key: "nama_petugas", header: "Petugas" },
    { key: "penggunaan_apd", header: "APD", render: (r: ApdRecord) => apdBadge(r.penggunaan_apd) },
    {
      key: "bukti_foto", header: "Foto",
      render: (r: ApdRecord) => r.bukti_foto
        ? (
          <img
            src={getPhotoUrl(r.bukti_foto)}
            alt="Bukti"
            className="h-9 w-9 rounded-lg border border-border object-cover"
          />
        )
        : <span className="text-xs text-muted-foreground">—</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Data Kepatuhan APD</h1>
        {total > 0 && <p className="mt-1 text-sm text-muted-foreground">{total} total records</p>}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail APD #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <DetailItem label="Tanggal" value={selected.tanggal_pengumpulan} />
                <DetailItem label="Unit" value={selected.unit} />
                <DetailItem label="Observer" value={selected.nama_observer} />
                <DetailItem label="Petugas" value={selected.nama_petugas} />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/30 p-3">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Penggunaan APD</span>
                {apdBadge(selected.penggunaan_apd)}
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
