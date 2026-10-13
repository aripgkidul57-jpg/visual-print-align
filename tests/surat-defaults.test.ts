import { describe, expect, test } from "bun:test";
import { initialLetterData, newLetterDataFromLatest } from "../src/lib/surat";

describe("isian awal dari surat terakhir", () => {
  test("only inherits the eight requested fields", () => {
    const inherited = {
      bases: "Dasar terakhir", duties: "Untuk terakhir", city: "Kota terakhir",
      authority: "Atas nama terakhir", office: "Jabatan terakhir", signer: "Nama terakhir",
      signerRank: "Pangkat terakhir", copyTo: "Tembusan terakhir",
    };
    expect(newLetterDataFromLatest({ ...inherited, tugas: "Jangan salin", startDate: "2026-10-13", numberSequence: "9999" }))
      .toEqual({ ...initialLetterData, ...inherited });
  });
  test("preserves empty saved values and falls back for missing or invalid fields", () => {
    expect(newLetterDataFromLatest({ city: "", bases: null, signer: 42 }))
      .toEqual({ ...initialLetterData, city: "" });
    for (const value of [null, undefined, [], "invalid"]) {
      expect(newLetterDataFromLatest(value)).toEqual(initialLetterData);
    }
  });
  test("new-letter fields remain editable without mutating defaults or saved data", () => {
    const latest = { city: "Situbondo" };
    const data = newLetterDataFromLatest(latest);
    data.city = "Kota baru";
    expect(latest.city).toBe("Situbondo");
    expect(initialLetterData.city).toBe("Situbondo");
    expect(data.city).toBe("Kota baru");
  });
});