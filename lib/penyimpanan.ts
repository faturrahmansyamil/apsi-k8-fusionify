// Lapisan penyimpanan. Di browser pakai localStorage, di tes pakai memori.

export const KUNCI = {
  D1: "D1_data_pendaftaran",
  D2: "D2_data_pelanggan",
  D3: "D3_data_laporan_kendala",
  NOTIFIKASI: "simulasi_notifikasi",
  SESI: "simulasi_sesi",
  GANGGUAN: "simulasi_gangguan_koneksi",
} as const;

export interface Penyimpanan {
  baca<T>(kunci: string, awal: T): T;
  tulis(kunci: string, nilai: unknown): void;
  hapus(kunci: string): void;
}

export function penyimpananBrowser(): Penyimpanan {
  return {
    baca(kunci, awal) {
      try {
        const mentah = window.localStorage.getItem(kunci);
        return mentah === null ? awal : JSON.parse(mentah);
      } catch {
        return awal;
      }
    },
    tulis(kunci, nilai) {
      // Sengaja tidak di-try/catch: kegagalan tulis harus sampai ke pemanggil (UC-06 5a).
      window.localStorage.setItem(kunci, JSON.stringify(nilai));
    },
    hapus(kunci) {
      try {
        window.localStorage.removeItem(kunci);
      } catch {
        /* abaikan */
      }
    },
  };
}

export function penyimpananMemori(): Penyimpanan {
  const data = new Map<string, string>();
  return {
    baca(kunci, awal) {
      const mentah = data.get(kunci);
      return mentah === undefined ? awal : JSON.parse(mentah);
    },
    tulis(kunci, nilai) {
      data.set(kunci, JSON.stringify(nilai));
    },
    hapus(kunci) {
      data.delete(kunci);
    },
  };
}

/** Dipakai untuk mensimulasikan gangguan koneksi: baca tetap jalan, tulis gagal. */
export function penyimpananTerganggu(asli: Penyimpanan): Penyimpanan {
  return {
    baca: (k, a) => asli.baca(k, a),
    tulis() {
      throw new Error("Gangguan koneksi (simulasi)");
    },
    hapus: (k) => asli.hapus(k),
  };
}
