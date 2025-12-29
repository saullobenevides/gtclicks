"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * LoadingState - Componente padronizado para estados de carregamento
 * 
 * @param {Object} props
 * @param {'spinner'|'skeleton'|'pulse'} props.variant - Tipo de loading
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do loading
 * @param {string} props.message - Mensagem opcional
 * @param {number} props.count - Número de skeletons (para variant skeleton)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function LoadingState({
  variant = 'spinner',
  size = 'md',
  message,
  count = 3,
  className
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  if (variant === 'spinner') {
    return (
      <div 
        className={cn(
          "flex flex-col items-center justify-center py-12",
          className
        )}
        data-testid="loading-state"
        role="status"
        aria-live="polite"
      >
        <Loader2 className={cn(
          "animate-spin text-primary",
          sizeClasses[size]
        )} />
        {message && (
          <p className="mt-4 text-sm text-muted-foreground">
            {message}
          </p>
        )}
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div 
        className={cn("space-y-4", className)}
        data-testid="loading-skeleton"
        role="status"
        aria-live="polite"
      >
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index}
            className="bg-muted rounded-xl animate-pulse"
            style={{ 
              height: size === 'sm' ? '80px' : size === 'lg' ? '200px' : '120px' 
            }}
          />
        ))}
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div 
        className={cn(
          "flex items-center justify-center py-12",
          className
        )}
        data-testid="loading-pulse"
        role="status"
        aria-live="polite"
      >
        <div className="flex space-x-2">
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-primary rounded-full animate-bounce"></div>
        </div>
        <span className="sr-only">Carregando...</span>
      </div>
    );
  }

  return null;
}
