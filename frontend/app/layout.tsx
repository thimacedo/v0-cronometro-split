import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPH Partilhas - Cronômetro Sincronizado",
  description: "Cronômetro de precisão para reuniões do Zoom",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children} body>
    </html>
  );
}
