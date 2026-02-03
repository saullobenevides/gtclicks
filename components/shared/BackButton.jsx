"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Botão Voltar - usa router.back() ou href
 * @param {Object} props
 * @param {string} props.href - Link alternativo (se não quiser history.back)
 * @param {string} props.className - Classes CSS adicionais
 * @param {string} props.label - Texto do botão (default: "Voltar")
 */
export default function BackButton({ href, className, label = "Voltar" }) {
  const router = useRouter();

  if (href) {
    return (
      <Button
        variant="ghost"
        size="sm"
        asChild
        className={cn("min-h-[44px] touch-manipulation", className)}
      >
        <a href={href} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className={cn("min-h-[44px] touch-manipulation", className)}
      aria-label="Voltar à página anterior"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      {label}
    </Button>
  );
}
