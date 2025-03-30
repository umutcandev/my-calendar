import { GeistSans, GeistMono } from "geist/font";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Takvim Uygulaması",
  description: "Kişisel takvim ve planlama uygulaması",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="dark">
      <body
        className={`${GeistSans.className} font-sans antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
