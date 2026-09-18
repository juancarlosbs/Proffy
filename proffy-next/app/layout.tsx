import type { Metadata } from "next";
import { Poppins, Archivo } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "Proffy",
  description: "Sua plataforma de estudos online.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${poppins.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full font-poppins">{children}</body>
    </html>
  );
}
