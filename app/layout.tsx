import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Manrope } from "next/font/google";

import { Providers } from "@/app/providers";
import "@/app/globals.css";

const displayFont = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-loaded",
});

const sansFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-loaded",
});

export const metadata: Metadata = {
  title: "Huele a Parrilla | Carnes frescas a domicilio en Santiago",
  description:
    "Carnes frescas provenientes del sur de Chile, preparadas a tu gusto y despachadas directamente a tu hogar en Santiago.",
  keywords: [
    "carnicería online Santiago",
    "carne a domicilio Santiago",
    "carne fresca",
    "carne del sur de Chile",
    "cortes para parrilla",
    "despacho de carne",
  ],
  openGraph: {
    title: "Huele a Parrilla | Carnes frescas a domicilio en Santiago",
    description:
      "Carnes frescas del sur de Chile, cortes preparados a tu gusto y despacho directo a tu hogar en Santiago.",
    siteName: "Huele a Parrilla",
    locale: "es_CL",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#1F1E1C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-CL" className={`${displayFont.variable} ${sansFont.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
