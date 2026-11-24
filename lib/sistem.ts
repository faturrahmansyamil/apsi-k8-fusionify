// Logika sistem per Use Case. Setiap fungsi menyebut langkah tabel UC (Laporan 4) yang ditanganinya.

import { KUNCI, Penyimpanan, penyimpananTerganggu } from "./penyimpanan";
import {
  Hasil,
  LaporanKendala,
  NotifikasiSimulasi,
  Pelanggan,
  Pendaftaran,
  SEMUA_STATUS_LAPORAN,
  StatusLaporan,
} from "./types";

const sekarang = () => new Date().toISOString();

function idBerikut(prefix: string, daftar: { id?: string; nomorTiket?: string }[]): string {
  const maks = daftar.reduce((m, x) => {
    const n = Number((x.id ?? x.nomorTiket ?? "").split("-")[1]);
    return Number.isFinite(n) && n > m ? n : m;
  }, 0);
  return `${prefix}-${String(maks + 1).padStart(4, "0")}`;
}

const isi = (s: string | undefined) => (s ?? "").trim();

// ---------- baca data store ----------
export const bacaD1 = (st: Penyimpanan) => st.baca<Pendaftaran[]>(KUNCI.D1, []);
export const bacaD2 = (st: Penyimpanan) => st.baca<Pelanggan[]>(KUNCI.D2, []);
export const bacaD3 = (st: Penyimpanan) => st.baca<LaporanKendala[]>(KUNCI.D3, []);
export const bacaNotifikasi = (st: Penyimpanan) => st.baca<NotifikasiSimulasi[]>(KUNCI.NOTIFIKASI, []);

function kirimNotifikasi(st: Penyimpanan, tujuan: string, namaToko: string, judul: string, isiPesan: string) {
  const semua = bacaNotifikasi(st);
  const baru: NotifikasiSimulasi = {
    id: idBerikut("NTF", semua),
    tujuan,
    namaToko,
    judul,
    isi: isiPesan,
    waktu: sekarang(),
  };
  st.tulis(KUNCI.NOTIFIKASI, [baru, ...semua]);
}

// ---------- UC-01 Daftar Pelanggan ----------
export interface InputPendaftaran {
  namaToko: string;
  kontak: string;
  botTokenTelegram: string;
  nomorWhatsApp: string;
}

export const PESAN_DAFTAR_GAGAL = "Pendaftaran gagal, data belum lengkap";
export const PESAN_DAFTAR_BERHASIL = "Pendaftaran berhasil dikirim dan menunggu verifikasi Owner/Admin.";

/** Langkah 5: validasi kelengkapan. Kolom wajib: nama toko, kontak, dan bot token Telegram ATAU nomor WhatsApp. */
export function validasiPendaftaran(input: InputPendaftaran): Record<string, string> {
  const kolom: Record<string, string> = {};
  if (!isi(input.namaToko)) kolom.namaToko = "Nama toko wajib diisi.";
  if (!isi(input.kontak)) kolom.kontak = "Kontak wajib diisi.";
  if (!isi(input.botTokenTelegram) && !isi(input.nomorWhatsApp)) {
    const p = "Isi bot token Telegram atau nomor WhatsApp.";
    kolom.botTokenTelegram = p;
    kolom.nomorWhatsApp = p;
  }
  return kolom;
}

/** Langkah 5–6, alternatif 5a (data tidak masuk ke D1). */
export function daftarPelanggan(st: Penyimpanan, input: InputPendaftaran): Hasil<Pendaftaran> {
  const kolom = validasiPendaftaran(input);
  if (Object.keys(kolom).length > 0) return { ok: false, pesan: PESAN_DAFTAR_GAGAL, kolom };

  const d1 = bacaD1(st);
  const waktu = sekarang();
  const baru: Pendaftaran = {
    id: idBerikut("REG", d1),
    namaToko: isi(input.namaToko),
    kontak: isi(input.kontak),
    botTokenTelegram: isi(input.botTokenTelegram),
    nomorWhatsApp: isi(input.nomorWhatsApp),
    status: "Menunggu Verifikasi",
    dibuatPada: waktu,
    diperbaruiPada: waktu,
  };
  st.tulis(KUNCI.D1, [...d1, baru]);
  return { ok: true, data: baru, pesan: PESAN_DAFTAR_BERHASIL };
}

