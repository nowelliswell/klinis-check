export async function submitForm(url: string, payload: Record<string, unknown>, file?: File | null) {
  let res: Response;

  if (file) {
    // KKT & APD — kirim FormData agar bisa menyertakan file biner gambar
    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    fd.append("foto", file, file.name);
    res = await fetch(url, { method: "POST", body: fd });
  } else {
    // Identifikasi Pasien — kirim JSON Payload (tanpa media)
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  if (!res.ok) throw new Error(`Server merespons ${res.status}`);
  try {
    return await res.json();
  } catch {
    return { ok: true };
  }
}
