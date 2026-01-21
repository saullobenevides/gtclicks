"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditorHeader({ submitting, onSave }) {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
      <h1 className="text-2xl md:text-3xl font-bold tracking-tight px-1">
        Editar Coleção
      </h1>
      <div className="hidden md:flex flex-row gap-2 w-auto mt-0 px-1">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="w-auto"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button
          type="button"
          onClick={onSave}
          disabled={submitting}
          className="w-auto"
        >
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar
        </Button>
      </div>
    </div>
  );
}
