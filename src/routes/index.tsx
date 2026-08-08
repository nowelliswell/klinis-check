import { createFileRoute, Link } from "@tanstack/react-router";
import { HandMetal, UserCheck, ShieldPlus, ArrowRight, Stethoscope, LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

const menus = [
  {
    to: "/kkt",
    title: "Kebersihan Tangan",
    subtitle: "KKT — 5 Moments Hand Hygiene",
    icon: HandMetal,
    gradient: "bg-gradient-card-1",
  },
  {
    to: "/identifikasi",
    title: "Identifikasi Pasien",
    subtitle: "Verifikasi identitas sebelum tindakan",
    icon: UserCheck,
    gradient: "bg-gradient-card-2",
  },
  {
    to: "/apd",
    title: "Kepatuhan APD",
    subtitle: "Penggunaan APD sesuai indikasi",
    icon: ShieldPlus,
    gradient: "bg-gradient-card-3",
  },
] as const;

function Dashboard() {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-background pb-16">
      <header className="bg-gradient-hero text-white">
        <div className="mx-auto max-w-2xl px-5 pb-12 pt-10">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-white/80">Audit Lapangan</p>
              <p className="text-sm font-medium">{today}</p>
            </div>
          </div>
          <h1 className="mt-6 text-2xl font-extrabold leading-tight sm:text-3xl">
            Sistem Monitoring<br />Kepatuhan Klinis
          </h1>
          <p className="mt-2 text-sm text-white/85">
            Pilih formulir observasi di bawah untuk memulai audit.
          </p>
        </div>
      </header>

      <main className="mx-auto -mt-6 max-w-2xl px-4">
        <div className="space-y-3">
          {menus.map((m, i) => (
            <Link
              key={m.to}
              to={m.to}
              className="group block overflow-hidden rounded-2xl bg-card shadow-soft transition-all active:scale-[0.98] hover:shadow-lift"
            >
              <div className="flex items-stretch">
                <div className={`${m.gradient} flex w-24 shrink-0 items-center justify-center text-white`}>
                  <m.icon className="h-10 w-10" strokeWidth={1.8} />
                </div>
                <div className="flex flex-1 items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      Form {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-0.5 truncate text-base font-bold text-foreground sm:text-lg">
                      {m.title}
                    </h2>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {m.subtitle}
                    </p>
                  </div>
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary transition-transform group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Panduan Singkat
          </p>
          <p className="mt-2 text-sm text-foreground">
            Isi setiap indikator dengan jujur sesuai observasi langsung. Data dikirim ke server pusat setelah tombol <b>Simpan</b> ditekan.
          </p>
        </div>

        <Link
          to="/admin"
          className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-4 py-3.5 text-sm font-semibold text-muted-foreground shadow-soft transition-all hover:bg-secondary hover:text-foreground hover:shadow-lift active:scale-[0.98]"
        >
          <LayoutDashboard className="h-4 w-4" />
          Panel Admin
          <ArrowRight className="ml-auto h-4 w-4" />
        </Link>
      </main>
    </div>
  );
}
