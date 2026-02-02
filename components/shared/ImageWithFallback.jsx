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
  fill,
  width,
  height,
}) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Se width/height foram passados, usar dimensões fixas em vez de fill
  const useFill = fill ?? (width == null && height == null);

  if (error || !src) {
    return (
      <div
        className={cn(
          "flex h-full w-full min-h-[80px] items-center justify-center bg-muted text-xs text-muted-foreground",
          className
        )}
      >
        {!src ? "Imagem indisponível" : "Erro ao carregar"}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        useFill ? "h-full w-full min-h-[80px]" : "",
        className
      )}
    >
      <Image
        src={src}
        alt={alt || "Imagem"}
        fill={useFill}
        width={!useFill ? width : undefined}
        height={!useFill ? height : undefined}
        sizes={sizes}
        priority={priority}
        unoptimized={
          typeof src === "string" &&
          (src.startsWith("/api/") || src.includes("/api/images/"))
        }
        className={cn(
          "object-cover transition-all duration-700 ease-in-out",
          isLoading ? "opacity-50" : "opacity-100",
          imageClassName
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => setError(true)}
      />
    </div>
  );
}
