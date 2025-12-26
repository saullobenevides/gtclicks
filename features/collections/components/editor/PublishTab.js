'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Trash2, Share2 } from 'lucide-react';
import { toast } from "sonner";

export default function PublishTab({ collectionData, initialCollection, onDataChange, setDeleteOpen }) {
  const getPublicUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/colecoes/${initialCollection.slug}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getPublicUrl());
    toast.success("Copiado!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publicar Coleção</CardTitle>
        <CardDescription>Revise e coloque sua coleção no ar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-2">
          <Label className="font-medium">Status Atual:</Label>
          <Select value={collectionData.status} onValueChange={(value) => onDataChange('status', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RASCUNHO">Rascunho (Privado)</SelectItem>
              <SelectItem value="PUBLICADA">✨ Publicada (Visível)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {initialCollection.slug && (
          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <Label>Link Público</Label>
            <div className="flex gap-2">
              <Input readOnly value={getPublicUrl()} className="font-mono text-sm" />
              <Button size="icon" variant="outline" onClick={copyToClipboard}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
        
        <div className="pt-8 border-t">
          <Button type="button" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir Coleção Permanentemente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
