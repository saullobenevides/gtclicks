"use client";

import { Toaster as SonnerToaster } from "sonner";

export default function ToastProvider() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        classNames: {
          toast:
            "bg-black/95 backdrop-blur-xl border border-white/10 text-white shadow-2xl",
          title: "text-white font-semibold",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-white hover:bg-primary/90",
          cancelButton: "bg-white/10 text-white hover:bg-white/20",
          closeButton: "bg-white/10 text-white hover:bg-white/20",
          success: "border-green-500/20 bg-green-950/50",
          error: "border-red-500/20 bg-red-950/50",
          warning: "border-yellow-500/20 bg-yellow-950/50",
          info: "border-blue-500/20 bg-blue-950/50",
        },
        duration: 3000,
      }}
      icons={{
        success: "✓",
        error: "✕",
        warning: "⚠",
        info: "ℹ",
      }}
    />
  );
}
