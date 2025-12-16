'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';

export default function CreateCollectionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateCollection = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/colecoes/create-draft', {
        method: 'POST',
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao criar coleção');
      }

      const newCollectionId = result.data.id;
      router.push(`/dashboard/fotografo/colecoes/${newCollectionId}/editar`);
    } catch (error) {
      console.error(error);
      alert(error.message); // Or show a toast notification
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button onClick={handleCreateCollection} disabled={isLoading}>
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <PlusCircle className="mr-2 h-4 w-4" />
      )}
      {isLoading ? 'Criando...' : 'Criar Nova Coleção'}
    </Button>
  );
}
