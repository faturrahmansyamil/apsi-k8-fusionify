"use client";

import Link from "next/link";
import { useSistem } from "@/lib/useSistem";
import { bacaNotifikasi } from "@/lib/sistem";
import { formatWaktu, JudulHalaman } from "@/components/Kerangka";

// Simulasi aliran keluar ke Pelanggan UMKM (UC-02). Bukan data store di DFD.
// Pelanggan hanya melihat notifikasi miliknya; Owner/Admin melihat log semua pesan yang dikirim.
export default function HalamanNotifikasi() {
  const { siap, st, sesi, pelangganAktif } = useSistem();
  if (!siap) return <p className="kecil">Memuat…</p>;

  const admin = sesi?.peran === "admin";
  if (!admin && !pelangganAktif) {
    return (
      <>
        <JudulHalaman uc="Simulasi · UC-02" judul="Notifikasi" />
        <div className="notif info">
          Notifikasi hanya dapat dilihat oleh pelanggan yang bersangkutan dan Owner/Admin. <Link href="/">Masuk dulu di beranda</Link>.
        </div>
      </>
    );
  }

  const semua = bacaNotifikasi(st);
  const tampil = admin ? semua : semua.filter((n) => n.idPendaftaran === pelangganAktif?.idPendaftaran);

  return (
    <>
      <JudulHalaman
        uc="Simulasi · UC-02"
        judul={admin ? "Log notifikasi terkirim" : "Notifikasi Anda"}
        deskripsi="Di sistem nyata, info verifikasi dikirim ke kontak pelanggan. Di draft ini pesannya hanya dicatat di sini."
      />
      {tampil.length === 0 ? (
        <div className="notif info">Belum ada notifikasi.</div>
      ) : (
        tampil.map((n) => (
          <div className="kartu" key={n.id}>
            <b>{n.judul}</b>
            <div className="kecil">Ke {n.namaToko} ({n.tujuan}) · {formatWaktu(n.waktu)}</div>
            <p style={{ marginBottom: 0 }}>{n.isi}</p>
          </div>
        ))
      )}
    </>
  );
}
