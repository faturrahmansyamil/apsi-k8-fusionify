"use client";

import { useState } from "react";
import { useSistem } from "@/lib/useSistem";
import { daftarLaporan, detailLaporan, PESAN_DASHBOARD_KOSONG, perbaruiStatus } from "@/lib/sistem";
import { bacaGangguan, simpanGangguan } from "@/lib/demo";
import { ButuhPeran, formatWaktu, JudulHalaman, Kolom, Kosong, Lencana } from "@/components/Kerangka";
import { SEMUA_STATUS_LAPORAN, StatusLaporan } from "@/lib/types";

// UC-05 Lihat Dashboard Kendala + UC-06 Perbarui Status Laporan
export default function HalamanDashboard() {
  return (
    <>
      <JudulHalaman
        uc="UC-05 Lihat Dashboard Kendala · UC-06 Perbarui Status Laporan"
        judul="Dashboard Kendala"
        deskripsi="Pantau laporan kendala dari pelanggan UMKM dan perbarui status penanganannya."
      />
      <ButuhPeran peran="admin">
        <Isi />
      </ButuhPeran>
    </>
  );
}

function Isi() {
  const { st } = useSistem();
  const [dipilih, setDipilih] = useState<string | null>(null);

  const semua = daftarLaporan(st); // UC-05 langkah 2: baca D3

  if (semua.length === 0) {
    // UC-05 alur 2a
    return <div className="notif info">{PESAN_DASHBOARD_KOSONG}</div>;
  }

  return (
    <div className="ruang-kerja">
      <div className="kartu">
        <div className="kartu-kepala">
          <h2>Daftar laporan</h2>
          <span className="jumlah">{semua.length} tiket di D3</span>
        </div>
        <div className="tabel-wadah">
          <table>
            <thead>
              <tr><th className="nowrap">Tiket</th><th>Toko</th><th className="sembunyi-hp">Kategori</th><th className="nowrap">Status</th></tr>
            </thead>
            <tbody>
              {semua.map((l) => (
                <tr
                  key={l.nomorTiket}
                  className={`bisa-klik ${l.nomorTiket === dipilih ? "dipilih" : ""}`}
                  onClick={() => setDipilih(l.nomorTiket)}
                >
                  <td className="nowrap"><b>{l.nomorTiket}</b><span className="sub">{formatWaktu(l.dibuatPada)}</span></td>
                  <td>{l.namaToko}</td>
                  <td className="sembunyi-hp">{l.kategori}</td>
                  <td className="nowrap"><Lencana status={l.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="panel-rincian">
        {dipilih ? (
          <Detail key={dipilih} nomorTiket={dipilih} />
        ) : (
          <div className="kartu">
            <Kosong judul="Belum ada tiket dipilih" isi="Pilih salah satu tiket di daftar untuk melihat rincian dan memperbarui statusnya." />
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ nomorTiket }: { nomorTiket: string }) {
  const { st, segarkan } = useSistem();
  const l = detailLaporan(st, nomorTiket); // UC-05 langkah 4 / UC-06 langkah 2
  const [status, setStatus] = useState<StatusLaporan>(l?.status ?? "Menunggu");
  const [catatan, setCatatan] = useState(l?.catatan ?? "");
  const [hasil, setHasil] = useState<{ ok: boolean; pesan: string } | null>(null);
  const gangguan = bacaGangguan(st);

  if (!l) return <div className="kartu"><Kosong judul="Tiket tidak ditemukan" /></div>;

  function simpan() {
    // UC-06 langkah 4–5, alur 5a bila gangguan koneksi
    const h = perbaruiStatus(st, nomorTiket, status, catatan, { gangguanKoneksi: gangguan });
    setHasil(h);
    if (h.ok) segarkan();
  }

  return (
    <div className="kartu">
      <div className="kartu-kepala">
        <h2>{l.nomorTiket}</h2>
        <Lencana status={l.status} />
      </div>
      <dl>
        <dt>Toko</dt><dd>{l.namaToko}</dd>
        <dt>Kategori</dt><dd>{l.kategori}</dd>
        <dt>Kronologi</dt><dd>{l.deskripsi}</dd>
        <dt>Bukti</dt><dd>{l.bukti ?? "–"}</dd>
        <dt>Dikirim</dt><dd>{formatWaktu(l.dibuatPada)}</dd>
        <dt>Catatan</dt><dd>{l.catatan ?? "–"}</dd>
      </dl>

      <hr className="pemisah" />
      <h2>Perbarui status</h2>
      {hasil && <div className={`notif ${hasil.ok ? "sukses" : "gagal"}`}>{hasil.pesan}</div>}
      <Kolom label="Status penanganan">
        <select value={status} onChange={(e) => setStatus(e.target.value as StatusLaporan)}>
          {SEMUA_STATUS_LAPORAN.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </Kolom>
      <Kolom label="Catatan penyelesaian" bantu="(jika diperlukan)">
        <textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} />
      </Kolom>
      <div className="tombol">
        <button onClick={simpan}>{hasil && !hasil.ok ? "Simpan ulang" : "Simpan pembaruan"}</button>
      </div>
      <label className="demo-saklar">
        <input
          type="checkbox"
          checked={gangguan}
          onChange={(e) => { simpanGangguan(st, e.target.checked); segarkan(); }}
        />
        Panel demo: simulasi gangguan koneksi (alur 5a)
      </label>
    </div>
  );
}
