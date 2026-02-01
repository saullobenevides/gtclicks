import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Breadcrumbs({ path, onNavigate }) {
  return (
    <nav
      aria-label="Navegação de pastas"
      className="flex flex-nowrap items-center gap-1 text-sm text-muted-foreground"
    >
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;

        return (
          <div key={folder.id || "root"} className="flex items-center shrink-0">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 mx-1 shrink-0" aria-hidden />
            )}

            <Button
              variant="ghost"
              size="sm"
              className={`px-2 min-h-[44px] h-9 touch-manipulation ${
                isLast
                  ? "font-semibold text-foreground pointer-events-none"
                  : ""
              }`}
              onClick={() => !isLast && onNavigate(folder)}
              aria-current={isLast ? "page" : undefined}
              aria-label={folder.id === null ? "Raiz" : `Pasta ${folder.nome}`}
            >
              <span className="whitespace-nowrap block">
                {folder.id === null ? (
                  <Home className="h-4 w-4 shrink-0" aria-hidden />
                ) : (
                  folder.nome
                )}
              </span>
            </Button>
          </div>
        );
      })}
    </nav>
  );
}
