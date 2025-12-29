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
  className
}) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <Card className="flex flex-col items-center gap-4 rounded-2xl border border-white/5 bg-black/50 p-8 transition-all hover:border-primary/50 hover:bg-white/5 hover:-translate-y-1">
        <CardContent className="flex flex-col items-center p-0 w-full">
          <span className="text-4xl mb-2 grayscale group-hover:grayscale-0 transition-all">
            {icon}
          </span>
          <div className="space-y-2 text-center">
            <h3 className="font-bold text-white text-lg">
              {title}
            </h3>
            <p className="text-sm text-gray-400">
              {description}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
