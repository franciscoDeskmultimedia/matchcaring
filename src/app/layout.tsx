import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/components/LanguageContext";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MatchCaring Bio | Plataforma de Selección y Diagnóstico de Cuidados",
  description:
    "Plataforma científica de diagnóstico y selección de cuidados para niños, adultos mayores y personas con discapacidad. Evaluación psicológica, protocolos de emergencia y compatibilidad de hogar.",
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen font-sans bg-slate-50 text-slate-900 antialiased selection:bg-sky-500 selection:text-white">
        <LanguageProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </LanguageProvider>
      </body>
    </html>
  );
}
