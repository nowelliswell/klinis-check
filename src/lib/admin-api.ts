import { API_BASE } from "@/lib/api-config";

export interface AdminUser {
  id: number;
  username: string;
  nama: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface StatsResponse {
  status: string;
  totals: Record<string, number>;
  today: Record<string, number>;
  month: Record<string, number>;
  distribution: {
    kkt: Record<string, number>;
    identifikasi: Record<string, number>;
    apd: Record<string, number>;
  };
  trend: Array<{ tanggal: string; kkt: number; identifikasi: number; apd: number }>;
}

export interface KktRecord {
  id: number;
  timestamp: string;
  tanggal_pengumpulan: string;
  nama_observer: string;
  unit: string;
  nama_petugas: string;
  m1_sebelum_kontak: string;
  m2_sebelum_tindakan: string;
  m3_setelah_cairan: string;
  m4_setelah_kontak: string;
  m5_setelah_lingkungan: string;
  bukti_foto: string | null;
}

export interface IdentifikasiRecord {
  id: number;
  timestamp: string;
  tanggal_observasi: string;
  nama_observer: string;
  nama_petugas: string;
  pemberian_obat: string;
  pencabutan_gigi: string;
  pemberian_kontrasepsi: string;
  imunisasi: string;
  kegawatdaruratan: string;
  pengambilan_sample: string;
  tindakan_lainnya: string;
}

export interface ApdRecord {
  id: number;
  timestamp: string;
  tanggal_pengumpulan: string;
  unit: string;
  nama_observer: string;
  nama_petugas: string;
  penggunaan_apd: string;
  bukti_foto: string | null;
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401 && !url.includes("login.php")) {
      window.location.href = "/login";
      throw new Error("Sesi habis. Silakan login kembali.");
    }
    throw new Error(body.message || `HTTP ${res.status}`);
  }
  return res.json();
}

export async function login(username: string, password: string) {
  return apiFetch<{ status: string; message: string; user: AdminUser }>(
    `${API_BASE}/login.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
  );
}

export async function resetPassword(username: string) {
  return apiFetch<{ status: string; message: string; new_password: string }>(
    `${API_BASE}/reset_password.php`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    },
  );
}

export async function logout() {
  return apiFetch<{ status: string }>(`${API_BASE}/logout.php`, { method: "POST" });
}

export async function checkSession() {
  return apiFetch<{ status: string; user: AdminUser }>(`${API_BASE}/check_session.php`);
}

export async function getStats() {
  return apiFetch<StatsResponse>(`${API_BASE}/get_stats.php`);
}

function buildQuery(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") sp.set(k, String(v));
  }
  return sp.toString();
}

export async function getKkt(params: { page?: number; limit?: number; from?: string; to?: string; unit?: string; search?: string } = {}) {
  const q = buildQuery(params);
  return apiFetch<PaginatedResponse<KktRecord>>(`${API_BASE}/get_kkt.php?${q}`);
}

export async function getIdentifikasi(params: { page?: number; limit?: number; from?: string; to?: string; search?: string } = {}) {
  const q = buildQuery(params);
  return apiFetch<PaginatedResponse<IdentifikasiRecord>>(`${API_BASE}/get_identifikasi.php?${q}`);
}

export async function getApd(params: { page?: number; limit?: number; from?: string; to?: string; unit?: string; search?: string } = {}) {
  const q = buildQuery(params);
  return apiFetch<PaginatedResponse<ApdRecord>>(`${API_BASE}/get_apd.php?${q}`);
}

export function getExportUrl(type: "kkt" | "identifikasi" | "apd", from?: string, to?: string) {
  const q = buildQuery({ type, from, to });
  return `${API_BASE}/export_csv.php?${q}`;
}

export function getPhotoUrl(filename: string) {
  return `${API_BASE}/uploads/${filename}`;
}
