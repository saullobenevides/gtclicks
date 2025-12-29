"use client";

import { cn } from "@/lib/utils";

/**
 * PageSection - Wrapper padronizado para seções de página
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo da seção
 * @param {'default'|'hero'|'compact'} props.variant - Variante de espaçamento
 * @param {boolean} props.containerWide - Usar container-wide ao invés de container
 * @param {string} props.className - Classes CSS adicionais
 */
export default function PageSection({
  children,
  variant = 'default',
  containerWide = true,
  className
}) {
  const paddingClasses = {
    hero: 'py-32 md:py-40',
    default: 'py-16 md:py-24',
    compact: 'py-8 md:py-12'
  };

  const containerClass = containerWide ? 'container-wide' : 'container';

  return (
    <section 
      className={cn(
        paddingClasses[variant],
        className
      )}
      data-testid="page-section"
    >
      <div className={containerClass}>
        {children}
      </div>
    </section>
  );
}
