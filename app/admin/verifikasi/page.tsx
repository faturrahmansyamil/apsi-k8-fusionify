"use client";

import { useState } from "react";
import { useSistem } from "@/lib/useSistem";
import { bacaD1, daftarPendaftaranBaru, setujuiPendaftaran, tolakPendaftaran } from "@/lib/sistem";
import { ButuhPeran, formatWaktu, JudulHalaman, Kolom, Kosong, Lencana } from "@/components/Kerangka";

// UC-02 Verifikasi Pendaftaran
export default function HalamanVerifikasi() {
  return (
    <>
      <JudulHalaman
        uc="UC-02 Verifikasi Pendaftaran"
        judul="Verifikasi Pendaftaran"
        deskripsi="Periksa kelayakan data pendaftaran baru, lalu setujui atau tolak dengan alasan."
      />
      <ButuhPeran peran="admin">
        <Isi />
      </ButuhPeran>
    </>
  );
}

function Isi() {
  const { st, segarkan } = useSistem();
  const [dipilih, setDipilih] = useState<string | null>(null);
  const [modeTolak, setModeTolak] = useState(false);
  const [alasan, setAlasan] = useState("");
  const [hasil, setHasil] = useState<{ ok: boolean; pesan: string } | null>(null);

  const baru = daftarPendaftaranBaru(st); // langkah 2: baca D1
  const riwayat = bacaD1(st).filter((p) => p.status !== "Menunggu Verifikasi").reverse();
  const p = baru.find((x) => x.id === dipilih) ?? null;

  function pilih(id: string) {
    setDipilih(id);
    setModeTolak(false);
    setAlasan("");
    setHasil(null);
  }

  function setujui() {
    if (!p) return;
    const h = setujuiPendaftaran(st, p.id); // langkah 4–5
    setHasil(h);
    if (h.ok) setDipilih(null);
    segarkan();
  }

  function tolak() {
    if (!p) return;
    const h = tolakPendaftaran(st, p.id, alasan); // alur 4a
    setHasil(h);
    if (h.ok) { setDipilih(null); setModeTolak(false); setAlasan(""); }
    segarkan();
  }

  return (
    <>
      {hasil && <div className={`notif ${hasil.ok ? "sukses" : "gagal"}`}>{hasil.pesan}</div>}

      <div className="ruang-kerja">
        <div className="kartu">
          <div className="kartu-kepala">
            <h2>Pendaftaran baru</h2>
            <span className="jumlah">{baru.length} menunggu verifikasi</span>
          </div>
          {baru.length === 0 ? (
            <Kosong judul="Tidak ada pendaftaran baru" isi='Belum ada data berstatus "Menunggu Verifikasi" di D1.' />
          ) : (
            <div className="tabel-wadah">
              <table>
                <thead><tr><th className="nowrap">ID</th><th>Nama toko</th><th className="nowrap sembunyi-hp">Dikirim</th></tr></thead>
                <tbody>
                  {baru.map((x) => (
                    <tr key={x.id} className={`bisa-klik ${x.id === dipilih ? "dipilih" : ""}`} onClick={() => pilih(x.id)}>
                      <td className="nowrap"><b>{x.id}</b></td><td>{x.namaToko}</td><td className="nowrap sembunyi-hp">{formatWaktu(x.dibuatPada)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel-rincian">
          <div className="kartu">
            {!p ? (
              <Kosong judul="Belum ada data dipilih" isi="Pilih salah satu pendaftaran untuk memeriksa datanya." />
            ) : (
              <>
                <div className="kartu-kepala">
                  <h2>{p.namaToko}</h2>
                  <Lencana status={p.status} />
                </div>
                <dl>
                  <dt>ID</dt><dd>{p.id}</dd>
                  <dt>Kontak</dt><dd>{p.kontak}</dd>
                  <dt>Bot token Telegram</dt><dd>{p.botTokenTelegram || "–"}</dd>
                  <dt>Nomor WhatsApp bot</dt><dd>{p.nomorWhatsApp || "–"}</dd>
                  <dt>Dikirim</dt><dd>{formatWaktu(p.dibuatPada)}</dd>
                </dl>
                {!modeTolak ? (
                  <div className="tombol">
                    <button onClick={setujui}>Setujui pendaftaran</button>
                    <button className="sekunder" onClick={() => setModeTolak(true)}>Tolak pendaftaran</button>
                  </div>
                ) : (
                  <>
                    <hr className="pemisah" />
                    <Kolom label="Alasan penolakan">
                      <textarea value={alasan} onChange={(e) => setAlasan(e.target.value)} />
                    </Kolom>
                    <div className="tombol">
                      <button className="bahaya" disabled={!alasan.trim()} onClick={tolak}>Kirim penolakan</button>
                      <button className="sekunder" onClick={() => setModeTolak(false)}>Batal</button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="kartu" style={{ marginTop: 24 }}>
        <div className="kartu-kepala">
          <h2>Riwayat verifikasi</h2>
          <span className="jumlah">{riwayat.length} data</span>
        </div>
        {riwayat.length === 0 ? (
          <Kosong judul="Belum ada riwayat" />
        ) : (
          <div className="tabel-wadah">
            <table>
              <thead><tr><th className="nowrap">ID</th><th>Nama toko</th><th className="nowrap">Status</th><th className="sembunyi-hp">Alasan penolakan</th></tr></thead>
              <tbody>
                {riwayat.map((x) => (
                  <tr key={x.id}>
                    <td className="nowrap"><b>{x.id}</b></td><td>{x.namaToko}</td><td className="nowrap"><Lencana status={x.status} /></td><td className="sembunyi-hp">{x.alasanPenolakan ?? "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
