import { beforeEach, describe, expect, it } from "vitest";
import { penyimpananMemori, Penyimpanan } from "@/lib/penyimpanan";
import {
  bacaD1, bacaD2, bacaD3, bacaNotifikasi, daftarLaporan, daftarPelanggan, daftarPendaftaranBaru,
  detailLaporan, kirimLaporan, perbaruiStatus, PESAN_DAFTAR_GAGAL, PESAN_LAPORAN_GAGAL,
  PESAN_STATUS_GAGAL, setujuiPendaftaran, tolakPendaftaran,
} from "@/lib/sistem";
import { ambilMateri, PESAN_MATERI_GAGAL } from "@/lib/panduan";
import { isiDataContoh } from "@/lib/demo";

let st: Penyimpanan;
beforeEach(() => { st = penyimpananMemori(); });

const lengkap = { namaToko: "Toko A", kontak: "0812", botTokenTelegram: "123:abc", nomorWhatsApp: "" };

function pelangganAktif() {
  const r = daftarPelanggan(st, lengkap);
  if (!r.ok) throw new Error();
  const v = setujuiPendaftaran(st, r.data.id);
  if (!v.ok) throw new Error();
  return v.data;
}

describe("UC-01 Daftar Pelanggan", () => {
  it("data lengkap tersimpan di D1 dengan status Menunggu Verifikasi", () => {
    const h = daftarPelanggan(st, lengkap);
    expect(h.ok).toBe(true);
    expect(bacaD1(st)).toHaveLength(1);
    expect(bacaD1(st)[0].status).toBe("Menunggu Verifikasi");
  });

  it("nomor WhatsApp saja (tanpa bot token) juga dianggap lengkap", () => {
    const h = daftarPelanggan(st, { ...lengkap, botTokenTelegram: "", nomorWhatsApp: "0899" });
    expect(h.ok).toBe(true);
  });

  it("5a: kolom wajib kosong, data tidak masuk D1 dan kolom ditandai", () => {
    const h = daftarPelanggan(st, { namaToko: "Toko A", kontak: "", botTokenTelegram: " ", nomorWhatsApp: "" });
    expect(h.ok).toBe(false);
    if (h.ok) return;
    expect(h.pesan).toBe(PESAN_DAFTAR_GAGAL);
    expect(Object.keys(h.kolom ?? {})).toEqual(expect.arrayContaining(["kontak", "botTokenTelegram", "nomorWhatsApp"]));
    expect(bacaD1(st)).toHaveLength(0);
  });

  it("5a lalu kirim ulang dengan data lengkap berhasil", () => {
    daftarPelanggan(st, { ...lengkap, namaToko: "" });
    expect(daftarPelanggan(st, lengkap).ok).toBe(true);
    expect(bacaD1(st)).toHaveLength(1);
  });
});

describe("UC-02 Verifikasi Pendaftaran", () => {
  it("disetujui: D1 Terverifikasi, masuk D2, info verifikasi dikirim", () => {
    const r = daftarPelanggan(st, lengkap);
    if (!r.ok) throw new Error();
    expect(daftarPendaftaranBaru(st)).toHaveLength(1);
    const h = setujuiPendaftaran(st, r.data.id);
    expect(h.ok).toBe(true);
    expect(bacaD1(st)[0].status).toBe("Terverifikasi");
    expect(bacaD2(st)).toHaveLength(1);
    expect(bacaNotifikasi(st)[0].judul).toMatch(/berhasil/);
    expect(daftarPendaftaranBaru(st)).toHaveLength(0);
  });

  it("4a ditolak: D1 Ditolak + alasan, tidak masuk D2, info ditolak + alasan dikirim", () => {
    const r = daftarPelanggan(st, lengkap);
    if (!r.ok) throw new Error();
    const h = tolakPendaftaran(st, r.data.id, "Bot Token tidak valid");
    expect(h.ok).toBe(true);
    expect(bacaD1(st)[0].status).toBe("Ditolak");
    expect(bacaD1(st)[0].alasanPenolakan).toBe("Bot Token tidak valid");
    expect(bacaD2(st)).toHaveLength(0);
    expect(bacaNotifikasi(st)[0].isi).toContain("Bot Token tidak valid");
  });

  it("tolak tanpa alasan tidak mengubah D1", () => {
    const r = daftarPelanggan(st, lengkap);
    if (!r.ok) throw new Error();
    expect(tolakPendaftaran(st, r.data.id, "  ").ok).toBe(false);
    expect(bacaD1(st)[0].status).toBe("Menunggu Verifikasi");
  });

  it("pendaftaran yang sudah diverifikasi tidak bisa diverifikasi lagi", () => {
    const r = daftarPelanggan(st, lengkap);
    if (!r.ok) throw new Error();
    setujuiPendaftaran(st, r.data.id);
    expect(setujuiPendaftaran(st, r.data.id).ok).toBe(false);
    expect(bacaD2(st)).toHaveLength(1);
  });
});

