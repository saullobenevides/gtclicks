"use client";

import { cn } from "@/lib/utils";
import LoadingState from "../states/LoadingState";

interface ResponsiveGridCols {
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

interface ResponsiveGridProps {
  children?: React.ReactNode;
  cols?: ResponsiveGridCols;
  gap?: number;
  loading?: boolean;
  empty?: React.ReactNode;
  className?: string;
}

export default function ResponsiveGrid({
  children,
  cols = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = 4,
  loading = false,
  empty,
  className,
}: ResponsiveGridProps) {
  const childrenArray = Array.isArray(children) ? children : [children];
  const hasChildren = childrenArray.filter(Boolean).length > 0;

  const gridClasses = cn(
    "grid",
    `gap-${gap}`,
    cols.sm === 1
      ? "grid-cols-1"
      : cols.sm === 2
      ? "grid-cols-2"
      : cols.sm === 3
      ? "grid-cols-3"
      : "grid-cols-1",
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  if (loading) {
    return (
      <div className={gridClasses}>
        <LoadingState variant="skeleton" count={cols.lg || 3} />
      </div>
    );
  }

  if (!hasChildren && empty) {
    return empty;
  }

  return (
    <div className={gridClasses} data-testid="responsive-grid">
      {children}
    </div>
  );
}
