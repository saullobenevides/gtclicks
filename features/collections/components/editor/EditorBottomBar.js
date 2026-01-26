"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";

export default function EditorBottomBar({ onSave, onBack, submitting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-black/80 backdrop-blur-2xl border-t border-white/10 z-50 md:hidden flex gap-4">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="flex-1 border-white/20 h-14 font-bold uppercase tracking-widest text-xs rounded-xl"
      >
        <ArrowLeft className="mr-2 h-4 w-4 text-muted-foreground" /> Voltar
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={submitting}
        className="flex-2 grow-2 bg-primary hover:bg-primary/90 h-14 font-black uppercase tracking-tighter text-base rounded-xl"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Salvar
      </Button>
    </div>
  );
}
