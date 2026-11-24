// Sesi (simulasi login) dan alat bantu demo. Bukan bagian dari UC.

import { KUNCI, Penyimpanan } from "./penyimpanan";

export type Sesi = { peran: "admin" } | { peran: "pelanggan"; idPelanggan: string } | null;

export const bacaSesi = (st: Penyimpanan) => st.baca<Sesi>(KUNCI.SESI, null);
export const simpanSesi = (st: Penyimpanan, s: Sesi) =>
  s ? st.tulis(KUNCI.SESI, s) : st.hapus(KUNCI.SESI);

export const bacaGangguan = (st: Penyimpanan) => st.baca<boolean>(KUNCI.GANGGUAN, false);
export const simpanGangguan = (st: Penyimpanan, v: boolean) => st.tulis(KUNCI.GANGGUAN, v);

export function kosongkanSemua(st: Penyimpanan) {
  Object.values(KUNCI).forEach((k) => st.hapus(k));
}

