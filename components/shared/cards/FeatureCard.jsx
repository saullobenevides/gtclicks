"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * FeatureCard - Card padronizado para features/highlights
 * 
 * @param {Object} props
 * @param {string|React.ReactNode} props.icon - Ícone ou emoji
 * @param {string} props.title - Título da feature
 * @param {string} props.description - Descrição da feature
 * @param {string} props.href - Link opcional (torna o card clicável)
 * @param {'default'|'outlined'|'filled'} props.variant - Estilo do card
 * @param {string} props.className - Classes CSS adicionais
 */
export default function FeatureCard({
  icon,
  title,
  description,
  href,
  variant = 'default',
  className
}) {
  const variantClasses = {
    default: 'glass-panel p-8 transition-all hover:bg-white/5',
    outlined: 'border-2 border-white/10 bg-transparent p-8 transition-all hover:border-primary/50 hover:bg-white/5',
    filled: 'bg-white/5 border border-white/10 p-8 transition-all hover:bg-white/10'
  };

  const cardContent = (
    <>
      {icon && (
        <div className="mb-4 flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10 text-primary text-2xl">
          {typeof icon === 'string' ? icon : icon}
        </div>
      )}
      
      <CardHeader className="p-0 mb-3">
        <CardTitle className="text-xl font-bold text-white">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        <Card className={cn(variantClasses[variant], "group-hover:-translate-y-1", className)}>
          {cardContent}
        </Card>
      </Link>
    );
  }

  return (
    <Card className={cn(variantClasses[variant], className)}>
      {cardContent}
    </Card>
  );
}
