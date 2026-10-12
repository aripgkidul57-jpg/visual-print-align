export type PersonilInput = {
  nrp: string; nama: string; pangkat: string; jabatan: string; email: string;
  kriteria: "admin" | "maintenance" | "user"; status: "aktif" | "nonaktif";
};

export function validasiPersonil(p: PersonilInput): string | null {
  if (!/^[0-9A-Za-z.-]{3,30}$/.test(p.nrp.trim())) return "NRP wajib diisi (3–30 karakter, angka/huruf).";
  if (!p.nama.trim()) return "Nama wajib diisi.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(p.email.trim())) return "Email wajib diisi dengan format yang benar agar personil bisa login OTP.";
  if (!["admin", "maintenance", "user"].includes(p.kriteria)) return "Kriteria tidak valid.";
  if (!["aktif", "nonaktif"].includes(p.status)) return "Status tidak valid.";
  return null;
}
