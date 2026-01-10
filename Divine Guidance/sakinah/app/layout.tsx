import type { Metadata } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Sakinah | Divine Tranquility",
  description: "An AI-powered spiritual companion for Muslims.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${amiri.variable} antialiased bg-[#F8F9FA] text-[#1B4D3E] selection:bg-[#D4AF37] selection:text-white`}
      >
        {children}
      </body>
    </html>
  );
}
