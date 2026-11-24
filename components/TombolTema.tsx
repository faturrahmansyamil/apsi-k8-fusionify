"use client";

import { useEffect, useState } from "react";

type Tema = "light" | "dark";

/** Tombol ganti mode terang/gelap. Pilihan disimpan di browser; bawaan mengikuti setelan perangkat. */
export function TombolTema() {
  const [tema, setTema] = useState<Tema | null>(null);

  useEffect(() => {
    const dipilih = document.documentElement.dataset.theme as Tema | undefined;
    const sistem: Tema = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTema(dipilih ?? sistem);
  }, []);

  function ganti() {
    const baru: Tema = tema === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = baru;
    try {
      localStorage.setItem("tema", baru);
    } catch {
      /* penyimpanan browser diblokir: mode tetap berganti untuk sesi ini */
    }
    setTema(baru);
  }

  if (!tema) return null;
  return (
    <button
      className="sekunder kecil-tombol tombol-tema"
      onClick={ganti}
      aria-label={tema === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      title={tema === "dark" ? "Mode terang" : "Mode gelap"}
    >
      {tema === "dark" ? "☀" : "☾"}
    </button>
  );
}
