'use client';

import { useState, useMemo, useContext } from 'react';
import { createPortal } from 'react-dom';
import { Search, X, CheckSquare, ShoppingCart, PlusCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import FaceSearchModal from './FaceSearchModal';
import { useCart } from '@/features/cart/context/CartContext';
import { toast } from 'sonner';
import { SelectionContext } from '../context/SelectionContext';
import PhotoCard from '@/components/shared/cards/PhotoCard';


export default function CollectionSearchClient({ allPhotos = [], collectionId, children }) {
    const [query, setQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState(new Set());
    const { addToCart } = useCart();

    const toggleSelection = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleBulkAddToCart = () => {
        let count = 0;
        allPhotos.forEach(photo => {
            if (selectedIds.has(photo.id)) {
                 addToCart({
                    fotoId: photo.id,
                    colecaoId: collectionId,
                    titulo: photo.numeroSequencial 
                        ? `Foto #${photo.numeroSequencial.toString().padStart(3, '0')}` 
                        : `Foto #${photo.id.replace(/\D/g, '').slice(-3)}`,
                    preco: photo.colecao?.precoFoto || photo.preco || 0,
                    precoBase: photo.colecao?.precoFoto || photo.preco || 0,
                    descontos: photo.colecao?.descontos || [],
                    licenca: 'Uso Padrão',
                    previewUrl: photo.previewUrl,
                });
                count++;
            }
        });

        toast.success(`${count} fotos adicionadas ao carrinho!`, {
            action: {
                label: "Ver Carrinho",
                onClick: () => window.location.href = "/carrinho"
            }
        });
        setSelectedIds(new Set());
    };

    // ... (filteredPhotos memo remains same as it already searches by number)

    // Adapter for shared PhotoCard props
    const handleSelect = (id) => toggleSelection(id);
    const handleAddToCart = (photo) => {
        addToCart({
            fotoId: photo.id,
            colecaoId: collectionId,
            titulo: photo.numeroSequencial 
                ? `Foto #${photo.numeroSequencial.toString().padStart(3, '0')}` 
                : `Foto #${photo.id.replace(/\D/g, '').slice(-3)}`,
            preco: photo.colecao?.precoFoto || 0,
            licenca: 'Uso Padrão',
            previewUrl: photo.previewUrl,
        });
        toast.success("Foto adicionada ao carrinho");
    };

    return (
        <SelectionContext.Provider value={{ selectedIds, toggleSelection, isSelectionMode: selectedIds.size > 0 }}>
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
                                onClick={() => setQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
                            >
                                <X className="h-4 w-4 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                    <FaceSearchModal collectionId={collectionId} />
                </div>

                {query ? (
                    <div className="animate-fade-in space-y-4">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <p>Resultados para "{query}": <span className="text-foreground font-bold">{filteredPhotos.length}</span> fotos encontradas</p>
                            <Button variant="ghost" size="sm" onClick={() => setQuery('')}>Limpar busca</Button>
                        </div>

                        {filteredPhotos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filteredPhotos.map((photo, index) => (
                                    <PhotoCard 
                                        key={photo.id} 
                                        photo={photo} 
                                        priority={index < 4}
                                        isSelected={selectedIds.has(photo.id)}
                                        onSelect={handleSelect}
                                        onAddToCart={handleAddToCart}
                                        contextList={filteredPhotos}
                                    />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-20 border-2 border-dashed rounded-lg bg-muted/10">
                                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                <h3 className="text-xl font-medium mb-2">Nenhuma foto encontrada</h3>
                                <p className="text-muted-foreground">
                                    Não encontramos fotos com o termo "{query}". <br/>
                                    Tente buscar apenas pelo número (ex: "123").
                                </p>
                                <Button variant="link" onClick={() => setQuery('')} className="mt-4">
                                    Voltar para a galeria
                                </Button>
                             </div>
                        )}
                    </div>
                ) : (
                    children
                )}

                {/* Floating Action Bar - Use Portal to escape any parent transforms */}
                {typeof document !== 'undefined' && createPortal(
                    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${selectedIds.size > 0 ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
                        <div className="bg-zinc-900/95 text-white pl-6 pr-2 py-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex items-center gap-4 min-w-[320px] justify-between border border-white/10 ring-1 ring-white/10 backdrop-blur-md">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center justify-center bg-white/20 h-8 w-8 rounded-full text-sm font-bold shadow-inner">
                                    {selectedIds.size}
                                </span>
                                <span className="font-medium text-sm tracking-wide">fotos selecionadas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button 
                                    onClick={() => setSelectedIds(new Set())}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-9 px-3 hover:bg-white/10 hover:text-white rounded-full text-xs uppercase tracking-wide opacity-70 hover:opacity-100 transition-all font-semibold"
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleBulkAddToCart}
                                    size="sm" 
                                    className="h-10 px-6 bg-white text-black hover:bg-gray-200 rounded-full font-bold shadow-lg hover:scale-105 transition-all"
                                >
                                    <ShoppingCart className="h-4 w-4 mr-2" />
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



