"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  className?: string;
  label?: string;
}

export default function BackButton({
  href,
  className,
  label = "Voltar",
}: BackButtonProps) {
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
