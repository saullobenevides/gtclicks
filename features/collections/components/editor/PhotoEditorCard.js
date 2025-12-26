'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Star, Trash2, Sparkles, Loader2, UploadCloud } from 'lucide-react';

export default function PhotoEditorCard({ 
  photo, 
  isCover, 
  uploadState, 
  analyzingId, 
  onSetCover, 
  onRemove, 
  onUpdate, 
  onAnalyze 
}) {
  return (
    <Card className={`flex flex-col relative ${isCover ? 'ring-2 ring-primary' : ''}`}>
      <div className="aspect-square relative group">
        {photo.previewUrl ? (
          <img src={photo.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-t-lg" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {uploadState.photoTempId === photo.tempId ? <Loader2 className="animate-spin" /> : <UploadCloud className="text-muted-foreground" />}
          </div>
        )}
        <div className="absolute top-1 right-1 flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
          <button type="button" className="p-1.5 text-white hover:text-yellow-400" onClick={() => onSetCover(photo)}>
            <Star className={`h-4 w-4 ${isCover ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          </button>
          <button type="button" className="p-1.5 text-white hover:text-red-400" onClick={() => onRemove(photo)}>
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
          <Input 
            className="h-6 text-xs bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-white/50" 
            placeholder="Título..." 
            value={photo.titulo} 
            onChange={(e) => onUpdate(photo, 'titulo', e.target.value)} 
          />
        </div>
      </div>
      <div className="p-2 gap-1 flex flex-col">
        <div className="flex items-center gap-1">
          <Input className="h-6 text-xs" placeholder="Tags..." value={Array.isArray(photo.tags) ? photo.tags.join(', ') : photo.tags} onChange={(e) => onUpdate(photo, 'tags', e.target.value)} />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6 text-yellow-500"
            onClick={() => onAnalyze(photo)}
            disabled={analyzingId === photo.tempId}
          >
            <Sparkles className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