// ---------- UC-02 Verifikasi Pendaftaran ----------
/** Langkah 2: daftar pendaftaran baru dari D1. */
export const daftarPendaftaranBaru = (st: Penyimpanan) =>
  bacaD1(st).filter((p) => p.status === "Menunggu Verifikasi");

function ambilPendaftaranMenunggu(st: Penyimpanan, id: string) {
  const d1 = bacaD1(st);
  const idx = d1.findIndex((p) => p.id === id);
  if (idx < 0 || d1[idx].status !== "Menunggu Verifikasi") return null;
  return { d1, idx };
}

/** Langkah 4–5: D1 jadi "Terverifikasi", salin ke D2, kirim info verifikasi berhasil. */
export function setujuiPendaftaran(st: Penyimpanan, id: string): Hasil<Pelanggan> {
  const ada = ambilPendaftaranMenunggu(st, id);
  if (!ada) return { ok: false, pesan: "Data pendaftaran tidak ditemukan atau sudah diverifikasi." };
  const { d1, idx } = ada;
  const waktu = sekarang();
  const p = { ...d1[idx], status: "Terverifikasi" as const, diperbaruiPada: waktu };
  d1[idx] = p;

  const d2 = bacaD2(st);
  const pelanggan: Pelanggan = {
    id: idBerikut("PLG", d2),
    idPendaftaran: p.id,
    namaToko: p.namaToko,
    kontak: p.kontak,
    botTokenTelegram: p.botTokenTelegram,
    nomorWhatsApp: p.nomorWhatsApp,
    aktifSejak: waktu,
  };
  st.tulis(KUNCI.D1, d1);
  st.tulis(KUNCI.D2, [...d2, pelanggan]);
  kirimNotifikasi(st, p.kontak, p.namaToko, "Verifikasi pendaftaran berhasil",
    "Pendaftaran Anda telah terverifikasi. Akun pelanggan Anda sudah aktif.");
  return { ok: true, data: pelanggan, pesan: "Pendaftaran terverifikasi dan pelanggan aktif tersimpan di D2." };
}

/** Alternatif 4a: D1 jadi "Ditolak" + alasan, tidak masuk D2, kirim info ditolak + alasan. */
export function tolakPendaftaran(st: Penyimpanan, id: string, alasan: string): Hasil<Pendaftaran> {
  if (!isi(alasan)) return { ok: false, pesan: "Alasan penolakan wajib diisi.", kolom: { alasan: "Wajib diisi." } };
  const ada = ambilPendaftaranMenunggu(st, id);
  if (!ada) return { ok: false, pesan: "Data pendaftaran tidak ditemukan atau sudah diverifikasi." };
  const { d1, idx } = ada;
  const p = { ...d1[idx], status: "Ditolak" as const, alasanPenolakan: isi(alasan), diperbaruiPada: sekarang() };
  d1[idx] = p;
  st.tulis(KUNCI.D1, d1);
  kirimNotifikasi(st, p.kontak, p.namaToko, "Pendaftaran ditolak",
    `Pendaftaran Anda ditolak. Alasan: ${p.alasanPenolakan}. Silakan perbaiki data dan ajukan ulang.`);
  return { ok: true, data: p, pesan: "Pendaftaran ditolak. Info penolakan beserta alasan dikirim ke pelanggan." };
}

// ---------- UC-04 Kirim Laporan Kendala ----------
export interface InputLaporan {
  kategori: string;
  deskripsi: string;
  bukti?: string;
}

export const KATEGORI_KENDALA = ["Payment gateway", "Produk terkirim ganda", "Lainnya"];
export const PESAN_LAPORAN_GAGAL = "Laporan belum lengkap";

