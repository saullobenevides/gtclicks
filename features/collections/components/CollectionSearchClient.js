"use client";

import { useState, useMemo, useContext } from "react";
import { createPortal } from "react-dom";
import { Search, X, CheckSquare, ShoppingCart, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/context/CartContext";
import { toast } from "sonner";
import { SelectionContext } from "../context/SelectionContext";
import PhotoCard from "@/components/shared/cards/PhotoCard";

export default function CollectionSearchClient({
  allPhotos = [],
  collectionId,
  initialDisplayPhotos = [],
  children,
}) {
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const { addToCart } = useCart();

  const ITEMS_PER_PAGE = 12;

  const toggleSelection = (id) => {
    // ... (keep existing implementation)
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Reset pagination when query changes
  useMemo(() => {
    setCurrentPage(1);
  }, [query]);

  // ... (keep handleBulkAddToCart)
  const handleBulkAddToCart = () => {
    let count = 0;
    allPhotos.forEach((photo) => {
      if (selectedIds.has(photo.id)) {
        addToCart({
          fotoId: photo.id,
          colecaoId: collectionId,
          titulo: photo.numeroSequencial
            ? `Foto #${photo.numeroSequencial.toString().padStart(3, "0")}`
            : `Foto #${photo.id.replace(/\D/g, "").slice(-3)}`,
          preco: photo.colecao?.precoFoto || photo.preco || 0,
          precoBase: photo.colecao?.precoFoto || photo.preco || 0,
          descontos: photo.colecao?.descontos || [],
          licenca: "Uso Padrão",
          previewUrl: photo.previewUrl,
        });
        count++;
      }
    });

    toast.success(`${count} fotos adicionadas ao carrinho!`, {
      action: {
        label: "Ver Carrinho",
        onClick: () => (window.location.href = "/carrinho"),
      },
    });
    setSelectedIds(new Set());
  };

  const filteredPhotos = useMemo(() => {
    if (!query.trim()) return [];
    const lowerQuery = query.toLowerCase().trim();

    return allPhotos.filter((photo) => {
      const bibMatch =
        photo.numeroSequencial &&
        photo.numeroSequencial.toString() === lowerQuery;
      const bibMatchPartial =
        photo.numeroSequencial &&
        photo.numeroSequencial.toString().includes(lowerQuery);
      return bibMatch || bibMatchPartial;
    });
  }, [allPhotos, query]);

  // Determine which photos to display based on mode (Search vs Default)
  const photosToDisplay = query ? filteredPhotos : initialDisplayPhotos;
  const totalPages = Math.ceil(photosToDisplay.length / ITEMS_PER_PAGE);

  const currentPhotos = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return photosToDisplay.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, photosToDisplay]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  // Shared handlers
  const handleSelect = (id) => toggleSelection(id);
  const handleAddToCart = (photo) => {
    addToCart({
      fotoId: photo.id,
      colecaoId: collectionId,
      titulo: photo.numeroSequencial
        ? `Foto #${photo.numeroSequencial.toString().padStart(3, "0")}`
        : `Foto #${photo.id.replace(/\D/g, "").slice(-3)}`,
      preco: photo.colecao?.precoFoto || 0,
      licenca: "Uso Padrão",
      previewUrl: photo.previewUrl,
    });
    toast.success("Foto adicionada ao carrinho");
  };

  return (
    <SelectionContext.Provider
      value={{
        selectedIds,
        toggleSelection,
        isSelectionMode: selectedIds.size > 0,
      }}
    >
      <div className="space-y-8 relative pb-24">
        <div className="relative max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Buscar pelo número de peito..."
              className="pl-10 pr-10 bg-secondary/50 border-border focus:bg-background transition-colors h-12 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        {!query && children}

        <div className="space-y-8">
          {query && (
            <div className="flex items-center justify-between text-muted-foreground">
              <p>
                Resultados para "{query}":{" "}
                <span className="text-foreground font-bold">
                  {filteredPhotos.length}
                </span>{" "}
                fotos encontradas
              </p>
              <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
                Limpar busca
              </Button>
            </div>
          )}

          {photosToDisplay.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2 md:gap-8">
                {currentPhotos.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    priority={index < 4}
                    isSelected={selectedIds.has(photo.id)}
                    onSelect={handleSelect}
                    onAddToCart={handleAddToCart}
                    contextList={photosToDisplay}
                    variant="centered-hover"
                  />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 md:gap-4 mt-12 pb-12">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 w-20 md:h-10 md:w-24 text-xs md:text-sm border-[#480000]/20 text-foreground hover:border-[#480000] hover:text-[#480000] disabled:opacity-50"
                  >
                    Anterior
                  </Button>
                  <span className="text-xs md:text-sm font-medium text-current whitespace-nowrap">
                    Página {currentPage} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 w-20 md:h-10 md:w-24 text-xs md:text-sm border-[#480000]/20 text-foreground hover:border-[#480000] hover:text-[#480000] disabled:opacity-50"
                  >
                    Próxima
                  </Button>
                </div>
              )}
            </>
          ) : query ? (
            <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
              {/* Empty State for Search */}
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-medium mb-2">
                Nenhuma foto encontrada
              </h3>
              <p className="text-muted-foreground">
                Não encontramos fotos com o termo "{query}".
              </p>
            </div>
          ) : (
            <div className="text-center py-24 border-2 border-dashed border-white/5 rounded-xl bg-secondary/5">
              {/* Empty State for Default View */}
              <p className="text-muted-foreground">
                Nenhuma foto encontrada nesta pasta.
              </p>
            </div>
          )}
        </div>

        {/* Floating Action Bar - Use Portal to escape any parent transforms */}
        {typeof document !== "undefined" &&
          createPortal(
            <div
              className={`fixed bottom-24 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 w-[95%] md:w-auto ${
                selectedIds.size > 0
                  ? "translate-y-0 opacity-100"
                  : "translate-y-24 opacity-0 pointer-events-none"
              }`}
            >
              <div className="bg-zinc-900/95 text-white pl-4 pr-2 py-2 md:pl-6 md:pr-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center justify-between gap-3 md:gap-4 md:min-w-[320px] border border-white/10 ring-1 ring-white/10 backdrop-blur-md">
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="flex items-center justify-center bg-white/20 h-6 w-6 md:h-8 md:w-8 rounded-full text-xs md:text-sm font-bold shadow-inner">
                    {selectedIds.size}
                  </span>
                  <span className="font-medium text-xs md:text-sm tracking-wide">
                    <span className="hidden md:inline">fotos selecionadas</span>
                    <span className="md:hidden">selecionadas</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setSelectedIds(new Set())}
                    variant="ghost"
                    size="sm"
                    className="h-8 md:h-9 px-2 md:px-3 hover:bg-white/10 hover:text-white rounded-full text-[10px] md:text-xs uppercase tracking-wide opacity-70 hover:opacity-100 transition-all font-semibold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleBulkAddToCart}
                    size="sm"
                    className="h-8 md:h-10 px-4 md:px-6 bg-white text-black hover:bg-gray-200 rounded-full font-bold shadow-lg hover:scale-105 transition-all text-xs md:text-sm"
                  >
                    <ShoppingCart className="h-3 w-3 md:h-4 md:w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    </SelectionContext.Provider>
  );
}
