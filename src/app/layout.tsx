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
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
