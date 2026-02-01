"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * IconCard - Card com ícone para CTAs e links de ação
 *
 * @param {Object} props
 * @param {string} props.icon - Emoji ou ícone
 * @param {string} props.title - Título
 * @param {string} props.description - Descrição
 * @param {string} props.href - Link de destino
 * @param {string} props.className - Classes CSS adicionais
 */
export default function IconCard({
  icon,
  title,
  description,
  href,
  className,
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-page rounded-2xl",
        className
      )}
      aria-label={`${title}: ${description}`}
    >
      <Card className="flex flex-col items-center justify-center gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-6 min-h-[140px] sm:min-h-[160px] transition-all hover:border-primary/50 hover:bg-white/5 hover:-translate-y-0.5 active:scale-[0.99] touch-manipulation">
        <CardContent className="flex flex-col items-center p-0 w-full">
          <span className="text-text-4xl mb-space-2 grayscale group-hover:grayscale-0 transition-all">
            {icon}
          </span>
          <div className="space-y-space-2 text-center">
            <h3 className="font-font-bold text-text-primary text-text-lg">
              {title}
            </h3>
            <p className="text-text-sm text-text-secondary">{description}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
