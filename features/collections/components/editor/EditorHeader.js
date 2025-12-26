'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function EditorHeader({ submitting, onSave }) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Editar Coleção</h1>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button type="button" onClick={onSave} disabled={submitting}>
          {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Save className="mr-2 h-4 w-4" />
          Salvar Tudo
        </Button>
      </div>
    </div>
  );
}
