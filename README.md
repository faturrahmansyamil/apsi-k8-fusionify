# Sistem Pendaftaran dan Penanganan Kendala Pelanggan, Draft Aplikasi APSI Kelompok 8

PT Fusionify Digital Store. Nama sistem mengikuti Proses 0 (Context Diagram) di Laporan 5; nama perusahaan di doc masih tertulis "PT Fusionify Digital Group" dan perlu disamakan.
Alur mengikuti tabel Use Case final di Laporan 4 (Activity Diagram) dan data store di Laporan 5 (DFD).

## Menjalankan

```
npm install
npm run dev      # buka http://localhost:3000
npm test         # 19 tes logika (alur sukses + gagal)
npm run build
```

## Versi online (GitHub Pages)

https://faturrahmansyamil.github.io/apsi-k8-fusionify/

Setiap push ke branch `main`, GitHub Actions (`.github/workflows/deploy.yml`) menjalankan tes, membangun versi statis (`out/`), lalu memasangnya ke GitHub Pages. Data tetap tersimpan di browser masing-masing pengunjung; buka "Panel demo" di beranda untuk mengisi data contoh.

## Peta Use Case → halaman → kode

| UC | Halaman | Aktor | Logika (`lib/`) | Alur gagal |
|---|---|---|---|---|
| UC-01 Daftar Pelanggan | `/daftar` | Pelanggan UMKM | `daftarPelanggan` | 5a: kolom wajib kosong → tidak masuk D1, kolom ditandai, "Pendaftaran gagal, data belum lengkap" |
| UC-02 Verifikasi Pendaftaran | `/admin/verifikasi` | Owner/Admin | `setujuiPendaftaran`, `tolakPendaftaran` | 4a: tolak + alasan → D1 "Ditolak", tidak masuk D2, info ditolak + alasan |
| UC-03 Akses Panduan Bot | `/panduan` | Pelanggan UMKM | `ambilMateri` (`lib/panduan.ts`) | 4a: materi belum tersedia → "Materi tidak dapat ditampilkan", kembali ke daftar |
| UC-04 Kirim Laporan Kendala | `/laporan` | Pelanggan UMKM | `kirimLaporan` | 5a: kolom wajib kosong → tidak disimpan ke D3, "Laporan belum lengkap" |
| UC-05 Lihat Dashboard Kendala | `/admin/dashboard` | Owner/Admin | `daftarLaporan`, `detailLaporan` | 2a: D3 kosong → "Belum ada laporan kendala" |
| UC-06 Perbarui Status Laporan | `/admin/dashboard` (panel rincian) | Owner/Admin | `perbaruiStatus` | 5a: gagal simpan → perubahan tidak tersimpan ke D3, minta simpan ulang |

Data store (localStorage): `D1_data_pendaftaran`, `D2_data_pelanggan`, `D3_data_laporan_kendala`.

## Keputusan yang perlu dikonfirmasi kelompok

- **Kolom wajib UC-01**: nama toko, kontak, dan bot token Telegram *atau* nomor WhatsApp (minimal salah satu). Format bot token tidak dicek sistem; token salah ditangkap Owner/Admin lewat UC-02 4a.
- **Kolom wajib UC-04**: kategori dan deskripsi kronologi. Bukti pendukung opsional.
- **Kategori kendala**: Payment gateway, Produk terkirim ganda, Lainnya (diambil dari temuan wawancara).
- **Alasan penolakan wajib** diisi sebelum tombol tolak aktif.
- **Isi materi panduan** di `lib/panduan.ts` masih kerangka contoh; ganti dengan materi asli dari Fusionify.

## Yang masih simulasi (sebut di video demo)

- Login: pilih peran di beranda (pelanggan dipilih dari D2), belum ada login sungguhan.
- Notifikasi ke pelanggan (UC-02) hanya dicatat di `/notifikasi`, belum dikirim ke WhatsApp/Telegram.
- Bukti pendukung (UC-04): hanya nama file yang disimpan.
- Gangguan koneksi (UC-06 5a): dipicu lewat centang "simulasi gangguan koneksi" di beranda atau panel rincian dashboard.
- Data tersimpan di localStorage browser masing-masing, belum ada server/database bersama.

## Desain

Mengikuti DESIGN.md "Duolingo" di Refero Styles (styles.refero.design/style/7088d695-362b-4e09-b325-fa8136d4f350), tanpa maskot/ilustrasi dan tanpa logo atau nama Duolingo. Token: hijau `#58cc02`, hijau muda `#d7ffb8`, biru `#1cb0f6`, teks `#4b4b4b`/`#777777`, garis `#afafaf`, radius 12px, garis 2px, tanpa bayangan. Font asli diganti Nunito (judul) dan Nunito Sans (teks) sesuai saran DESIGN.md, disimpan lokal lewat paket @fontsource (lisensi SIL OFL) supaya tidak butuh internet saat jalan. Warna merah, kuning, dan biru muda untuk status/pesan gagal adalah tambahan kita karena tidak ada di DESIGN.md. Semua token ada di `app/globals.css`.

Mode gelap: tambahan kita (DESIGN.md Duolingo hanya tema terang). Bawaan mengikuti setelan perangkat; tombol ☾/☀ di header menyimpan pilihan di browser. Warna hijau dan biru utama tetap sama di kedua mode.

## Struktur

```
app/            halaman per UC
components/     header, penjaga peran, kolom form
lib/types.ts    struktur D1, D2, D3
lib/sistem.ts   logika UC-01, 02, 04, 05, 06
lib/panduan.ts  materi UC-03 (statis, tanpa data store)
lib/demo.ts     sesi simulasi, data contoh, saklar gangguan
tests/          tes alur sukses dan gagal
```
