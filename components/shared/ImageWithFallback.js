"use client";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ImageWithFallback({
  src,
  alt,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  fill = true,
  width,
  height,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center bg-secondary text-xs text-muted-foreground",
          className,
        )}
      >
        {!src ? "Imagem indisponível" : "Erro ao carregar"}
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden h-full w-full", className)}>
      <Image
        src={src}
        alt={alt || "Imagem"}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes}
        priority={priority}
        className={cn(
          "object-cover transition-all duration-700 ease-in-out",
          isLoading
            ? "scale-110 blur-xl grayscale"
            : "scale-100 blur-0 grayscale-0",
          imageClassName,
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
