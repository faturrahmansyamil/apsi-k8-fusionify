// UC-03 Akses Panduan Bot. Materi bersifat statis (Proses 2.0 tidak memakai data store).
// CATATAN: isi materi di bawah adalah contoh kerangka. Ganti dengan materi asli dari Fusionify.

import { Hasil } from "./types";

export interface MateriPanduan {
  id: string;
  judul: string;
  jenis: "Panduan interaktif" | "Video tutorial";
  ringkasan: string;
  tersedia: boolean;
  langkah?: string[];
  urlVideo?: string;
}

export const DAFTAR_MATERI: MateriPanduan[] = [
  {
    id: "menghubungkan-bot-telegram",
    judul: "Menghubungkan bot Telegram",
    jenis: "Panduan interaktif",
    ringkasan: "Menyiapkan bot token dari BotFather agar bot toko bisa dihubungkan.",
    tersedia: true,
    langkah: [
      "Buka Telegram dan cari @BotFather.",
      "Kirim perintah /newbot, lalu ikuti instruksi untuk memberi nama bot.",
      "Salin bot token yang diberikan BotFather.",
      "Masukkan bot token tersebut pada formulir pendaftaran Fusionify.",
      "Tunggu verifikasi dari Owner/Admin.",
    ],
  },
  {
    id: "melaporkan-kendala",
    judul: "Cara melaporkan kendala",
    jenis: "Panduan interaktif",
    ringkasan: "Mengirim laporan kendala lewat menu Laporan Kendala tanpa harus menunggu ditanya.",
    tersedia: true,
    langkah: [
      "Pilih menu Laporan Kendala.",
      "Pilih kategori masalah (misal payment gateway atau produk terkirim ganda).",
      "Tulis kronologi kendala dengan jelas.",
      "Lampirkan bukti pendukung bila ada, lalu tekan Kirim Laporan.",
      "Simpan nomor tiket yang muncul setelah laporan terkirim.",
    ],
  },
  {
    id: "video-pengenalan-panel-admin",
    judul: "Pengenalan panel admin (video)",
    jenis: "Video tutorial",
    ringkasan: "Video pengenalan panel admin aplikasi mobile.",
    // Video belum ada dari mitra, jadi materi ini memicu alternatif 4a.
    tersedia: false,
  },
];

export const PESAN_MATERI_GAGAL = "Materi tidak dapat ditampilkan. Silakan pilih materi lain.";

/** Langkah 4, alternatif 4a. */
export function ambilMateri(id: string): Hasil<MateriPanduan> {
  const m = DAFTAR_MATERI.find((x) => x.id === id);
  if (!m || !m.tersedia) return { ok: false, pesan: PESAN_MATERI_GAGAL };
  return { ok: true, data: m, pesan: "" };
}
