import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Lock, Stethoscope } from "lucide-react";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/admin-api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login Admin | Monitoring Kepatuhan Klinis" },
      { name: "description", content: "Halaman login untuk admin panel monitoring kepatuhan klinis." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Username dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
      await login(username.trim(), password);
      toast.success("Login berhasil.");
      setTimeout(() => router.navigate({ to: "/admin" }), 300);
    } catch (err) {
      toast.error("Login gagal.", { description: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      {/* Background decorative circles */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/5" />
        <div className="absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full bg-white/5" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-white/3" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <Stethoscope className="h-8 w-8" />
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Monitoring Kepatuhan Klinis</h1>
          <p className="mt-1 text-sm text-white/70">Masuk ke Panel Admin</p>
        </div>

        {/* Login Card */}
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2 text-white/80">
            <Lock className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Login Admin</span>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/90">Username</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/90">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="h-12 border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:border-white/40 focus:ring-white/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:bg-white/90 active:scale-[0.98] disabled:opacity-70"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Memproses...</>
            ) : (
              "Masuk"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          &copy; {new Date().getFullYear()} Sistem Monitoring Kepatuhan Klinis
        </p>
      </div>
    </div>
  );
}