describe("UC-03 Akses Panduan Bot", () => {
  it("materi tersedia ditampilkan", () => {
    expect(ambilMateri("menghubungkan-bot-telegram").ok).toBe(true);
  });
  it("4a: materi belum tersedia memberi pesan tidak dapat ditampilkan", () => {
    const h = ambilMateri("video-pengenalan-panel-admin");
    expect(h.ok).toBe(false);
    expect(h.pesan).toBe(PESAN_MATERI_GAGAL);
  });
});

describe("UC-04 Kirim Laporan Kendala", () => {
  it("laporan lengkap tersimpan di D3 dengan nomor tiket dan status Menunggu", () => {
    const p = pelangganAktif();
    const h = kirimLaporan(st, p.id, { kategori: "Payment gateway", deskripsi: "Pembayaran gagal" });
    expect(h.ok).toBe(true);
    if (!h.ok) return;
    expect(h.data.nomorTiket).toBe("TKT-0001");
    expect(h.data.status).toBe("Menunggu");
    expect(bacaD3(st)).toHaveLength(1);
  });

  it("5a: deskripsi kosong, tidak disimpan ke D3", () => {
    const p = pelangganAktif();
    const h = kirimLaporan(st, p.id, { kategori: "Produk terkirim ganda", deskripsi: "" });
    expect(h.ok).toBe(false);
    if (h.ok) return;
    expect(h.pesan).toBe(PESAN_LAPORAN_GAGAL);
    expect(h.kolom?.deskripsi).toBeTruthy();
    expect(bacaD3(st)).toHaveLength(0);
  });

  it("pelanggan yang tidak ada di D2 tidak bisa mengirim laporan", () => {
    expect(kirimLaporan(st, "PLG-9999", { kategori: "Lainnya", deskripsi: "x" }).ok).toBe(false);
  });
});

describe("UC-05 Lihat Dashboard Kendala", () => {
  it("2a: D3 kosong", () => {
    expect(daftarLaporan(st)).toHaveLength(0);
  });
  it("menampilkan daftar dan detail dari D3", () => {
    const p = pelangganAktif();
    kirimLaporan(st, p.id, { kategori: "Lainnya", deskripsi: "a" });
    kirimLaporan(st, p.id, { kategori: "Lainnya", deskripsi: "b" });
    expect(daftarLaporan(st).map((l) => l.nomorTiket)).toEqual(["TKT-0002", "TKT-0001"]);
    expect(detailLaporan(st, "TKT-0001")?.deskripsi).toBe("a");
  });
});

describe("UC-06 Perbarui Status Laporan", () => {
  it("status dan catatan tersimpan ke D3", () => {
    const p = pelangganAktif();
    kirimLaporan(st, p.id, { kategori: "Lainnya", deskripsi: "a" });
    const h = perbaruiStatus(st, "TKT-0001", "Selesai", "Sudah diperbaiki");
    expect(h.ok).toBe(true);
    expect(bacaD3(st)[0].status).toBe("Selesai");
    expect(bacaD3(st)[0].catatan).toBe("Sudah diperbaiki");
  });

  it("5a: gagal simpan, perubahan tidak tersimpan ke D3, lalu simpan ulang berhasil", () => {
    const p = pelangganAktif();
    kirimLaporan(st, p.id, { kategori: "Lainnya", deskripsi: "a" });
    const gagal = perbaruiStatus(st, "TKT-0001", "Diproses", "", { gangguanKoneksi: true });
    expect(gagal.ok).toBe(false);
    expect(gagal.pesan).toBe(PESAN_STATUS_GAGAL);
    expect(bacaD3(st)[0].status).toBe("Menunggu");
    expect(perbaruiStatus(st, "TKT-0001", "Diproses", "").ok).toBe(true);
    expect(bacaD3(st)[0].status).toBe("Diproses");
  });

  it("status di luar Menunggu/Diproses/Selesai ditolak", () => {
    const p = pelangganAktif();
    kirimLaporan(st, p.id, { kategori: "Lainnya", deskripsi: "a" });
    expect(perbaruiStatus(st, "TKT-0001", "Batal" as never, "").ok).toBe(false);
  });
});

describe("Data contoh", () => {
  it("mengisi D1 (4), D2 (2), D3 (2) dengan satu pendaftaran menunggu dan satu ditolak", () => {
    isiDataContoh(st);
    expect(bacaD1(st)).toHaveLength(4);
    expect(bacaD2(st)).toHaveLength(2);
    expect(bacaD3(st)).toHaveLength(2);
    expect(daftarPendaftaranBaru(st)).toHaveLength(1);
    expect(bacaD1(st).filter((p) => p.status === "Ditolak")).toHaveLength(1);
  });
});
