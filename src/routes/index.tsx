import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

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
  recipients: string;
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
  recipients:
    "AIPDA SURYANTO, SH. NRP 79120041|Ps. KANIT I INTELKAM\nBRIGADIR FAJRI WAHYUDIONO, SH. NRP 83040626|ANGGOTA UNIT I INTELKAM",
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
  {
    key: "recipients",
    label: "Kepada",
    multiline: true,
    hint: "Satu orang per baris; pisahkan nama dan jabatan dengan |",
  },
  { key: "duties", label: "Untuk", multiline: true, hint: "Satu butir per baris" },
  { key: "city", label: "Dikeluarkan di" },
  { key: "authority", label: "Atas nama" },
  { key: "office", label: "Jabatan penanda tangan" },
  { key: "signer", label: "Nama penanda tangan" },
  { key: "signerRank", label: "Pangkat / NRP" },
  { key: "copyTo", label: "Tembusan" },
];

const lines = (value: string) => (value ?? "").split("\n").filter((line) => line.trim());

export const Route = createFileRoute("/")({
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

  const update = (key: keyof LetterData, value: string) => {
    setData((current) => ({ ...current, [key]: value }));
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
          <Button onClick={() => window.print()} size="lg">
            <Printer aria-hidden="true" />
            Cetak surat
          </Button>
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
                  {lines(data.recipients).map((item, index) => {
                    const [name, role] = item.split("|");
                    return (
                      <li key={`${item}-${index}`}>
                        <span className="recipient-name">{name}</span>
                        {role ? <span className="recipient-role">{role}</span> : null}
                      </li>
                    );
                  })}
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