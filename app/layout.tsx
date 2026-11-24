import type { Metadata } from "next";
import { ReactNode } from "react";
// Pengganti font feather dan duolingo-sans sesuai saran DESIGN.md (font aslinya tidak tersedia bebas).
// Disimpan lokal lewat @fontsource (lisensi SIL OFL) supaya tidak bergantung koneksi ke Google Fonts.
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";
import "@fontsource/nunito-sans/500.css";
import "@fontsource/nunito-sans/700.css";
import "./globals.css";
import { PenyediaSistem } from "@/lib/useSistem";
import { Header } from "@/components/Kerangka";

export const metadata: Metadata = {
  title: "Sistem Pendaftaran & Penanganan Kendala Fusionify",
  description: "Sistem Pendaftaran dan Penanganan Kendala Pelanggan PT Fusionify Digital Store, APSI Kelompok 8",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Pasang pilihan mode (terang/gelap) sebelum halaman tampil supaya tidak berkedip. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("tema");if(t==="dark"||t==="light")document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body>
        <PenyediaSistem>
          <Header />
          <main>{children}</main>
        </PenyediaSistem>
      </body>
    </html>
  );
}
