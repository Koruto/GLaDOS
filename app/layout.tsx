import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: ["400"],
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  weight: ["300", "400"],
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GLaDOS Core — Conversation Monitor",
  description:
    "Aperture Science Enrichment Center. Your specimen has been processed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${shareTechMono.variable} ${cormorantGaramond.variable} ${dmSans.variable} h-full`}
    >
      <body className="h-full">{children}</body>
    </html>
  );
}
