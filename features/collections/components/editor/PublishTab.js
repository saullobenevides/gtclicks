"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2, Share2 } from "lucide-react";
import { toast } from "sonner";

export default function PublishTab({
  collectionData,
  initialCollection,
  onDataChange,
  setDeleteOpen,
}) {
  const getPublicUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/colecoes/${initialCollection.slug}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getPublicUrl());
    toast.success("Copiado!");
  };

  return (
    <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pl-4 md:px-6 py-4 md:py-6">
        <CardTitle>Publicar Coleção</CardTitle>
        <CardDescription>Revise e coloque sua coleção no ar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="space-y-1.5 w-full md:w-1/2">
            <Label>Status da Coleção</Label>
            <Select
              value={collectionData.status}
              onValueChange={(value) => onDataChange("status", value)}
            >
              <SelectTrigger className="h-11 bg-transparent border-2 border-border-default rounded-radius-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RASCUNHO">Rascunho (Oculta)</SelectItem>
                <SelectItem value="PUBLICADA">Publicada (Visível)</SelectItem>
                <SelectItem value="PRIVADA">Privada (Exclusiva)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {initialCollection.slug && (
          <div className="bg-muted/50 rounded-lg space-y-2 p-4">
            <Label>Link Público</Label>
            <div className="flex gap-2 w-full max-w-full min-w-0">
              <Input
                readOnly
                value={getPublicUrl()}
                className="font-mono text-sm flex-1 min-w-0 w-full h-11 bg-surface-subtle/50 border-2 border-border-default rounded-radius-lg"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="pt-8 border-t">
          <Button
            type="button"
            variant="danger"
            className="h-auto py-3 px-5 whitespace-normal text-left gap-3"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="h-5 w-5 shrink-0" />
            Excluir Coleção Permanentemente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
