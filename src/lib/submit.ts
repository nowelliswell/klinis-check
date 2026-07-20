export async function submitForm(url: string, payload: Record<string, unknown>, file?: File | null) {
  const fd = new FormData();
  fd.append("data", JSON.stringify(payload));
  if (file) fd.append("foto", file, file.name);

  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Server merespons ${res.status}`);
  try {
    return await res.json();
  } catch {
    return { ok: true };
  }
}
