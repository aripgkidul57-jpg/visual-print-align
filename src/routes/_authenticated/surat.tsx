import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

type Personel = {
  nrp: string;
  nama: string;
  pangkat: string;
  jabatan: string;
};

type LetterData = {
  agency: string;
  region: string;
  resort: string;
  numberPrefix: string;
  numberSequence: string;
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

const initialData: LetterData = {
  agency: "KEPOLISIAN NEGARA REPUBLIK INDONESIA",
  region: "DAERAH JAWA TIMUR",
  resort: "RESORT SITUBONDO",
  numberPrefix: "R/Sprin",
  numberSequence: "2487",
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
  "Januari",
  "Pebruari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "Nopember",
  "Desember",
];

function parseIssueDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

function buildNumber(data: Pick<LetterData, "numberPrefix" | "numberSequence" | "numberSuffix" | "issueDate">) {
  const parsed = parseIssueDate(data.issueDate);
  const month = parsed ? ROMAWI[parsed.month - 1] : "…";
  const year = parsed ? String(parsed.year) : "…";
  const prefix = (data.numberPrefix ?? "").trim();
  const sequence = (data.numberSequence ?? "").trim() || "…";
  const suffix = (data.numberSuffix ?? "").trim();
  const head = prefix ? `${prefix}-${sequence}` : sequence;
  return suffix ? `${head}/${month}/${year}/${suffix}` : `${head}/${month}/${year}`;
}

function formatTanggal(value: string) {
  const parsed = parseIssueDate(value);
  if (!parsed) return "…";
  return `${parsed.day} ${BULAN_ID[parsed.month - 1]} ${parsed.year}`;
}

const fields: Array<{
  key: keyof LetterData;
  label: string;
  multiline?: boolean;
  hint?: string;
}> = [
  { key: "agency", label: "Instansi" },
  { key: "region", label: "Daerah" },
  { key: "resort", label: "Kesatuan" },
  { key: "tugas", label: "Tugas", multiline: true, hint: "Dipakai pada bagian Pertimbangan dan butir pertama Untuk" },
  { key: "bases", label: "Dasar", multiline: true, hint: "Satu butir per baris" },
  { key: "duties", label: "Untuk", multiline: true, hint: "Satu butir per baris" },
  { key: "city", label: "Dikeluarkan di" },
  { key: "authority", label: "Atas nama" },
  { key: "office", label: "Jabatan penanda tangan" },
  { key: "signer", label: "Nama penanda tangan" },
  { key: "signerRank", label: "Pangkat / NRP" },
  { key: "copyTo", label: "Tembusan" },
];

const lines = (value: string) => (value ?? "").split("\n").filter((line) => line.trim());

export const Route = createFileRoute("/_authenticated/surat")({
  head: () => ({
    meta: [
      { title: "Form Surat Perintah | Polres Situbondo" },
      {
        name: "description",
        content: "Form penyusunan dan pencetakan Surat Perintah Kepolisian Resort Situbondo.",
      },
      { property: "og:title", content: "Form Surat Perintah | Polres Situbondo" },
      {
        property: "og:description",
        content: "Susun dan cetak Surat Perintah dalam format A4 resmi.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [data, setData] = useState(initialData);
  const [personelList, setPersonelList] = useState<Personel[]>([]);
  const [selectedNrp, setSelectedNrp] = useState<string[]>(["79120041", "83040626"]);
  const [newPersonel, setNewPersonel] = useState<Personel>({ nrp: "", nama: "", pangkat: "", jabatan: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("personel")
      .select("*")
      .order("nama")
      .then(({ data: rows }) => {
        if (rows) setPersonelList(rows);
      });
  }, []);

  const selectedPersonel = selectedNrp
    .map((nrp) => personelList.find((p) => p.nrp === nrp))
    .filter((p): p is Personel => Boolean(p));

  const togglePersonel = (nrp: string) => {
    setSelectedNrp((current) =>
      current.includes(nrp) ? current.filter((item) => item !== nrp) : [...current, nrp],
    );
  };

  const addPersonel = async () => {
    if (!newPersonel.nrp.trim() || !newPersonel.nama.trim()) return;
    setSaving(true);
    const row = {
      nrp: newPersonel.nrp.trim(),
      nama: newPersonel.nama.trim(),
      pangkat: newPersonel.pangkat.trim(),
      jabatan: newPersonel.jabatan.trim(),
    };
    const { error } = await supabase.from("personel").upsert(row);
    setSaving(false);
    if (error) return;
    setPersonelList((current) => {
      const rest = current.filter((p) => p.nrp !== row.nrp);
      return [...rest, row].sort((a, b) => a.nama.localeCompare(b.nama));
    });
    setSelectedNrp((current) => (current.includes(row.nrp) ? current : [...current, row.nrp]));
    setNewPersonel({ nrp: "", nama: "", pangkat: "", jabatan: "" });
  };

  const update = (key: keyof LetterData, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
  };

  const [arsip, setArsip] = useState<Array<{ id: string; nomor: string; tanggal: string; data: unknown; penerima_nrp: string[] }>>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const loadArsip = () =>
    supabase
      .from("surat_perintah")
      .select("id, nomor, tanggal, data, penerima_nrp")
      .order("created_at", { ascending: false })
      .then(({ data: rows }) => rows && setArsip(rows));

  useEffect(() => {
    loadArsip();
  }, []);

  const simpanSurat = async () => {
    const row = {
      nomor: buildNumber(data),
      tanggal: data.issueDate,
      tugas: data.tugas ?? "",
      data: data as unknown as Record<string, string>,
      penerima_nrp: selectedNrp,
      updated_at: new Date().toISOString(),
    };
    const res = currentId
      ? await supabase.from("surat_perintah").update(row).eq("id", currentId).select("id").single()
      : await supabase.from("surat_perintah").insert(row).select("id").single();
    if (res.error) return setStatus("Gagal menyimpan");
    setCurrentId(res.data.id);
    setStatus("Tersimpan");
    loadArsip();
  };

  const bukaSurat = (id: string) => {
    if (!id) {
      setCurrentId(null);
      setData(initialData);
      setStatus("");
      return;
    }
    const s = arsip.find((a) => a.id === id);
    if (!s) return;
    setData({ ...initialData, ...(s.data as Partial<LetterData>) });
    setSelectedNrp(s.penerima_nrp);
    setCurrentId(id);
    setStatus("");
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="screen-only sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between gap-4 px-5 py-3 lg:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Administrasi surat
            </p>
            <h1 className="text-lg font-bold">Surat Perintah</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              className="h-10 max-w-[260px] rounded-md border border-input bg-background px-2 text-sm"
              value={currentId ?? ""}
              onChange={(event) => bukaSurat(event.target.value)}
              aria-label="Arsip surat"
            >
              <option value="">+ Surat baru</option>
              {arsip.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nomor}
                </option>
              ))}
            </select>
            {status ? <span className="text-xs text-muted-foreground">{status}</span> : null}
            <Button onClick={simpanSurat} size="lg" variant="secondary">
              Simpan surat
            </Button>
            <Button onClick={() => window.print()} size="lg">
              <Printer aria-hidden="true" />
              Cetak surat
            </Button>
            <Button onClick={keluar} size="lg" variant="outline">
              <LogOut aria-hidden="true" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <div className="workspace mx-auto grid max-w-[1480px] items-start gap-6 px-5 py-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8">
        <aside className="screen-only rounded-lg border border-border bg-card shadow-sm lg:sticky lg:top-24">
          <div className="border-b border-border px-5 py-4">
            <h2 className="font-bold">Isi surat</h2>
            <p className="mt-1 text-sm text-muted-foreground">Perubahan langsung tampil pada lembar A4.</p>
          </div>
          <div className="form-scroll space-y-4 p-5 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto">
            <fieldset className="space-y-3 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-semibold">Nomor surat</legend>
              <div className="grid grid-cols-3 gap-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">Awalan</span>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                    value={data.numberPrefix}
                    onChange={(event) => update("numberPrefix", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">Nomor urut</span>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                    inputMode="numeric"
                    value={data.numberSequence}
                    onChange={(event) => update("numberSequence", event.target.value)}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold">Akhiran</span>
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                    value={data.numberSuffix}
                    onChange={(event) => update("numberSuffix", event.target.value)}
                  />
                </label>
              </div>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold">Tanggal surat</span>
                <input
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                  type="date"
                  value={data.issueDate}
                  onChange={(event) => update("issueDate", event.target.value)}
                />
              </label>
              <p className="text-xs text-muted-foreground">
                Hasil: {buildNumber(data)} — bulan Romawi dan tahun mengikuti tanggal surat.
              </p>
            </fieldset>
            <fieldset className="space-y-3 rounded-md border border-border p-3">
              <legend className="px-1 text-sm font-semibold">Kepada (penerima perintah)</legend>
              <p className="text-xs text-muted-foreground">
                Centang personel yang menerima perintah. Data diambil dari database.
              </p>
              <div className="space-y-2">
                {personelList.map((p) => (
                  <label key={p.nrp} className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={selectedNrp.includes(p.nrp)}
                      onChange={() => togglePersonel(p.nrp)}
                    />
                    <span>
                      <span className="font-medium">
                        {p.pangkat} {p.nama}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        NRP {p.nrp} — {p.jabatan}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              <details className="rounded-md border border-dashed border-border p-3">
                <summary className="cursor-pointer text-xs font-semibold">Tambah personel baru</summary>
                <div className="mt-3 space-y-2">
                  {(
                    [
                      ["nama", "Nama (mis. SURYANTO, SH.)"],
                      ["pangkat", "Pangkat (mis. AIPDA)"],
                      ["nrp", "NRP (sebagai ID)"],
                      ["jabatan", "Jabatan"],
                    ] as const
                  ).map(([key, placeholder]) => (
                    <input
                      key={key}
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                      placeholder={placeholder}
                      value={newPersonel[key]}
                      onChange={(event) =>
                        setNewPersonel((current) => ({ ...current, [key]: event.target.value }))
                      }
                    />
                  ))}
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={saving || !newPersonel.nrp.trim() || !newPersonel.nama.trim()}
                    onClick={addPersonel}
                  >
                    {saving ? "Menyimpan…" : "Simpan personel"}
                  </Button>
                </div>
              </details>
            </fieldset>
            {fields.map((field) => (
              <label className="block" key={field.key}>
                <span className="mb-1.5 block text-sm font-semibold">{field.label}</span>
                {field.multiline ? (
                  <textarea
                    className="min-h-24 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm leading-relaxed outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                    value={data[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                  />
                ) : (
                  <input
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
                    value={data[field.key]}
                    onChange={(event) => update(field.key, event.target.value)}
                  />
                )}
                {field.hint ? (
                  <span className="mt-1 block text-xs text-muted-foreground">{field.hint}</span>
                ) : null}
              </label>
            ))}
          </div>
        </aside>

        <section className="preview-stage min-w-0 overflow-auto rounded-lg bg-preview p-4 sm:p-7" aria-label="Pratinjau cetak">
          <article className="print-sheet mx-auto bg-paper text-document shadow-paper">
            <header className="letterhead">
              <div>{data.agency}</div>
              <div>{data.region}</div>
              <div className="letterhead-rule">{data.resort}</div>
            </header>

            <div className="document-title">
              <div className="document-title-inner">
                <h2>SURAT PERINTAH</h2>
                <p>Nomor : {buildNumber(data)}</p>
              </div>
            </div>

            <div className="document-body">
              <DocumentRow label="Pertimbangan">
                <p>Adanya {data.tugas ?? ""}.</p>
              </DocumentRow>

              <DocumentRow label="Dasar">
                <ol className="document-list">
                  {lines(data.bases).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ol>
              </DocumentRow>

              <p className="command-title">DIPERINTAHKAN</p>

              <DocumentRow label="Kepada">
                <ol className="document-list recipients">
                  {selectedPersonel.map((p) => (
                    <li key={p.nrp}>
                      <span className="recipient-name">
                        {p.pangkat} {p.nama} NRP {p.nrp}
                      </span>
                      <span className="recipient-role">{p.jabatan}</span>
                    </li>
                  ))}
                </ol>
              </DocumentRow>

              <DocumentRow label="Untuk">
                <ol className="document-list duties">
                  {data.tugas?.trim() ? <li>melaksanakan Tugas {data.tugas};</li> : null}
                  {lines(data.duties).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ol>
              </DocumentRow>

              <p className="finished">Selesai.</p>

              <div className="signature-block">
                <div className="signature-meta">
                  <span>Dikeluarkan di</span><b>:</b><span>{data.city}</span>
                  <span>Pada tanggal</span><b>:</b><span>{formatTanggal(data.issueDate)}</span>
                </div>
                <div className="signature-office">
                  <p>{data.authority}</p>
                  <p>{data.office}</p>
                </div>
                <div className="signature-name">
                  <p>{data.signer}</p>
                  <p>{data.signerRank}</p>
                </div>
              </div>

              <div className="copies">
                <p>Tembusan :</p>
                <p>{data.copyTo}</p>
              </div>
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}

function DocumentRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="document-row">
      <div>{label}</div>
      <div>:</div>
      <div>{children}</div>
    </div>
  );
}