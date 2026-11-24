"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { useSistem } from "@/lib/useSistem";
import { TombolTema } from "./TombolTema";

const MENU = {
  admin: [
    { href: "/admin/verifikasi", label: "Verifikasi Pendaftaran" },
    { href: "/admin/dashboard", label: "Dashboard Kendala" },
  ],
  pelanggan: [
    { href: "/panduan", label: "Pusat Panduan" },
    { href: "/laporan", label: "Laporan Kendala" },
  ],
  tamu: [{ href: "/daftar", label: "Daftar" }],
};

export function Header() {
  const { siap, sesi, pelangganAktif, setSesi } = useSistem();
  const path = usePathname();
  const router = useRouter();
  const menu = !siap ? [] : sesi?.peran === "admin" ? MENU.admin : sesi?.peran === "pelanggan" ? MENU.pelanggan : MENU.tamu;
  const namaPeran = sesi?.peran === "admin" ? "Owner/Admin" : sesi?.peran === "pelanggan" ? pelangganAktif?.namaToko ?? "Pelanggan" : null;

  return (
    <header className="atas">
      <div className="isi">
        <Link href="/" className="merek">Sistem Pendaftaran & Penanganan Kendala Fusionify</Link>
        <nav aria-label="Menu utama">
          {[...menu, { href: "/notifikasi", label: "Notifikasi" }].map((m) => (
            <Link key={m.href} href={m.href} className={path === m.href ? "aktif" : undefined}>
              {m.label}
            </Link>
          ))}
        </nav>
        <div className="pengguna">
          <TombolTema />
          {siap && namaPeran && (
            <>
              <span className="chip-peran">{namaPeran}</span>
              <button className="sekunder kecil-tombol" onClick={() => { setSesi(null); router.push("/"); }}>Keluar</button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** Judul halaman yang seragam: label UC kecil di atas, judul, deskripsi opsional. */
export function JudulHalaman({ uc, judul, deskripsi }: { uc: string; judul: string; deskripsi?: string }) {
  return (
    <div className="judul-halaman">
      <div className="uc">{uc}</div>
      <h1>{judul}</h1>
      {deskripsi && <p>{deskripsi}</p>}
    </div>
  );
}

/** Menahan halaman sampai peran yang sesuai masuk (simulasi login). */
export function ButuhPeran({ peran, children }: { peran: "admin" | "pelanggan"; children: ReactNode }) {
  const { siap, sesi, pelangganAktif } = useSistem();
  if (!siap) return <p className="kecil">Memuat…</p>;
  const cocok = peran === "admin" ? sesi?.peran === "admin" : sesi?.peran === "pelanggan" && !!pelangganAktif;
  if (!cocok) {
    return (
      <div className="notif peringatan">
        Halaman ini untuk {peran === "admin" ? "Owner/Admin" : "Pelanggan UMKM yang sudah terverifikasi"}.{" "}
        <Link href="/">Masuk dulu di beranda</Link>.
      </div>
    );
  }
  return <>{children}</>;
}

export function Kolom({ label, bantu, salah, children }: { label: string; bantu?: string; salah?: string; children: ReactNode }) {
  return (
    <div className={`kolom ${salah ? "salah" : ""}`}>
      <label>
        <span className="label-teks">
          {label} {bantu && <span className="bantu">{bantu}</span>}
        </span>
        {children}
      </label>
      {salah && <div className="pesan-kolom">{salah}</div>}
    </div>
  );
}

export function Lencana({ status }: { status: string }) {
  return <span className={`lencana ${status.replace(/ /g, "-")}`}>{status}</span>;
}

export function Kosong({ judul, isi }: { judul: string; isi?: string }) {
  return (
    <div className="kosong">
      <b>{judul}</b>
      {isi && <span>{isi}</span>}
    </div>
  );
}

export const formatWaktu = (iso: string) =>
  new Date(iso).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
