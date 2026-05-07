// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/Header";
import ThemeProvider from "@/components/ThemeProvider";
import { getSettings } from "@/lib/github";

const geist = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title:       settings?.siteName        ?? '닌-쟈 일기장',
    description: settings?.siteDescription ?? '시노비가미 스포일러 방지 게시판',
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="ko" className={geist.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ margin: 0 }}>
        <Providers>
          <ThemeProvider settings={settings} />
          <Header settings={settings} />
          {children}
        </Providers>
      </body>
    </html>
  );
}