import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Breadcrumbs({ path, onNavigate }) {
  // path is an array of folders: [{ id: null, nome: 'Raiz' }, { id: '123', nome: 'Making Of' }]

  return (
    <nav className="flex flex-nowrap items-center gap-1 text-sm text-muted-foreground">
      {path.map((folder, index) => {
        const isLast = index === path.length - 1;

        return (
          <div key={folder.id || "root"} className="flex items-center shrink-0">
            {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}

            <Button
              variant="ghost"
              size="sm"
              className={`px-2 h-8 ${isLast ? "font-semibold text-foreground pointer-events-none" : ""}`}
              onClick={() => !isLast && onNavigate(folder)}
            >
              <span className="whitespace-nowrap block">
                {folder.id === null ? (
                  <Home className="h-4 w-4" />
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
