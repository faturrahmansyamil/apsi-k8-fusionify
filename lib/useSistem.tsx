"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Penyimpanan, penyimpananBrowser } from "./penyimpanan";
import { bacaSesi, Sesi, simpanSesi } from "./demo";
import { bacaD2 } from "./sistem";
import { Pelanggan } from "./types";

interface KonteksSistem {
  siap: boolean;
  st: Penyimpanan;
  sesi: Sesi;
  pelangganAktif: Pelanggan | null;
  setSesi: (s: Sesi) => void;
  /** Panggil setelah menulis data agar semua halaman membaca ulang. */
  segarkan: () => void;
  versi: number;
}

const Konteks = createContext<KonteksSistem | null>(null);

export function PenyediaSistem({ children }: { children: ReactNode }) {
  const st = useMemo(() => penyimpananBrowser(), []);
  const [siap, setSiap] = useState(false);
  const [versi, setVersi] = useState(0);
  const [sesi, setSesiState] = useState<Sesi>(null);

  useEffect(() => {
    setSesiState(bacaSesi(st));
    setSiap(true);
  }, [st]);

  const segarkan = useCallback(() => {
    setSesiState(bacaSesi(st));
    setVersi((v) => v + 1);
  }, [st]);

  const setSesi = useCallback(
    (s: Sesi) => {
      simpanSesi(st, s);
      segarkan();
    },
    [st, segarkan],
  );

  const pelangganAktif = useMemo(() => {
    if (!siap || sesi?.peran !== "pelanggan") return null;
    return bacaD2(st).find((p) => p.id === sesi.idPelanggan) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siap, sesi, st, versi]);

  return (
    <Konteks.Provider value={{ siap, st, sesi, pelangganAktif, setSesi, segarkan, versi }}>
      {children}
    </Konteks.Provider>
  );
}

export function useSistem() {
  const k = useContext(Konteks);
  if (!k) throw new Error("useSistem harus dipakai di dalam PenyediaSistem");
  return k;
}
