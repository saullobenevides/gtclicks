"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default function CreateCollectionButton() {
  return (
    <Button asChild>
      <Link href="/dashboard/fotografo/colecoes/nova">
        <PlusCircle className="mr-2 h-4 w-4" />
        Criar Nova Coleção
      </Link>
    </Button>
  );
}
