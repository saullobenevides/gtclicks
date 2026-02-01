"use client";

import { useState, useEffect } from "react";
import { X, Smartphone, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "gtclicks-pwa-dismissed";

export default function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    setIsStandalone(standalone);
    setIsIOS(ios);

    if (standalone) return;

    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    if (ios) setShowBanner(true);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem(STORAGE_KEY, "1");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-50 max-w-md mx-auto">
      <div className="glass-panel border border-white/10 rounded-xl p-4 shadow-xl flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/20 shrink-0">
          <Smartphone className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white text-sm">
            Instalar o GTClicks
          </h3>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-1">
              Toque em <Share className="w-3 h-3 inline align-middle mx-0.5" />{" "}
              e depois <Plus className="w-3 h-3 inline align-middle mx-0.5" />{" "}
              &quot;Adicionar à Tela de Início&quot; para acesso rápido.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Use como app: acesso rápido, notificações e experiência fluida.
            </p>
          )}

          {!isIOS && deferredPrompt && (
            <div className="flex gap-2 mt-2">
              <Button size="sm" onClick={handleInstall} className="h-8 text-xs">
                Instalar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="h-8 text-xs text-muted-foreground"
              >
                Agora não
              </Button>
            </div>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="p-1 rounded-md hover:bg-white/10 text-muted-foreground shrink-0"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
