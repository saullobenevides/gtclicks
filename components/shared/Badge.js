"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Badge - Componente de badge reutilizável
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do badge
 * @param {'default'|'primary'|'success'|'warning'|'error'|'info'} props.variant - Variante de cor
 * @param {'sm'|'md'|'lg'} props.size - Tamanho do badge
 * @param {React.ComponentType} props.icon - Ícone opcional
 * @param {Function} props.onRemove - Callback ao remover (mostra X)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function Badge({
  children,
  variant = "default",
  size = "md",
  icon: Icon,
  onRemove,
  className,
}) {
  const variantClasses = {
    default: "bg-muted text-foreground",
    primary: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-border bg-transparent text-foreground",
    success: "bg-green-500 text-white",
    warning: "bg-yellow-500 text-white",
    error: "bg-destructive text-destructive-foreground",
    info: "bg-primary/10 text-primary border border-primary/20",
  };

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  const iconSizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      data-testid="badge"
    >
      {Icon && <Icon className={iconSizeClasses[size]} />}
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:opacity-70 transition-opacity"
          aria-label="Remover"
        >
          <X className={iconSizeClasses[size]} />
        </button>
      )}
    </span>
  );
}
