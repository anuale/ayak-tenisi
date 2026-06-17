"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowButton(false);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShowButton(false);
    }
    setDeferredPrompt(null);
  }

  if (!showButton) return null;

  return (
    <div className="glass-surface border border-primary/30 rounded-xl p-4 mx-4">
      <div className="flex items-center gap-3">
        <Download className="w-5 h-5 text-primary flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground font-medium">Uygulamayı Ana Ekrana Ekle</p>
          <p className="text-[10px] text-muted-foreground">Hızlı erişim için telefon ana ekranına ekleyin.</p>
        </div>
        <button
          onClick={handleInstall}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-bold active:scale-95 transition-transform whitespace-nowrap"
        >
          Ekle
        </button>
      </div>
    </div>
  );
}
