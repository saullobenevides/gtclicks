"use client";

import { TableHead } from "@/components/ui/table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface SortableTableHeadProps {
  field: string;
  sort: string;
  order: string;
  onSort: (field: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function SortableTableHead({
  field,
  sort,
  order,
  onSort,
  className,
  children,
}: SortableTableHeadProps) {
  const isActive = sort === field;
  const label =
    order === "asc"
      ? `Ordenar por ${children} (ascendente, clicar para descendente)`
      : `Ordenar por ${children} (descendente, clicar para ascendente)`;

  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="flex items-center gap-1.5 w-full text-left font-medium hover:text-white transition-colors group text-muted-foreground"
        aria-label={isActive ? label : `Ordenar por ${children}`}
      >
        {children}
        <span className="group-hover:text-white">
          {isActive ? (
            order === "asc" ? (
              <ArrowUp className="h-4 w-4" aria-hidden />
            ) : (
              <ArrowDown className="h-4 w-4" aria-hidden />
            )
          ) : (
            <ArrowUpDown className="h-4 w-4 opacity-50" aria-hidden />
          )}
        </span>
      </button>
    </TableHead>
  );
}
