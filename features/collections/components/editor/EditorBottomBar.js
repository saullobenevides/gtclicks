"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";

export default function EditorBottomBar({ onSave, onBack, submitting }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-background/95 backdrop-blur border-t border-border z-50 md:hidden flex gap-3">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        className="flex-1"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
      </Button>
      <Button
        type="button"
        onClick={onSave}
        disabled={submitting}
        className="flex-2"
      >
        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        <Save className="mr-2 h-4 w-4" />
        Salvar
      </Button>
    </div>
  );
}
