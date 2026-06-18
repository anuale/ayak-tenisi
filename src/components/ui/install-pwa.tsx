"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-banner-dismissed");
    if (dismissed) return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (isStandalone) return;

    const ua = navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/.test(ua));

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (isIOS) {
      setTimeout(() => setShowBanner(true), 2000);
    } else {
      setTimeout(() => {
        if (!deferredPrompt) setShowBanner(true);
      }, 3000);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "1");
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowBanner(false);
      localStorage.setItem("pwa-banner-dismissed", "1");
    }
    setDeferredPrompt(null);
  }

  if (!showBanner) return null;

  return (
    <div className="glass-surface border border-primary/30 rounded-xl p-3">
      <div className="flex items-center gap-2">
        <Download className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs text-foreground font-medium">Uygulamayı Ana Ekrana Ekle</p>
          <p className="text-[10px] text-muted-foreground">
            {isIOS
              ? "Safari'de Paylaş → Ana Ekrana Ekle"
              : "Hızlı erişim için ana ekrana ekleyin."}
          </p>
        </div>
        {deferredPrompt && !isIOS ? (
          <button
            onClick={handleInstall}
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-bold active:scale-95 transition-transform whitespace-nowrap"
          >
            Ekle
          </button>
        ) : (
          <button
            onClick={dismiss}
            className="p-1 text-muted-foreground hover:text-foreground flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
