import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

import { cn } from "@/lib/utils";
import Link from "next/link";

const Pagination = ({ className, "aria-label": ariaLabel, ...props }) => (
  <nav
    role="navigation"
    aria-label={ariaLabel ?? "Navegação de páginas"}
    className={cn("mx-auto flex w-full justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = React.forwardRef(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1 sm:gap-2", className)}
    {...props}
  />
));
PaginationContent.displayName = "PaginationContent";

const PaginationItem = React.forwardRef(({ className, ...props }, ref) => (
  <li ref={ref} className={cn("list-none", className)} {...props} />
));
PaginationItem.displayName = "PaginationItem";

const paginationLinkStyles = (isActive, size = "icon") =>
  cn(
    "inline-flex items-center justify-center min-h-[44px] touch-manipulation rounded-radius-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2",
    size === "icon" && "h-9 w-9 min-w-[36px] sm:h-10 sm:w-10 sm:min-w-[40px]",
    size === "default" && "h-9 px-3 sm:h-10 sm:px-4 gap-1",
    isActive
      ? "border-2 border-border-default bg-surface-subtle text-text-primary"
      : "border-transparent text-text-muted hover:text-text-primary hover:bg-surface-subtle"
  );

const PaginationLink = ({ className, isActive, size = "icon", ...props }) => (
  <Link
    aria-current={isActive ? "page" : undefined}
    className={cn(paginationLinkStyles(isActive, size), className)}
    {...props}
  />
);
PaginationLink.displayName = "PaginationLink";

/** Versão botão para paginação client-side (onClick em vez de href) */
const PaginationButton = React.forwardRef(
  ({ className, isActive, size = "icon", ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-current={isActive ? "page" : undefined}
      className={cn(
        paginationLinkStyles(isActive, size),
        "cursor-pointer",
        className
      )}
      {...props}
    />
  )
);
PaginationButton.displayName = "PaginationButton";

const PaginationPrevious = ({ className, as = "link", ...rest }) => {
  const Comp = as === "button" ? PaginationButton : PaginationLink;
  return (
    <Comp
      size="default"
      aria-label="Ir para página anterior"
      className={cn("gap-1 pl-2.5 pr-2.5", className)}
      {...rest}
    >
      <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
      <span className="hidden sm:inline">Anterior</span>
    </Comp>
  );
};
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({ className, as = "link", ...rest }) => {
  const Comp = as === "button" ? PaginationButton : PaginationLink;
  return (
    <Comp
      size="default"
      aria-label="Ir para próxima página"
      className={cn("gap-1 pl-2.5 pr-2.5", className)}
      {...rest}
    >
      <span className="hidden sm:inline">Próximo</span>
      <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
    </Comp>
  );
};
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({ className, ...props }) => (
  <span
    aria-hidden
    className={cn(
      "flex h-9 w-9 min-h-[36px] sm:h-10 sm:w-10 items-center justify-center text-muted-foreground",
      className
    )}
    {...props}
  >
    <MoreHorizontal className="h-4 w-4" />
    <span className="sr-only">Mais páginas</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
