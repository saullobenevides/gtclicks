"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS = {
  busca: "Busca",
  categorias: "Categorias",
  fotografos: "Fotógrafos",
  fotografo: "Fotógrafo",
  carrinho: "Carrinho",
  checkout: "Checkout",
  sucesso: "Sucesso",
  colecoes: "Coleções",
  "meus-favoritos": "Favoritos",
  "meus-downloads": "Downloads",
  pedidos: "Pedidos",
  contato: "Contato",
  faq: "FAQ",
  "como-funciona": "Como Funciona",
};

/**
 * Breadcrumbs para páginas - mostra o caminho de navegação
 * @param {Object} props
 * @param {Array<{label: string, href?: string, isLast?: boolean}>} props.items - Itens customizados (opcional)
 * @param {string} props.className - Classes CSS adicionais
 */
export default function PageBreadcrumbs({ items: customItems, className }) {
  const pathname = usePathname();

  const items =
    customItems ??
    (() => {
      const segments = pathname?.split("/").filter(Boolean) ?? [];
      return segments.map((segment, i) => {
        const href = "/" + segments.slice(0, i + 1).join("/");
        const label = LABELS[segment] ?? segment;
        return { label, href, isLast: i === segments.length - 1 };
      });
    })();

  if (!items?.length) return null;

  return (
    <nav
      aria-label="Navegação"
      className={cn(
        "flex flex-wrap items-center gap-1 text-sm text-muted-foreground",
        className
      )}
    >
      <Link
        href="/"
        className="hover:text-white transition-colors min-h-[44px] flex items-center"
      >
        Início
      </Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 shrink-0" aria-hidden />
          {item.isLast || !item.href ? (
            <span
              className="font-medium text-foreground truncate max-w-[200px]"
              aria-current="page"
              title={item.label}
            >
              {item.label}
            </span>
          ) : (
            <Link
              href={item.href}
              className="hover:text-white transition-colors min-h-[44px] flex items-center truncate max-w-[200px]"
              title={item.label}
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
