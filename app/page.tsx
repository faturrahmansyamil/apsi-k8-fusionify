"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSistem } from "@/lib/useSistem";
import { bacaD1, bacaD2, bacaD3 } from "@/lib/sistem";
import { bacaGangguan, isiDataContoh, kosongkanSemua, simpanGangguan } from "@/lib/demo";

export default function Beranda() {
  const { siap, st, setSesi, segarkan } = useSistem();
  const router = useRouter();
  const [pilihPelanggan, setPilihPelanggan] = useState("");

  if (!siap) return <p className="kecil">Memuat…</p>;

  const d1 = bacaD1(st);
  const d2 = bacaD2(st);
  const d3 = bacaD3(st);
  const gangguan = bacaGangguan(st);

  return (
    <>
      <div className="judul-halaman">
        <div className="uc">PT Fusionify Digital Store · APSI Kelompok 8</div>
        <h1 className="tampilan">Sistem Pendaftaran dan Penanganan Kendala Pelanggan</h1>
      </div>

      <div className="grid2">
        <div className="kartu">
          <h2>Pelanggan UMKM</h2>
          <p>Belum punya akun? Daftar dulu, lalu tunggu verifikasi Owner/Admin.</p>
          <div className="tombol">
            <button onClick={() => router.push("/daftar")}>Daftar pelanggan</button>
          </div>
          <hr className="pemisah" />
          <label htmlFor="pilih-pelanggan">Masuk sebagai pelanggan terverifikasi</label>
          {d2.length === 0 ? (
            <p className="kecil">Belum ada pelanggan terverifikasi di D2.</p>
          ) : (
            <>
              <select id="pilih-pelanggan" style={{ marginTop: 6 }} value={pilihPelanggan} onChange={(e) => setPilihPelanggan(e.target.value)}>
                <option value="">— pilih toko —</option>
                {d2.map((p) => (
                  <option key={p.id} value={p.id}>{p.namaToko} ({p.id})</option>
                ))}
              </select>
              <div className="tombol">
                <button
                  className="sekunder"
                  disabled={!pilihPelanggan}
                  onClick={() => { setSesi({ peran: "pelanggan", idPelanggan: pilihPelanggan }); router.push("/panduan"); }}
                >
                  Masuk sebagai pelanggan
                </button>
              </div>
            </>
          )}
        </div>

        <div className="kartu">
          <h2>Owner/Admin</h2>
          <p>Verifikasi pendaftaran, pantau laporan kendala, dan perbarui status penanganan.</p>
          <div className="tombol">
            <button onClick={() => { setSesi({ peran: "admin" }); router.push("/admin/dashboard"); }}>
              Masuk sebagai Owner/Admin
            </button>
          </div>
          <hr className="pemisah" />
          <div className="statistik">
            <div><b>{d1.length}</b><span>Pendaftaran (D1)</span></div>
            <div><b>{d2.length}</b><span>Pelanggan (D2)</span></div>
            <div><b>{d3.length}</b><span>Laporan (D3)</span></div>
          </div>
        </div>
      </div>

      <details className="kartu demo">
        <summary>Panel demo (untuk presentasi dan video)</summary>
        <p className="kecil">Login di atas masih berupa pilihan peran, belum login sungguhan.</p>
        <div className="tombol">
          <button className="sekunder" onClick={() => { isiDataContoh(st); segarkan(); }}>Isi data contoh</button>
          <button className="sekunder" onClick={() => { kosongkanSemua(st); segarkan(); }}>Kosongkan semua data</button>
        </div>
        <label className="demo-saklar">
          <input type="checkbox" checked={gangguan} onChange={(e) => { simpanGangguan(st, e.target.checked); segarkan(); }} />
          Simulasi gangguan koneksi saat menyimpan status laporan (UC-06 alur 5a)
        </label>
        <p className="kecil">
          Alur gagal lain tidak perlu simulasi: kosongkan kolom wajib (UC-01, UC-04), tolak pendaftaran (UC-02),
          buka materi video (UC-03), atau buka dashboard saat D3 kosong (UC-05). <Link href="/notifikasi">Lihat notifikasi terkirim</Link>.
        </p>
      </details>
    </>
  );
}
