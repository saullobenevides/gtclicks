"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Ban } from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import AppPagination from "@/components/shared/AppPagination";

export default function CollectionsModeration() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("PUBLICADA");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});

  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const router = useRouter();

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/collections?status=${statusFilter}&page=${page}`,
      );

      if (!response.ok) {
        setCollections([]);
        return;
      }

      const data = await response.json();

      if (data.data) {
        setCollections(data.data);
        setTotalPages(data.metadata.totalPages);
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

  const toggleDescription = (collectionId) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [collectionId]: !prev[collectionId],
    }));
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleStatusChange = (status) => {
    setStatusFilter(status);
    const params = new URLSearchParams(searchParams);
    params.set("page", "1");
    // Optionally sync statusFilter with URL too, but keeping it simple for now as per previous logic
    // But page reset is important.
    // Ideally should push router.
  };

  const handleDelete = async (collectionId) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/collections/${collectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Coleção excluída com sucesso!");
        fetchCollections();
      } else {
        alert("Erro ao excluir coleção");
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
      alert("Erro ao excluir coleção");
    }
  };

  const handleSuspend = async (collectionId) => {
    if (!confirm("Tem certeza que deseja suspender esta coleção?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/collections/${collectionId}/suspend`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        alert("Coleção suspensa com sucesso!");
        fetchCollections();
      } else {
        alert("Erro ao suspender coleção");
      }
    } catch (error) {
      console.error("Error suspending collection:", error);
      alert("Erro ao suspender coleção");
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
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Coleções</h1>
        <p className="text-zinc-400 mt-1">
          Gerenciar coleções da plataforma ({(collections || []).length} nesta
          página)
        </p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => handleStatusChange("RASCUNHO")}
          className={`px-4 py-2 font-medium transition-colors ${
            statusFilter === "RASCUNHO"
              ? "text-white border-b-2 border-primary"
              : "text-zinc-500 hover:text-white"
          }`}
        >
          Rascunhos
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

      {/* Collections Grid */}
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
                  {/* Thumbnail */}
                  <div className="relative w-48 h-32 bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                    {collection.imagemCapa ? (
                      <Image
                        src={collection.imagemCapa}
                        alt={collection.nome}
                        fill
                        sizes="192px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        Sem capa
                      </div>
                    )}
                  </div>

                  {/* Info */}
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
                      <Badge>{collection.categoria}</Badge>
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
                        <span>R$ {collection.precoBase?.toFixed(2)}</span>
                        <span>
                          {new Date(collection.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspend(collection.id)}
                          className="gap-2"
                        >
                          <Ban className="w-4 h-4" />
                          Suspender
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(collection.id)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
