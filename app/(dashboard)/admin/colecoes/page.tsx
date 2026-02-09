"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Ban, Check, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import AppPagination from "@/components/shared/AppPagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Collection {
  id: string;
  nome: string;
  descricao?: string;
  imagemCapa?: string;
  capaUrl?: string;
  categoria: string | null;
  precoBase?: number;
  precoFoto?: number;
  createdAt: string;
  fotografo: {
    user: { name?: string };
    username: string;
  };
  _count: { fotos: number };
}

export default function CollectionsModeration() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("RASCUNHO");
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<string, boolean>
  >({});
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectCollection, setRejectCollection] = useState<Collection | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [suspendCollection, setSuspendCollection] = useState<Collection | null>(null);
  const [suspendReason, setSuspendReason] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteCollection, setDeleteCollection] = useState<Collection | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/collections?status=${statusFilter}&page=${page}`
      );

      if (!response.ok) {
        setCollections([]);
        return;
      }

      const data = await response.json();

      if (data.data) {
        setCollections(data.data);
        setTotalPages(data.metadata?.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        setCollections(data);
        setTotalPages(1);
      } else {
        setCollections([]);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const toggleDescription = (collectionId: string) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
  };

  const truncateText = (text: string | undefined, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text ?? "";
    return text.substring(0, maxLength) + "...";
  };

  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleApprove = async (collectionId: string) => {
    setActionLoading(collectionId);
    try {
      const response = await fetch(
        `/api/admin/collections/${collectionId}/approve`,
        { method: "POST" }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Coleção aprovada com sucesso!");
        fetchCollections();
      } else {
        toast.error(data.error || "Erro ao aprovar coleção");
      }
    } catch (error) {
      toast.error("Erro ao aprovar coleção");
    } finally {
      setActionLoading(null);
    }
  };

  const openRejectModal = (collection: Collection) => {
    setRejectCollection(collection);
    setRejectReason("");
    setRejectOpen(true);
  };

  const handleReject = async () => {
    if (!rejectCollection) return;
    if (!rejectReason.trim()) {
      toast.error("O motivo da rejeição é obrigatório");
      return;
    }
    setActionLoading(rejectCollection.id);
    try {
      const response = await fetch(
        `/api/admin/collections/${rejectCollection.id}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: rejectReason.trim() }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Coleção rejeitada. O fotógrafo foi notificado.");
        setRejectOpen(false);
        setRejectCollection(null);
        setRejectReason("");
        fetchCollections();
      } else {
        toast.error(data.error || "Erro ao rejeitar coleção");
      }
    } catch (error) {
      toast.error("Erro ao rejeitar coleção");
    } finally {
      setActionLoading(null);
    }
  };

  const openSuspendModal = (collection: Collection) => {
    setSuspendCollection(collection);
    setSuspendReason("");
    setSuspendOpen(true);
  };

  const handleSuspend = async () => {
    if (!suspendCollection) return;
    setActionLoading(suspendCollection.id);
    try {
      const response = await fetch(
        `/api/admin/collections/${suspendCollection.id}/suspend`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason: suspendReason.trim() || undefined }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success("Coleção suspensa. O fotógrafo foi notificado.");
        setSuspendOpen(false);
        setSuspendCollection(null);
        setSuspendReason("");
        fetchCollections();
      } else {
        toast.error(data.error || "Erro ao suspender coleção");
      }
    } catch (error) {
      toast.error("Erro ao suspender coleção");
    } finally {
      setActionLoading(null);
    }
  };

  const openDeleteModal = (collection: Collection) => {
    setDeleteCollection(collection);
    setDeleteReason("");
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteCollection) return;
    setActionLoading(deleteCollection.id);
    try {
      const response = await fetch(`/api/admin/collections/${deleteCollection.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: deleteReason.trim() || undefined }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Coleção excluída. O fotógrafo foi notificado.");
        setDeleteOpen(false);
        setDeleteCollection(null);
        setDeleteReason("");
        fetchCollections();
      } else {
        toast.error(data.error || "Erro ao excluir coleção");
      }
    } catch (error) {
      toast.error("Erro ao excluir coleção");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-zinc-400">Carregando coleções...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Coleções</h1>
        <p className="text-zinc-400 mt-1">
          Gerenciar coleções da plataforma ({(collections || []).length} nesta
          página)
        </p>
      </div>

      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => handleStatusChange("RASCUNHO")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "RASCUNHO"
              ? "text-white border-b-2 border-primary"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Pendentes de aprovação
        </button>
        <button
          onClick={() => handleStatusChange("PUBLICADA")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "PUBLICADA"
              ? "text-white border-b-2 border-primary"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Publicadas
        </button>
      </div>

      {collections.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <p className="text-zinc-500">
            Nenhuma coleção {statusFilter.toLowerCase()} encontrada.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {collections.map((collection) => {
            const isExpanded = expandedDescriptions[collection.id];
            const description = collection.descricao || "Sem descrição";
            const shouldTruncate = description.length > 150;

            return (
              <div key={collection.id} className="glass-panel p-6">
                <div className="flex gap-6">
                  <div className="relative w-48 h-32 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                    {(collection.imagemCapa || collection.capaUrl) ? (
                      <Image
                        src={collection.imagemCapa || collection.capaUrl || ""}
                        alt={collection.nome}
                        fill
                        sizes="192px"
                        className="object-cover"
                        loading="lazy"
                        quality={75}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        Sem capa
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          {collection.nome}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1">
                          por {collection.fotografo.user.name} (@
                          {collection.fotografo.username})
                        </p>
                      </div>
                      {collection.categoria && (
                        <Badge>{collection.categoria}</Badge>
                      )}
                    </div>

                    <div className="mb-4">
                      <p className="text-zinc-400">
                        {isExpanded ? description : truncateText(description)}
                      </p>
                      {shouldTruncate && (
                        <button
                          onClick={() => toggleDescription(collection.id)}
                          className="text-primary text-sm hover:underline mt-1"
                        >
                          {isExpanded ? "Ver menos" : "Ver mais"}
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-zinc-500">
                        <span>{collection._count.fotos} fotos</span>
                        <span>
                          R${" "}
                          {Number(collection.precoBase ?? collection.precoFoto ?? 0).toFixed(2)}
                        </span>
                        <span>
                          {new Date(collection.createdAt).toLocaleDateString(
                            "pt-BR"
                          )}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {statusFilter === "RASCUNHO" ? (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(collection.id)}
                              disabled={actionLoading === collection.id}
                              className="gap-2"
                            >
                              {actionLoading === collection.id ? (
                                "Processando..."
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  Aprovar
                                </>
                              )}
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openRejectModal(collection)}
                              disabled={actionLoading === collection.id}
                              className="gap-2"
                            >
                              <X className="w-4 h-4" />
                              Rejeitar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openSuspendModal(collection)}
                              disabled={actionLoading === collection.id}
                              className="gap-2"
                            >
                              <Ban className="w-4 h-4" />
                              Suspender
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => openDeleteModal(collection)}
                              disabled={actionLoading === collection.id}
                              className="gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Excluir
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspender coleção</DialogTitle>
            <DialogDescription>
              A coleção voltará ao status de rascunho. O fotógrafo será notificado
              e poderá editar e reenviar para aprovação.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="suspend-reason">Motivo (opcional)</Label>
            <Textarea
              id="suspend-reason"
              placeholder="Ex: Conteúdo inadequado..."
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              className="mt-2 min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleSuspend}
              disabled={actionLoading !== null}
            >
              {actionLoading ? "Processando..." : "Suspender e notificar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir coleção</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. A coleção será removida
              permanentemente. O fotógrafo será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="delete-reason">Motivo (opcional)</Label>
            <Textarea
              id="delete-reason"
              placeholder="Ex: Violação das diretrizes..."
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              className="mt-2 min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading !== null}
            >
              {actionLoading ? "Processando..." : "Excluir e notificar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar coleção</DialogTitle>
            <DialogDescription>
              O fotógrafo será notificado com o motivo informado. A coleção
              permanecerá como rascunho e poderá ser reenviada após ajustes.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reject-reason">
              Motivo da rejeição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="Ex: As fotos não atendem aos critérios de qualidade..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2 min-h-[100px]"
              required
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectOpen(false);
                setRejectCollection(null);
                setRejectReason("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading !== null}
            >
              {actionLoading ? "Processando..." : "Rejeitar e notificar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="mt-4">
        <AppPagination
          currentPage={page}
          totalPages={totalPages}
          baseUrl="/admin/colecoes"
        />
      </div>
    </div>
  );
}
