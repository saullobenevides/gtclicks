"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

/**
 * ErrorState - Componente padronizado para estados de erro
 * 
 * @param {Object} props
 * @param {string} props.title - Título do erro
 * @param {string} props.message - Mensagem de erro
 * @param {Function} props.onRetry - Callback para tentar novamente
 * @param {'default'|'minimal'|'alert'} props.variant - Variante visual
 * @param {string} props.className - Classes CSS adicionais
 */
export default function ErrorState({
  title = "Algo deu errado",
  message,
  onRetry,
  variant = 'default',
  className
}) {
  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className} data-testid="error-state">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{message}</span>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-4"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Tentar novamente
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  const isMinimal = variant === 'minimal';

  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isMinimal ? "py-8" : "py-16",
        className
      )}
      data-testid="error-state"
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      {!isMinimal && (
        <div className="rounded-full bg-destructive/10 p-4 mb-6">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      )}

      {/* Title */}
      <h3 className={cn(
        "font-semibold text-foreground mb-2",
        isMinimal ? "text-base" : "text-xl"
      )}>
        {title}
      </h3>

      {/* Message */}
      {message && (
        <p className={cn(
          "text-muted-foreground max-w-md",
          isMinimal ? "text-sm mb-4" : "text-base mb-6"
        )}>
          {message}
        </p>
      )}

      {/* Retry Button */}
      {onRetry && (
        <Button 
          onClick={onRetry}
          variant="outline"
          size={isMinimal ? "default" : "lg"}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      )}
    </div>
  );
}
