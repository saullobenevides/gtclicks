"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditorHeader({ submitting, onSave, isDirty, title }) {
  const router = useRouter();

  return (
    <header
      className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0 min-w-0"
      aria-label="Cabeçalho do editor"
    >
      <h1 className="heading-display font-display font-black text-xl sm:text-2xl md:text-4xl text-white tracking-tight px-1 break-words w-full min-w-0">
        {title || "Editar Coleção"}
      </h1>
      <div
        className="hidden md:flex flex-row gap-2 w-auto mt-0 px-1 shrink-0"
        role="group"
        aria-label="Ações do editor"
      >
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-auto min-h-[44px] border-white/20 touch-manipulation"
          aria-label="Voltar"
        >
          <ArrowLeft className="mr-2 h-4 w-4 shrink-0" aria-hidden />
          Voltar
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={submitting || !isDirty}
          className="w-auto min-h-[44px] touch-manipulation"
          aria-label={submitting ? "Salvando..." : "Salvar alterações"}
          aria-busy={submitting}
        >
          {submitting && (
            <Loader2
              className="mr-2 h-4 w-4 animate-spin shrink-0"
              aria-hidden
            />
          )}
          <Save className="mr-2 h-4 w-4 shrink-0" aria-hidden />
          Salvar
        </Button>
      </div>
    </header>
  );
}
