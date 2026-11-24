"use client";

import { useEffect } from "react";
import gsap from "gsap";

/*
  Animasi masuk yang halus dengan GSAP. Tidak mengubah alur UC sama sekali, hanya tampilan.
  Cara kerja: memantau isi <main>; setiap elemen yang baru muncul (pindah halaman, pesan berhasil/gagal,
  panel rincian tiket, baris tabel baru) dianimasikan sekali. Elemen yang sudah ada tidak diulang.
  Jika perangkat disetel "kurangi animasi" (prefers-reduced-motion), semua animasi dilewati.
*/

const BLOK = ".judul-halaman > *, .grid2 > .kartu, main > .kartu, .ruang-kerja > .kartu, details.kartu";
const BARIS = "tbody tr, .daftar-materi li";
const PESAN = ".notif";
const RINCIAN = ".panel-rincian > .kartu";
const SEMUA = [BLOK, BARIS, PESAN, RINCIAN].join(", ");
const BERSIHKAN = "transform,opacity,visibility";

function kumpulkan(akar: Element): Element[] {
  const hasil = akar.matches(SEMUA) ? [akar] : [];
  return hasil.concat(Array.from(akar.querySelectorAll(SEMUA)));
}

// Penanda elemen yang sudah dianimasikan, supaya tidak dua kali (mis. efek React dijalankan ulang di mode dev),
// karena gsap.from kedua akan membaca nilai tengah animasi sebagai nilai akhir dan elemen bisa tertinggal transparan.
const sudah = new WeakSet<Element>();

function animasikan(semua: Element[]) {
  const el = semua.filter((e) => !sudah.has(e));
  el.forEach((e) => sudah.add(e));
  // Tab tidak terlihat: browser menghentikan animasi, jadi konten langsung ditampilkan tanpa animasi.
  if (document.hidden) return;
  const blok = el.filter((e) => e.matches(BLOK));
  const baris = el.filter((e) => e.matches(BARIS));
  const pesan = el.filter((e) => e.matches(PESAN));
  const rincian = el.filter((e) => e.matches(RINCIAN));
  const jeda = (n: number, maks: number) => Math.min(0.06, maks / Math.max(n, 1));

  if (blok.length)
    gsap.from(blok, { autoAlpha: 0, y: 18, duration: 0.5, ease: "power3.out", stagger: jeda(blok.length, 0.35), clearProps: BERSIHKAN });
  if (baris.length)
    gsap.from(baris, { autoAlpha: 0, y: 8, duration: 0.4, ease: "power2.out", delay: blok.length ? 0.15 : 0, stagger: jeda(baris.length, 0.4), clearProps: BERSIHKAN });
  if (rincian.length)
    gsap.from(rincian, { autoAlpha: 0, x: 24, duration: 0.45, ease: "power3.out", clearProps: BERSIHKAN });
  if (pesan.length)
    gsap.from(pesan, { autoAlpha: 0, scale: 0.96, y: -4, duration: 0.35, ease: "back.out(2)", clearProps: BERSIHKAN });
}

export function Animasi() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = document.querySelector("main");
    if (!main) return;

    animasikan(kumpulkan(main));

    const pengamat = new MutationObserver((daftar) => {
      const baru = new Set<Element>();
      for (const m of daftar)
        m.addedNodes.forEach((n) => {
          if (n instanceof Element) kumpulkan(n).forEach((e) => baru.add(e));
        });
      if (baru.size) animasikan(Array.from(baru));
    });
    pengamat.observe(main, { childList: true, subtree: true });
    return () => pengamat.disconnect();
  }, []);

  return null;
}
