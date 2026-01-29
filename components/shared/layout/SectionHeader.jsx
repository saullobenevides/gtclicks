"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * SectionHeader - Cabeçalho padronizado para seções
 * 
 * @param {Object} props
 * @param {string} props.title - Título da seção
 * @param {string} props.description - Descrição opcional
 * @param {string} props.badge - Badge opcional acima do título
 * @param {'left'|'center'} props.align - Alinhamento do conteúdo
 * @param {'default'|'large'} props.size - Tamanho do título
 * @param {string} props.className - Classes CSS adicionais
 */
export default function SectionHeader({
  title,
  description,
  badge,
  align = 'center',
  size = 'default',
  className
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  
  const titleSize = size === 'large' 
    ? 'text-4xl sm:text-5xl lg:text-6xl' 
    : 'text-3xl sm:text-4xl lg:text-5xl';

  return (
    <div 
      className={cn(
        "mb-12 md:mb-16 flex flex-col gap-3",
        alignClass,
        className
      )}
      data-testid="section-header"
    >
      {badge && (
        <Badge variant="outline" className="mb-2 w-fit">
          {badge}
        </Badge>
      )}
      
      <h2 className={cn(
        "font-display font-black text-white tracking-tight",
        titleSize
      )}>
        {title}
      </h2>
      
      {description && (
        <p className="max-w-2xl text-base md:text-lg text-gray-400 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
