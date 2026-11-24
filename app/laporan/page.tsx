"use client";

import { FormEvent, useState } from "react";
import { useSistem } from "@/lib/useSistem";
import { InputLaporan, KATEGORI_KENDALA, kirimLaporan } from "@/lib/sistem";
import { ButuhPeran, JudulHalaman, Kolom, Lencana } from "@/components/Kerangka";
import { LaporanKendala } from "@/lib/types";

const KOSONG: InputLaporan = { kategori: "", deskripsi: "", bukti: "" };

// UC-04 Kirim Laporan Kendala
export default function HalamanLaporan() {
  return (
    <>
      <JudulHalaman uc="UC-04 Kirim Laporan Kendala" judul="Laporan Kendala" deskripsi="Sampaikan kendala pada bot secara terstruktur. Setelah terkirim, Anda mendapat nomor tiket." />
      <ButuhPeran peran="pelanggan">
        <Isi />
      </ButuhPeran>
    </>
  );
}

function Isi() {
  const { st, sesi, segarkan } = useSistem();
  const [form, setForm] = useState<InputLaporan>(KOSONG);
  const [kolom, setKolom] = useState<Record<string, string>>({});
  const [gagal, setGagal] = useState("");
  const [berhasil, setBerhasil] = useState<{ pesan: string; data: LaporanKendala } | null>(null);
  const [kunciFile, setKunciFile] = useState(0);

  function kirim(e: FormEvent) {
    e.preventDefault();
    if (sesi?.peran !== "pelanggan") return;
    const h = kirimLaporan(st, sesi.idPelanggan, form); // langkah 5–6
    if (!h.ok) {
      setKolom(h.kolom ?? {}); // alur 5a: tidak disimpan ke D3
      setGagal(h.pesan);
      setBerhasil(null);
      return;
    }
    setKolom({});
    setGagal("");
    setBerhasil({ pesan: h.pesan, data: h.data });
    setForm(KOSONG);
    setKunciFile((k) => k + 1);
    segarkan();
  }

  return (
    <>
      {berhasil && (
        <div className="notif sukses">
          {berhasil.pesan} · Status: <Lencana status={berhasil.data.status} />
        </div>
      )}
      {gagal && <div className="notif gagal">{gagal}. Lengkapi kolom yang ditandai lalu kirim ulang.</div>}

      <form className="kartu form-sempit" onSubmit={kirim} noValidate>
        <Kolom label="Kategori masalah" salah={kolom.kategori}>
          <select value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
            <option value="">— pilih kategori —</option>
            {KATEGORI_KENDALA.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </Kolom>
        <Kolom label="Deskripsi kronologi" salah={kolom.deskripsi}>
          <textarea value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
        </Kolom>
        <Kolom label="Bukti pendukung" bantu="(opsional, misal tangkapan layar)">
          <input
            key={kunciFile}
            type="file"
            accept="image/*,.pdf"
            onChange={(e) => setForm({ ...form, bukti: e.target.files?.[0]?.name ?? "" })}
          />
        </Kolom>
        <p className="kecil">Pada draft ini hanya nama file bukti yang disimpan, filenya belum diunggah.</p>
        <div className="tombol">
          <button type="submit">Kirim laporan</button>
        </div>
      </form>
    </>
  );
}
