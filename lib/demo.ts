// Sesi (simulasi login) dan alat bantu demo. Bukan bagian dari UC.

import { KUNCI, Penyimpanan } from "./penyimpanan";
import { daftarPelanggan, kirimLaporan, setujuiPendaftaran, tolakPendaftaran } from "./sistem";

export type Sesi = { peran: "admin" } | { peran: "pelanggan"; idPelanggan: string } | null;

export const bacaSesi = (st: Penyimpanan) => st.baca<Sesi>(KUNCI.SESI, null);
export const simpanSesi = (st: Penyimpanan, s: Sesi) =>
  s ? st.tulis(KUNCI.SESI, s) : st.hapus(KUNCI.SESI);

export const bacaGangguan = (st: Penyimpanan) => st.baca<boolean>(KUNCI.GANGGUAN, false);
export const simpanGangguan = (st: Penyimpanan, v: boolean) => st.tulis(KUNCI.GANGGUAN, v);

export function kosongkanSemua(st: Penyimpanan) {
  Object.values(KUNCI).forEach((k) => st.hapus(k));
}

/** Data contoh: toko digital di Telegram yang menjual aplikasi premium. Nama fiktif. */
export function isiDataContoh(st: Penyimpanan) {
  kosongkanSemua(st);
  const contoh = [
    { namaToko: "Langganan Premium ID", kontak: "0812-0000-0001", botTokenTelegram: "1111111111:CONTOH-token-bot-1", nomorWhatsApp: "" },
    { namaToko: "Akun Kreatif Store", kontak: "0812-0000-0002", botTokenTelegram: "2222222222:CONTOH-token-bot-2", nomorWhatsApp: "" },
    { namaToko: "Streaming Murah Shop", kontak: "0812-0000-0003", botTokenTelegram: "token-salah", nomorWhatsApp: "" },
    { namaToko: "Digital Tools Corner", kontak: "0812-0000-0004", botTokenTelegram: "", nomorWhatsApp: "0812-0000-0044" },
  ];
  const ids = contoh.map((c) => {
    const h = daftarPelanggan(st, c);
    if (!h.ok) throw new Error(h.pesan);
    return h.data.id;
  });
  const a = setujuiPendaftaran(st, ids[0]);
  const b = setujuiPendaftaran(st, ids[1]);
  tolakPendaftaran(st, ids[2], "Bot Token tidak valid, silakan periksa kembali melalui BotFather");
  // ids[3] dibiarkan "Menunggu Verifikasi" untuk demo UC-02.
  if (a.ok) {
    kirimLaporan(st, a.data.id, {
      kategori: "Produk terkirim ganda",
      deskripsi: "Pembeli order 1 akun, bot mengirim 2 akun yang sama ke pembeli.",
    });
  }
  if (b.ok) {
    kirimLaporan(st, b.data.id, {
      kategori: "Payment gateway",
      deskripsi: "Pembayaran pembeli sudah berhasil tetapi pesanan tidak diproses bot.",
    });
  }
}
