// app/layout.tsx
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


// app/layout.tsx
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html lang="ko" className={geist.variable} suppressHydrationWarning>
      <head>
        {/* 테마 깜빡임 방지 — 렌더링 전에 미리 적용 */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme') || 'shinobi';
                document.documentElement.setAttribute('data-theme', theme);
              } catch(e) {}
            })();
          `
        }} />
        <title>{settings?.siteName ?? '닌-쟈 일기장'}</title>
        <meta name="description" content={settings?.siteDescription ?? 'TRPG 스포일러 방지 게시판'} />
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