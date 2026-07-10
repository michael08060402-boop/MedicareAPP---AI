import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "MediCare AI",
    template: "%s · MediCare AI",
  },
  description:
    "Plataforma integral de gestión hospitalaria con inteligencia artificial — pacientes, médicos, citas, historias clínicas y más.",
  keywords: ["healthcare", "hospital", "clínica", "gestión médica", "IA"],
  authors: [{ name: "MediCare AI" }],
  icons: {
    icon: [{ url: "/medicare.png", type: "image/png" }],
    apple: "/medicare.png",
    shortcut: "/medicare.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${inter.className} h-full`}>
      <body className="min-h-full bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
