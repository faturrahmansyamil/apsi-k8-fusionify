"use client";

import { FormEvent, useState } from "react";
import { useSistem } from "@/lib/useSistem";
import { daftarPelanggan, InputPendaftaran } from "@/lib/sistem";
import { JudulHalaman, Kolom, Lencana } from "@/components/Kerangka";
import { Pendaftaran } from "@/lib/types";

const KOSONG: InputPendaftaran = { namaToko: "", kontak: "", botTokenTelegram: "", nomorWhatsApp: "" };

// UC-01 Daftar Pelanggan
export default function HalamanDaftar() {
  const { siap, st, segarkan } = useSistem();
  const [form, setForm] = useState<InputPendaftaran>(KOSONG);
  const [kolom, setKolom] = useState<Record<string, string>>({});
  const [gagal, setGagal] = useState("");
  const [berhasil, setBerhasil] = useState<{ pesan: string; data: Pendaftaran } | null>(null);

  const ubah = (k: keyof InputPendaftaran) => (e: { target: { value: string } }) =>
    setForm({ ...form, [k]: e.target.value });

  function kirim(e: FormEvent) {
    e.preventDefault();
    const h = daftarPelanggan(st, form); // langkah 5 (validasi) dan 6 (simpan ke D1)
    if (!h.ok) {
      setKolom(h.kolom ?? {}); // alur 5a: tandai kolom, data tidak masuk D1
      setGagal(h.pesan);
      setBerhasil(null);
      return;
    }
    setKolom({});
    setGagal("");
    setBerhasil({ pesan: h.pesan, data: h.data });
    setForm(KOSONG);
    segarkan();
  }

  if (!siap) return <p className="kecil">Memuat…</p>;

  return (
    <>
      <JudulHalaman uc="UC-01 Daftar Pelanggan" judul="Daftar Pelanggan" deskripsi="Isi data toko untuk mendaftar layanan bot Fusionify. Data akan diverifikasi Owner/Admin." />

      {berhasil && (
        <div className="notif sukses">
          {berhasil.pesan}
          <br />
          ID pendaftaran: <b>{berhasil.data.id}</b> · Status: <Lencana status={berhasil.data.status} />
        </div>
      )}
      {gagal && <div className="notif gagal">{gagal}</div>}

      <form className="kartu form-sempit" onSubmit={kirim} noValidate>
        <Kolom label="Nama toko" salah={kolom.namaToko}>
          <input value={form.namaToko} onChange={ubah("namaToko")} />
        </Kolom>
        <Kolom label="Kontak" bantu="(nomor yang bisa dihubungi)" salah={kolom.kontak}>
          <input value={form.kontak} onChange={ubah("kontak")} />
        </Kolom>
        <Kolom label="Bot token Telegram" bantu="(isi ini atau nomor WhatsApp)" salah={kolom.botTokenTelegram}>
          <input value={form.botTokenTelegram} onChange={ubah("botTokenTelegram")} />
        </Kolom>
        <Kolom label="Nomor WhatsApp bot" bantu="(isi ini atau bot token Telegram)" salah={kolom.nomorWhatsApp}>
          <input value={form.nomorWhatsApp} onChange={ubah("nomorWhatsApp")} />
        </Kolom>
        <div className="tombol">
          <button type="submit">Kirim pendaftaran</button>
        </div>
      </form>
    </>
  );
}
