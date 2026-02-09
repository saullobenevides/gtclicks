"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/shared/states";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const logErrorToServer = async () => {
      try {
        await fetch("/api/log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            url: typeof window !== "undefined" ? window.location.href : "",
          }),
        });
      } catch (e) {
        console.error("Failed to report error:", e);
      }
    };

    console.error("Application Error:", error);
    logErrorToServer();
  }, [error]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full space-y-6">
        <ErrorState
          title="Algo deu errado!"
          message="Encontramos um erro inesperado. Nossa equipe já foi notificada."
          onRetry={reset}
        />
        <div className="bg-red-950/30 border border-red-900/50 p-4 rounded-md text-left overflow-auto max-h-32">
          <code className="text-xs text-red-200 font-mono break-all">
            {error.message || "Erro desconhecido"}
          </code>
        </div>
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/">Voltar ao início</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
