import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentin — Privacy-First Browser Tools",
  description: "A professional, macOS-inspired suite of privacy-first tools. Edit documents, process PDFs, convert media, and manage security tools — all 100% locally in your browser with zero data exfiltration.",
  keywords: ["privacy", "offline tools", "pdf editor", "word editor", "markdown", "image compressor", "password generator", "security", "developer tools", "nextjs", "client-side"],
  authors: [{ name: "SAIFUL-SIFAT" }],
  openGraph: {
    title: "Sentin — Privacy-First Browser Tools",
    description: "Your local office suite in the browser. No uploads, no servers, total privacy.",
    url: "https://github.com/SAIFUL-SIFAT/Sentin",
    siteName: "Sentin",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sentin — Privacy-First Browser Tools",
    description: "Professional office & developer tools running 100% locally in your browser.",
  },
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
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
