import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentin — Privacy-First Browser Tools",
  description: "A professional suite of privacy-first tools. Edit documents, process PDFs, and manage data — all locally in your browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-accent/30 bg-[#161616] text-[#FFFFFF]">
        {children}
      </body>
    </html>
  );
}
