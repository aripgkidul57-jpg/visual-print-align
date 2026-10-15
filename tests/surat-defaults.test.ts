import { describe, expect, test } from "bun:test";
import { initialLetterData, newLetterDataFromLatest } from "../src/lib/surat";

describe("isian awal surat baru", () => {
  test("semua kolom isian kosong, hanya tanggal surat terisi hari ini", () => {
    const data = newLetterDataFromLatest({ city: "Situbondo", bases: "Dasar lama", tugas: "Tugas lama" });
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    expect(data.issueDate).toBe(today);
    for (const [key, value] of Object.entries(data)) {
      if (key !== "issueDate") expect(value).toBe("");
    }
  });
  test("tanggal hari ini tetap terisi walau tidak ada surat sebelumnya", () => {
    for (const value of [null, undefined, [], "invalid"]) {
      expect(newLetterDataFromLatest(value).issueDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  test("isian baru dapat diedit tanpa mengubah data bawaan", () => {
    const data = newLetterDataFromLatest(null);
    data.city = "Kota baru";
    data.bidang = "Kasat";
    expect(initialLetterData.city).toBe("Situbondo");
    expect(data.city).toBe("Kota baru");
    expect(data.bidang).toBe("Kasat");
  });
});
