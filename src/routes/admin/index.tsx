import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { HandMetal, UserCheck, ShieldPlus, CalendarCheck, TrendingUp, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { StatsCard } from "@/components/admin/StatsCard";
import { getStats, type StatsResponse } from "@/lib/admin-api";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/")({
  component: AdminOverview,
});

const PIE_COLORS = ["#10b981", "#3b82f6", "#ef4444", "#a855f7", "#f59e0b"];

function AdminOverview() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((err) => toast.error("Gagal memuat statistik.", { description: err.message }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div><Skeleton className="h-8 w-48" /></div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Prepare pie data for KKT
  const kktPieData = Object.entries(stats.distribution.kkt)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Prepare pie data for APD
  const apdPieData = Object.entries(stats.distribution.apd)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Prepare pie data for Identifikasi
  const idPieData = Object.entries(stats.distribution.identifikasi)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  // Trend data — format tanggal pendek
  const trendData = stats.trend.map((t) => ({
    ...t,
    label: new Date(t.tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Ringkasan data observasi kepatuhan klinis</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon={<HandMetal className="h-5 w-5" />}
          label="Total KKT"
          value={stats.totals.kkt}
          sub={`${stats.month.kkt} bulan ini`}
          gradient="bg-gradient-card-1"
        />
        <StatsCard
          icon={<UserCheck className="h-5 w-5" />}
          label="Total Identifikasi"
          value={stats.totals.identifikasi}
          sub={`${stats.month.identifikasi} bulan ini`}
          gradient="bg-gradient-card-2"
        />
        <StatsCard
          icon={<ShieldPlus className="h-5 w-5" />}
          label="Total APD"
          value={stats.totals.apd}
          sub={`${stats.month.apd} bulan ini`}
          gradient="bg-gradient-card-3"
        />
        <StatsCard
          icon={<CalendarCheck className="h-5 w-5" />}
          label="Hari Ini"
          value={stats.today.all}
          sub={`KKT ${stats.today.kkt} • ID ${stats.today.identifikasi} • APD ${stats.today.apd}`}
          gradient="bg-gradient-hero"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Trend Line Chart */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Trend 30 Hari Terakhir</h2>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  fontSize: 12,
                }}
              />
              <Line type="monotone" dataKey="kkt" name="KKT" stroke="#0ea5b7" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="identifikasi" name="Identifikasi" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="apd" name="APD" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Charts */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-foreground">Distribusi Kepatuhan</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-2">
            <MiniPie title="KKT" data={kktPieData} />
            <MiniPie title="Identifikasi" data={idPieData} />
            <MiniPie title="APD" data={apdPieData} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniPie({ title, data }: { title: string; data: { name: string; value: number }[] }) {
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">{title}</p>
        <p className="text-xs text-muted-foreground/60">Belum ada data</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <p className="mb-1 text-xs font-semibold text-muted-foreground">{title}</p>
      <ResponsiveContainer width="100%" height={130}>
        <PieChart>
          <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={3}>
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              background: "var(--card)",
              fontSize: 11,
            }}
          />
          <Legend
            wrapperStyle={{ fontSize: 9 }}
            iconSize={8}
            formatter={(value) => <span className="text-muted-foreground">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
