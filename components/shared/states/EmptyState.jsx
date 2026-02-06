"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

/**
 * EmptyState - Componente padronizado para estados vazios
 *
 * @param {Object} props
 * @param {React.ComponentType} props.icon - Ícone do Lucide React
 * @param {string} props.title - Título do estado vazio
 * @param {string} props.description - Descrição opcional
 * @param {Object} props.action - Ação call-to-action
 * @param {string} props.action.label - Texto do botão
 * @param {Function} props.action.onClick - Callback do botão
 * @param {string} props.action.href - Link do botão (alternativo ao onClick)
 * @param {string} props.illustration - URL de ilustração opcional
 * @param {'default'|'minimal'|'illustrated'|'dashboard'} props.variant - Variante visual (dashboard = tema escuro)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
  variant = "default",
  className,
}) {
  const isMinimal = variant === "minimal";
  const isIllustrated = variant === "illustrated";
  const isDashboard = variant === "dashboard";

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        isMinimal ? "py-8" : "py-16",
        isDashboard && "py-12",
        className
      )}
      data-testid="empty-state"
    >
      {/* Icon or Illustration */}
      {isIllustrated && illustration ? (
        <div className="mb-6 relative h-48 w-48">
          <Image
            src={illustration}
            alt=""
            fill
            sizes="192px"
            className="opacity-50 object-contain"
            aria-hidden="true"
            loading="lazy"
          />
        </div>
      ) : (
        Icon && (
          <div
            className={cn(
              "rounded-full flex items-center justify-center mb-6",
              isDashboard ? "h-16 w-16 bg-white/10" : "bg-muted",
              !isDashboard && (isMinimal ? "h-12 w-12" : "h-16 w-16")
            )}
          >
            <Icon
              className={cn(
                "text-muted-foreground",
                isMinimal ? "h-6 w-6" : "h-8 w-8",
                isDashboard && "opacity-90"
              )}
            />
          </div>
        )
      )}

      {/* Title */}
      <h3
        className={cn(
          "font-semibold mb-2",
          isDashboard ? "text-xl text-white" : "text-foreground",
          isMinimal && "text-base"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            "max-w-md text-muted-foreground",
            isMinimal ? "text-sm mb-4" : "text-base mb-6"
          )}
        >
          {description}
        </p>
      )}

      {/* Action Button */}
      {action &&
        (action.href ? (
          <Button
            asChild
            size={isMinimal ? "default" : "lg"}
            className={
              isDashboard &&
              "bg-(--button-primary-bg)] hover:bg-(--button-primary-hover)] text-white"
            }
          >
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button
            onClick={action.onClick}
            size={isMinimal ? "default" : "lg"}
            className={
              isDashboard &&
              "bg-(--button-primary-bg)] hover:bg-(--button-primary-hover)] text-white"
            }
          >
            {action.label}
          </Button>
        ))}
    </div>
  );

  return content;
}
