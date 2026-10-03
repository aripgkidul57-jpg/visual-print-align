export type Personel = {
  nrp: string;
  nama: string;
  pangkat: string;
  jabatan: string;
};

export type LetterData = {
  agency: string;
  region: string;
  resort: string;
  numberPrefix: string;
  numberSequence: string;
  numberKka: string;
  numberSuffix: string;
  issueDate: string;
  tugas: string;
  bases: string;
  duties: string;
  city: string;
  authority: string;
  office: string;
  signer: string;
  signerRank: string;
  copyTo: string;
};

export type SuratRecord = {
  id: string;
  nomor: string;
  tanggal: string;
  tugas: string;
  data: unknown;
  penerima_nrp: string[];
  created_at: string;
  updated_at: string;
};

export const initialLetterData: LetterData = {
  agency: "KEPOLISIAN NEGARA REPUBLIK INDONESIA",
  region: "DAERAH JAWA TIMUR",
  resort: "RESORT SITUBONDO",
  numberPrefix: "R/Sprint",
  numberSequence: "2487",
  numberKka: "PAM.3.3",
  numberSuffix: "Satintelkam",
  issueDate: "2016-02-21",
  tugas: "giat Lidik tentang Penunjukan Penjabat (Pj) Kepala Desa di wilayah Kab. Situbondo",
  bases:
    "Undang – Undang Negara Republik Indonesia Nomor 2 Tahun 2002 tgl 08 Januari 2002 tentang Kepolisian Negara Republik Indonesia;\nPeraturan Kepala Kepolisian Negara Republik Indonesia Nomor 15 Tahun 2007 tentang Naskah Dinas di lingkungan Kepolisian Negara Republik Indonesia;\nDisposisi Kasat Intelkam untuk Lidik dan Monitor",
  duties:
    "melaporkan hasil pelaksanaannya kepada pimpinan;\nmelaksanakan perintah ini dengan seksama dan penuh rasa tanggung jawab.",
  city: "Situbondo",
  authority: "a.n. KEPALA KEPOLISIAN RESORT SITUBONDO",
  office: "KASAT INTELKAM",
  signer: "MOHAMAD DJUPRI",
  signerRank: "INSPEKTUR POLISI SATU NRP 68020388",
  copyTo: "Kapolres Situbondo.",
};

const ROMAWI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
const BULAN_ID = [
  "Januari", "Pebruari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember",
];

function parseIssueDate(value: string) {
  const [year, month, day] = (value ?? "").split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

export function buildNumber(data: Pick<LetterData, "numberPrefix" | "numberSequence" | "numberKka" | "numberSuffix" | "issueDate">) {
  const parsed = parseIssueDate(data.issueDate);
  const month = parsed ? ROMAWI[parsed.month - 1] : "…";
  const year = parsed ? String(parsed.year) : "…";
  const prefix = (data.numberPrefix ?? "").trim();
  const sequence = (data.numberSequence ?? "").trim() || "…";
  const kka = (data.numberKka ?? "").trim();
  const suffix = (data.numberSuffix ?? "").trim();
  const head = prefix ? `${prefix}-${sequence}` : sequence;
  return [head, month, kka, year, suffix].filter(Boolean).join("/");
}

export function formatTanggal(value: string) {
  const parsed = parseIssueDate(value);
  if (!parsed) return "…";
  return `${parsed.day} ${BULAN_ID[parsed.month - 1]} ${parsed.year}`;
}

export function hydrateLetterData(value: unknown): LetterData {
  if (!value || typeof value !== "object" || Array.isArray(value)) return initialLetterData;
  return { ...initialLetterData, ...(value as Partial<LetterData>) };
}

export const splitLines = (value: string) =>
  (value ?? "").split("\n").filter((line) => line.trim());