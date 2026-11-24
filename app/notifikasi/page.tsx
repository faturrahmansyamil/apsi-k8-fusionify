"use client";

import { useSistem } from "@/lib/useSistem";
import { bacaNotifikasi } from "@/lib/sistem";
import { formatWaktu, JudulHalaman } from "@/components/Kerangka";

// Simulasi aliran keluar ke Pelanggan UMKM (UC-02). Bukan data store di DFD.
export default function HalamanNotifikasi() {
  const { siap, st } = useSistem();
  if (!siap) return <p className="kecil">Memuat…</p>;
  const semua = bacaNotifikasi(st);

  return (
    <>
      <JudulHalaman
        uc="Simulasi · UC-02"
        judul="Notifikasi terkirim"
        deskripsi="Di sistem nyata, info verifikasi dikirim ke kontak pelanggan. Di draft ini pesannya hanya dicatat di sini."
      />
      {semua.length === 0 ? (
        <div className="notif info">Belum ada notifikasi.</div>
      ) : (
        semua.map((n) => (
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
