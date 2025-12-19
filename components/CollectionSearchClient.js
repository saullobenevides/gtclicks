'use client';

import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import PhotoCard from '@/components/PhotoCard';

export default function CollectionSearchClient({ allPhotos = [], children }) {
    const [query, setQuery] = useState('');

    const filteredPhotos = useMemo(() => {
        if (!query.trim()) return [];
        const lowerQuery = query.toLowerCase().trim();
        
        return allPhotos.filter(photo => {
            const titleMatch = (photo.title || photo.titulo) && (photo.title || photo.titulo).toLowerCase().includes(lowerQuery);
            // Check tags (assuming tags is array or string based on previous debugging)
            // But from schema it is String[], but let's be safe
            let tagsMatch = false;
            if (Array.isArray(photo.tags)) {
                tagsMatch = photo.tags.some(t => t.toLowerCase().includes(lowerQuery));
            } else if (typeof photo.tags === 'string') {
                tagsMatch = photo.tags.toLowerCase().includes(lowerQuery);
            }

            return titleMatch || tagsMatch;
        });
    }, [allPhotos, query]);

    return (
        <div className="space-y-8">
            <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Buscar pelo número de peito ou nome..." 
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

            {query ? (
                <div className="animate-fade-in space-y-4">
                    <div className="flex items-center justify-between text-muted-foreground">
                        <p>Resultados para "{query}": <span className="text-foreground font-bold">{filteredPhotos.length}</span> fotos encontradas</p>
                        <Button variant="ghost" size="sm" onClick={() => setQuery('')}>Limpar busca</Button>
                    </div>

                    {filteredPhotos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredPhotos.map((photo, index) => (
                                <PhotoCard key={photo.id} photo={photo} priority={index < 4} />
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
        </div>
    );
}