/** Langkah 5: validasi. Kolom wajib: kategori dan deskripsi kronologi. Bukti pendukung opsional. */
export function validasiLaporan(input: InputLaporan): Record<string, string> {
  const kolom: Record<string, string> = {};
  if (!KATEGORI_KENDALA.includes(input.kategori)) kolom.kategori = "Pilih kategori masalah.";
  if (!isi(input.deskripsi)) kolom.deskripsi = "Deskripsi kronologi wajib diisi.";
  return kolom;
}

/** Langkah 5–6, alternatif 5a (tidak disimpan ke D3). */
export function kirimLaporan(st: Penyimpanan, idPelanggan: string, input: InputLaporan): Hasil<LaporanKendala> {
  const pelanggan = bacaD2(st).find((p) => p.id === idPelanggan);
  if (!pelanggan) return { ok: false, pesan: "Akun pelanggan tidak ditemukan." };

  const kolom = validasiLaporan(input);
  if (Object.keys(kolom).length > 0) return { ok: false, pesan: PESAN_LAPORAN_GAGAL, kolom };

  const d3 = bacaD3(st);
  const waktu = sekarang();
  const laporan: LaporanKendala = {
    nomorTiket: idBerikut("TKT", d3),
    idPelanggan,
    namaToko: pelanggan.namaToko,
    kategori: input.kategori,
    deskripsi: isi(input.deskripsi),
    bukti: isi(input.bukti) || undefined,
    status: "Menunggu",
    dibuatPada: waktu,
    diperbaruiPada: waktu,
  };
  st.tulis(KUNCI.D3, [...d3, laporan]);
  return { ok: true, data: laporan, pesan: `Laporan berhasil dikirim. Nomor tiket: ${laporan.nomorTiket}` };
}

// ---------- UC-05 Lihat Dashboard Kendala ----------
export const PESAN_DASHBOARD_KOSONG = "Belum ada laporan kendala";

/** Langkah 2: ambil semua tiket dari D3 (terbaru di atas). Kosong = alternatif 2a. */
export const daftarLaporan = (st: Penyimpanan) => [...bacaD3(st)].reverse();

/** Langkah 4: detail satu tiket. */
export const detailLaporan = (st: Penyimpanan, nomorTiket: string) =>
  bacaD3(st).find((l) => l.nomorTiket === nomorTiket) ?? null;

// ---------- UC-06 Perbarui Status Laporan ----------
export const PESAN_STATUS_GAGAL =
  "Pembaruan status gagal disimpan, perubahan tidak tersimpan ke D3. Silakan coba simpan ulang.";

/** Langkah 5, alternatif 5a. Jika gagal simpan, D3 tidak berubah. */
export function perbaruiStatus(
  st: Penyimpanan,
  nomorTiket: string,
  status: StatusLaporan,
  catatan: string,
  opsi: { gangguanKoneksi?: boolean } = {},
): Hasil<LaporanKendala> {
  if (!SEMUA_STATUS_LAPORAN.includes(status)) return { ok: false, pesan: "Status tidak valid." };
  const d3 = bacaD3(st);
  const idx = d3.findIndex((l) => l.nomorTiket === nomorTiket);
  if (idx < 0) return { ok: false, pesan: "Tiket laporan tidak ditemukan." };

  const diperbarui: LaporanKendala = {
    ...d3[idx],
    status,
    catatan: isi(catatan) || undefined,
    diperbaruiPada: sekarang(),
  };
  const salinan = [...d3];
  salinan[idx] = diperbarui;

  const target = opsi.gangguanKoneksi ? penyimpananTerganggu(st) : st;
  try {
    target.tulis(KUNCI.D3, salinan);
  } catch {
    return { ok: false, pesan: PESAN_STATUS_GAGAL };
  }
  return { ok: true, data: diperbarui, pesan: `Status tiket ${nomorTiket} berhasil diperbarui menjadi "${status}".` };
}
