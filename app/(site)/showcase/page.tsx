"use client";

import { useState } from "react";
import { ResponsiveGrid } from "@/components/shared/layout";
import { PhotoCard } from "@/components/shared/cards";
import {
  EmptyState,
  LoadingState,
  ErrorState,
} from "@/components/shared/states";
import { ActionButton } from "@/components/shared/actions";
import Badge from "@/components/shared/Badge";
import { ShoppingCart, Star, Image as ImageIcon, Trash2 } from "lucide-react";

interface MockPhoto {
  id: string;
  titulo: string;
  previewUrl: string;
  colecaoId: string;
  preco: number;
}

export default function ComponentsShowcase() {
  const [loading, setLoading] = useState(false);
  const [showEmpty, setShowEmpty] = useState(false);
  const [showError, setShowError] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());

  const mockPhotos: MockPhoto[] = [
    {
      id: "1",
      titulo: "Pôr do Sol na Praia",
      previewUrl:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400",
      colecaoId: "col-1",
      preco: 15.0,
    },
    {
      id: "2",
      titulo: "Montanhas Nevadas",
      previewUrl:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      colecaoId: "col-1",
      preco: 15.0,
    },
    {
      id: "3",
      titulo: "Cidade à Noite",
      previewUrl:
        "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400",
      colecaoId: "col-1",
      preco: 15.0,
    },
  ];

  const handleAddToCart = (photo: MockPhoto) => {
    console.log("Added to cart:", photo);
  };

  const handleSelect = (id: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Deleted!");
  };

  return (
    <div className="container mx-auto py-12 space-y-16">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Componentes Padronizados</h1>
        <p className="text-muted-foreground">
          Showcase de todos os componentes reutilizáveis do GTClicks
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold mb-6">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <Badge variant="default">Default</Badge>
          <Badge variant="primary">Primary</Badge>
          <Badge variant="success" icon={Star}>
            Success
          </Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="info">Info</Badge>
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
          <Badge size="lg">Large</Badge>
          <Badge onRemove={() => alert("Removed!")}>Removível</Badge>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Photo Cards</h2>

        <h3 className="text-lg font-semibold mb-4">Variante Default</h3>
        <ResponsiveGrid cols={{ sm: 1, md: 2, lg: 3 }}>
          {mockPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              variant="default"
              onAddToCart={handleAddToCart}
              onSelect={handleSelect}
              isSelected={selectedPhotos.has(photo.id)}
            />
          ))}
        </ResponsiveGrid>

        <h3 className="text-lg font-semibold mb-4 mt-8">Variante Compact</h3>
        <ResponsiveGrid cols={{ sm: 2, md: 3, lg: 4 }}>
          {mockPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              variant="compact"
              showSelection={false}
              onAddToCart={handleAddToCart}
            />
          ))}
        </ResponsiveGrid>
      </section>

      <section className="space-y-8">
        <h2 className="text-2xl font-bold mb-6">Estados</h2>

        <div>
          <h3 className="text-lg font-semibold mb-4">Empty State</h3>
          <EmptyState
            icon={ShoppingCart}
            title="Seu carrinho está vazio"
            description="Adicione fotos incríveis ao seu carrinho para começar"
            action={{
              label: "Explorar Coleções",
              onClick: () => alert("Navegando para coleções..."),
            }}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Loading States</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-6">
              <p className="text-sm font-medium mb-4 text-center">Spinner</p>
              <LoadingState variant="spinner" message="Carregando..." />
            </div>
            <div className="border rounded-lg p-6">
              <p className="text-sm font-medium mb-4 text-center">Skeleton</p>
              <LoadingState variant="skeleton" count={2} />
            </div>
            <div className="border rounded-lg p-6">
              <p className="text-sm font-medium mb-4 text-center">Pulse</p>
              <LoadingState variant="pulse" />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Error State</h3>
          <ErrorState
            title="Algo deu errado"
            message="Não foi possível carregar os dados. Tente novamente."
            onRetry={() => alert("Tentando novamente...")}
          />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Error State (Alert)</h3>
          <ErrorState
            variant="alert"
            message="Erro ao processar sua solicitação"
            onRetry={() => alert("Retry!")}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Action Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <ActionButton
            onAction={handleDelete}
            successMessage="Ação executada com sucesso!"
          >
            Executar Ação
          </ActionButton>

          <ActionButton
            onAction={handleDelete}
            requireConfirm
            confirmMessage="Tem certeza que deseja continuar?"
            successMessage="Confirmado e executado!"
            variant="outline"
          >
            Ação com Confirmação
          </ActionButton>

          <ActionButton
            onAction={handleDelete}
            requireConfirm
            confirmMessage="Esta ação é irreversível!"
            successMessage="Deletado com sucesso"
            errorMessage="Erro ao deletar"
            variant="destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar
          </ActionButton>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Responsive Grid com Estados</h2>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setLoading(false);
              setShowEmpty(false);
              setShowError(false);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Mostrar Conteúdo
          </button>
          <button
            onClick={() => {
              setLoading(true);
              setShowEmpty(false);
              setShowError(false);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Mostrar Loading
          </button>
          <button
            onClick={() => {
              setLoading(false);
              setShowEmpty(true);
              setShowError(false);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg"
          >
            Mostrar Empty
          </button>
        </div>

        <ResponsiveGrid
          cols={{ sm: 1, md: 2, lg: 3 }}
          loading={loading}
          empty={
            <EmptyState
              icon={ImageIcon}
              title="Nenhuma foto encontrada"
              description="Tente ajustar seus filtros de busca"
            />
          }
        >
          {!showEmpty &&
            mockPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                onAddToCart={handleAddToCart}
              />
            ))}
        </ResponsiveGrid>
      </section>
    </div>
  );
}
