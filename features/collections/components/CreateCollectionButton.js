"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2 } from "lucide-react";
import { createCollection } from "@/actions/collections";

export default function CreateCollectionButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateCollection = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("nome", "Nova Coleção (Rascunho)");
      formData.append("status", "RASCUNHO");

      const result = await createCollection(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      const newCollectionId = result.data.id;
      router.push(`/dashboard/fotografo/colecoes/${newCollectionId}/editar`);
    } catch (error) {
      console.error(error);
      alert(error.message);
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
      {isLoading ? "Criando..." : "Criar Nova Coleção"}
    </Button>
  );
}
