"use client";

import { cn } from "@/lib/utils";
import LoadingState from "../states/LoadingState";
import EmptyState from "../states/EmptyState";

/**
 * ResponsiveGrid - Grid responsivo padronizado para cards e conteúdo
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Conteúdo do grid
 * @param {Object} props.cols - Número de colunas por breakpoint
 * @param {number} props.cols.sm - Colunas em telas small (padrão: 1)
 * @param {number} props.cols.md - Colunas em telas medium (padrão: 2)
 * @param {number} props.cols.lg - Colunas em telas large (padrão: 3)
 * @param {number} props.cols.xl - Colunas em telas extra-large (padrão: 4)
 * @param {number} props.gap - Espaçamento entre itens (padrão: 4)
 * @param {boolean} props.loading - Se está carregando
 * @param {React.ReactNode} props.empty - Componente para estado vazio
 * @param {string} props.className - Classes CSS adicionais
 */
export default function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  loading = false,
  empty,
  className
}) {
  // Convert children to array to check length
  const childrenArray = Array.isArray(children) ? children : [children];
  const hasChildren = childrenArray.filter(Boolean).length > 0;

  // Generate grid classes based on cols prop
  const gridClasses = cn(
    "grid",
    `gap-${gap}`,
    // Small screens
    cols.sm === 1 ? "grid-cols-1" :
    cols.sm === 2 ? "grid-cols-2" :
    cols.sm === 3 ? "grid-cols-3" : "grid-cols-1",
    // Medium screens
    cols.md && `md:grid-cols-${cols.md}`,
    // Large screens
    cols.lg && `lg:grid-cols-${cols.lg}`,
    // Extra large screens
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  // Show loading state
  if (loading) {
    return (
      <div className={gridClasses}>
        <LoadingState variant="skeleton" count={cols.lg || 3} />
      </div>
    );
  }

  // Show empty state
  if (!hasChildren && empty) {
    return empty;
  }

  return (
    <div className={gridClasses} data-testid="responsive-grid">
      {children}
    </div>
  );
}
