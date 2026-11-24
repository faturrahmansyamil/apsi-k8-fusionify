/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ekspor jadi file HTML/JS statis (folder `out/`) supaya bisa dipasang di GitHub Pages.
  output: "export",
  // Alamat dasar, misalnya "/sistem-pendaftaran-kendala-fusionify" di GitHub Pages.
  // Diisi otomatis oleh workflow deploy; kosong saat dijalankan di laptop.
  basePath: process.env.BASE_PATH || "",
  images: { unoptimized: true },
  // Sembunyikan tombol bulat "N" (indikator mode pengembangan Next.js) di pojok layar.
  devIndicators: false,
};
export default nextConfig;
