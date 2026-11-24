"use client";

import { useState } from "react";
import { ambilMateri, DAFTAR_MATERI, MateriPanduan } from "@/lib/panduan";
import { ButuhPeran, JudulHalaman } from "@/components/Kerangka";

// UC-03 Akses Panduan Bot
export default function HalamanPanduan() {
  return (
    <>
      <JudulHalaman uc="UC-03 Akses Panduan Bot" judul="Pusat Panduan/Tutorial" deskripsi="Pelajari cara mengoperasikan bot lewat panduan interaktif dan video tutorial." />
      <ButuhPeran peran="pelanggan">
        <Isi />
      </ButuhPeran>
    </>
  );
}

function Isi() {
  const [materi, setMateri] = useState<MateriPanduan | null>(null);
  const [gagal, setGagal] = useState("");

  function buka(id: string) {
    const h = ambilMateri(id); // langkah 4
    if (!h.ok) {
      setGagal(h.pesan); // alur 4a: kembali ke daftar materi
      setMateri(null);
      return;
    }
    setGagal("");
    setMateri(h.data);
  }

  if (materi) {
    return (
      <div className="kartu form-sempit">
        <span className="jenis">{materi.jenis}</span>
        <h2>{materi.judul}</h2>
        <p>{materi.ringkasan}</p>
        {materi.langkah && (
          <ol>
            {materi.langkah.map((l) => <li key={l}>{l}</li>)}
          </ol>
        )}
        <div className="tombol">
          <button className="sekunder" onClick={() => setMateri(null)}>Kembali ke daftar materi</button>
        </div>
      </div>
    );
  }

  return (
    <>
      {gagal && <div className="notif gagal">{gagal}</div>}
      <div className="kartu">
        <h2>Daftar materi</h2>
        <ul className="daftar-materi">
          {DAFTAR_MATERI.map((m) => (
            <li key={m.id}>
              <div className="teks">
                <span className="jenis">{m.jenis}</span>
                <div><b>{m.judul}</b></div>
                <div className="kecil">{m.ringkasan}</div>
              </div>
              <button className="sekunder" onClick={() => buka(m.id)}>Buka materi</button>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
