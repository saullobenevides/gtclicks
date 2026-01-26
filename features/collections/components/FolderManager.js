"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Folder,
  FolderPlus,
  MoreVertical,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function FolderManager({
  collectionId,
  currentFolder,
  onNavigate,
  onFolderChange,
}) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create/Edit Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const fetchFolders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const parentIdParam = currentFolder?.id
        ? `&parentId=${currentFolder.id}`
        : "";
      const res = await fetch(
        `/api/folders?colecaoId=${collectionId}${parentIdParam}`,
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.details ||
            errorData.error ||
            `Erro ${res.status}: Falha ao carregar pastas`,
        );
      }
      const data = await res.json();
      setFolders(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [collectionId, currentFolder]);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: folderName,
          colecaoId: collectionId,
          parentId: currentFolder?.id || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Erro ao criar pasta");
      }

      await fetchFolders();
      setIsDialogOpen(false);
      setFolderName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFolder = async () => {
    if (!folderName.trim() || !editingFolder) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/folders/${editingFolder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: folderName }),
      });

      if (!res.ok) throw new Error("Erro ao atualizar pasta");

      await fetchFolders();
      setIsDialogOpen(false);
      setEditingFolder(null);
      setFolderName("");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("Tem certeza? Isso excluirá a pasta e todo o seu conteúdo."))
      return;
    try {
      const res = await fetch(`/api/folders/${folderId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erro ao deletar pasta");
      await fetchFolders();
    } catch (err) {
      setError(err.message);
    }
  };

  const openCreateDialog = () => {
    setEditingFolder(null);
    setFolderName("");
    setIsDialogOpen(true);
  };

  const openEditDialog = (folder) => {
    setEditingFolder(folder);
    setFolderName(folder.nome);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Pastas</h3>
        <Button variant="outline" size="sm" onClick={openCreateDialog}>
          <FolderPlus className="mr-2 h-4 w-4" />
          Nova Pasta
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="animate-spin h-6 w-6" />
        </div>
      ) : folders.length === 0 ? (
        <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
          <Folder className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>Nenhuma pasta aqui.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="group hover:border-primary transition-colors cursor-pointer"
              onClick={() => onNavigate(folder)}
            >
              <CardContent className="p-3 md:p-4 flex flex-col items-center text-center space-y-2 relative">
                <Folder className="h-10 w-10 md:h-12 md:w-12 text-blue-500 fill-blue-100" />
                <span
                  className="font-medium truncate w-full min-w-0 text-sm md:text-base"
                  title={folder.nome}
                >
                  {folder.nome}
                </span>
                <span className="text-[10px] md:text-xs text-muted-foreground">
                  {folder._count?.children || 0} pastas,{" "}
                  {folder._count?.fotos || 0} fotos
                </span>

                <div
                  className="absolute top-1 right-1 md:top-2 md:right-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreVertical className="h-3 w-3 md:h-4 md:w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(folder)}>
                        <Pencil className="mr-2 h-4 w-4" /> Renomear
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteFolder(folder.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFolder ? "Renomear Pasta" : "Nova Pasta"}
            </DialogTitle>
            <DialogDescription>
              {editingFolder
                ? "Digite o novo nome da pasta."
                : "Digite o nome da nova pasta."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Nome da pasta"
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (editingFolder ? handleUpdateFolder() : handleCreateFolder())
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={editingFolder ? handleUpdateFolder : handleCreateFolder}
              disabled={submitting}
            >
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingFolder ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
