import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type LetterData = {
  agency: string;
  region: string;
  resort: string;
  number: string;
  consideration: string;
  bases: string;
  recipients: string;
  duties: string;
  city: string;
  date: string;
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
  number: "R/Sprin-2487/II/2016/Satintelkam",
  consideration:
    "Adanya giat Lidik tentang Penunjukan Penjabat (Pj) Kepala Desa di wilayah Kab. Situbondo.",
  bases:
    "Undang – Undang Negara Republik Indonesia Nomor 2 Tahun 2002 tgl 08 Januari 2002 tentang Kepolisian Negara Republik Indonesia;\nPeraturan Kepala Kepolisian Negara Republik Indonesia Nomor 15 Tahun 2007 tentang Naskah Dinas di lingkungan Kepolisian Negara Republik Indonesia;\nDisposisi Kasat Intelkam untuk Lidik dan Monitor",
  recipients:
    "AIPDA SURYANTO, SH. NRP 79120041|Ps. KANIT I INTELKAM\nBRIGADIR FAJRI WAHYUDIONO, SH. NRP 83040626|ANGGOTA UNIT I INTELKAM",
  duties:
    "melaksanakan Tugas giat Lidik adanya Penunjukan Penjabat (Pj) Kepala Desa di wilayah Kab. Situbondo;\nmelaporkan hasil pelaksanaannya kepada pimpinan;\nmelaksanakan perintah ini dengan seksama dan penuh rasa tanggung jawab.",
  city: "Situbondo",
  date: "21 Pebruari 2016",
  authority: "a.n. KEPALA KEPOLISIAN RESORT SITUBONDO",
  office: "KASAT INTELKAM",
  signer: "MOHAMAD DJUPRI",
  signerRank: "INSPEKTUR POLISI SATU NRP 68020388",
  copyTo: "Kapolres Situbondo.",
};

const fields: Array<{
  key: keyof LetterData;
  label: string;
  multiline?: boolean;
  hint?: string;
}> = [
  { key: "agency", label: "Instansi" },
  { key: "region", label: "Daerah" },
  { key: "resort", label: "Kesatuan" },
  { key: "number", label: "Nomor surat" },
  { key: "consideration", label: "Pertimbangan", multiline: true },
  { key: "bases", label: "Dasar", multiline: true, hint: "Satu butir per baris" },
  {
    key: "recipients",
    label: "Kepada",
    multiline: true,
    hint: "Satu orang per baris; pisahkan nama dan jabatan dengan |",
  },
  { key: "duties", label: "Untuk", multiline: true, hint: "Satu butir per baris" },
  { key: "city", label: "Dikeluarkan di" },
  { key: "date", label: "Pada tanggal" },
  { key: "authority", label: "Atas nama" },
  { key: "office", label: "Jabatan penanda tangan" },
  { key: "signer", label: "Nama penanda tangan" },
  { key: "signerRank", label: "Pangkat / NRP" },
  { key: "copyTo", label: "Tembusan" },
];

const lines = (value: string) => value.split("\n").filter((line) => line.trim());

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
              <h2>SURAT PERINTAH</h2>
              <p>Nomor : {data.number}</p>
            </div>

            <div className="document-body">
              <DocumentRow label="Pertimbangan">
                <p>{data.consideration}</p>
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
                  {lines(data.duties).map((item, index) => (
                    <li key={`${item}-${index}`}>{item}</li>
                  ))}
                </ol>
              </DocumentRow>

              <p className="finished">Selesai.</p>

              <div className="signature-block">
                <div className="signature-meta">
                  <span>Dikeluarkan di</span><b>:</b><span>{data.city}</span>
                  <span>Pada tanggal</span><b>:</b><span>{data.date}</span>
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