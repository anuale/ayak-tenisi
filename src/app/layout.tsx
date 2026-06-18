import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Anybody } from "next/font/google";
import { SessionProvider } from "@/components/providers/session-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
  weight: ["800"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "Ayak Tenisi Skor",
  description: "Foot tennis score tracking app for competitive players",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Ayak Tenisi",
  },
  applicationName: "Ayak Tenisi Skor",
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0e1511",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${jetbrainsMono.variable} ${anybody.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js').then(function(reg){reg.addEventListener('updatefound',function(){var w=reg.installing;w.addEventListener('statechange',function(){if(w.state==='installed'&&navigator.serviceWorker.controller){var e=document.createElement('div');e.style.cssText='position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:9999;background:#4edea3;color:#003824;padding:10px 20px;border-radius:50px;font-size:13px;font-weight:bold;cursor:pointer;box-shadow:0 4px 20px rgba(78,222,163,0.4)';e.textContent='Yeni sürüm var, yenile ↻';e.onclick=function(){w.postMessage('SKIP_WAITING');location.reload()};document.body.appendChild(e);setTimeout(function(){e.remove()},15000)}})})}).catch(function(){})}`,
          }}
        />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
