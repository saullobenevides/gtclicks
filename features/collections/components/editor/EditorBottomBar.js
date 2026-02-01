"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";

export default function EditorBottomBar({ onSave, onBack, submitting }) {
  return (
    <div
      role="toolbar"
      aria-label="Ações do editor (mobile)"
      className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-black/95 backdrop-blur-2xl border-t border-white/10 z-100 md:hidden flex gap-3 touch-manipulation"
    >
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="flex-1 min-h-[48px] border-white/20 font-bold uppercase tracking-widest text-xs rounded-xl touch-manipulation"
        aria-label="Voltar"
      >
        <ArrowLeft
          className="mr-2 h-4 w-4 text-muted-foreground shrink-0"
          aria-hidden
        />
        Voltar
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={submitting}
        className="flex-[1.5] min-h-[48px] font-black uppercase tracking-tighter text-base rounded-xl touch-manipulation"
        aria-label={submitting ? "Salvando..." : "Salvar alterações"}
        aria-busy={submitting}
      >
        {submitting && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" aria-hidden />
        )}
        <Save className="mr-2 h-4 w-4 shrink-0" aria-hidden />
        Salvar
      </Button>
    </div>
  );
}
