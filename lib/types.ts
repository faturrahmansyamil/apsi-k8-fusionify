// Struktur data mengikuti Subbagian 1 (Daftar Spesifikasi Data Store) di Laporan 5.

export type StatusPendaftaran = "Menunggu Verifikasi" | "Terverifikasi" | "Ditolak";
export type StatusLaporan = "Menunggu" | "Diproses" | "Selesai";

export const SEMUA_STATUS_LAPORAN: StatusLaporan[] = ["Menunggu", "Diproses", "Selesai"];

/** D1 – Data Pendaftaran */
export interface Pendaftaran {
  id: string;
  namaToko: string;
  kontak: string;
  botTokenTelegram: string;
  nomorWhatsApp: string;
  status: StatusPendaftaran;
  alasanPenolakan?: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

/** D2 – Data Pelanggan (hanya pendaftaran yang sudah Terverifikasi) */
export interface Pelanggan {
  id: string;
  idPendaftaran: string;
  namaToko: string;
  kontak: string;
  botTokenTelegram: string;
  nomorWhatsApp: string;
  aktifSejak: string;
}

/** D3 – Data Laporan Kendala */
export interface LaporanKendala {
  nomorTiket: string;
  idPelanggan: string;
  namaToko: string;
  kategori: string;
  deskripsi: string;
  bukti?: string;
  status: StatusLaporan;
  catatan?: string;
  dibuatPada: string;
  diperbaruiPada: string;
}

/**
 * Bukan data store di DFD. Ini hanya simulasi aliran keluar
 * "Informasi ... ke Pelanggan UMKM" (di dunia nyata dikirim ke kontak pelanggan).
 */
export interface NotifikasiSimulasi {
  id: string;
  tujuan: string;
  namaToko: string;
  judul: string;
  isi: string;
  waktu: string;
}

export type Hasil<T> =
  | { ok: true; data: T; pesan: string }
  | { ok: false; pesan: string; kolom?: Record<string, string> };
