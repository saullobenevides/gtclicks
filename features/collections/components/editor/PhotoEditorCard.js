"use client";

import { Card } from "@/components/ui/card";
import { Star, Trash2, Loader2, UploadCloud } from "lucide-react";

import { memo } from "react";

function PhotoEditorCard({
  photo,
  isCover,
  uploadState,
  onSetCover,
  onRemove,
}) {
  return (
    <Card
      className={`flex flex-col relative ${isCover ? "ring-2 ring-primary" : ""}`}
    >
      <div className="aspect-square relative group">
        {photo.previewUrl ? (
          <img
            src={photo.previewUrl}
            alt="Preview"
            className="absolute inset-0 w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            {uploadState.photoTempId === photo.tempId ? (
              <Loader2 className="animate-spin" />
            ) : (
              <UploadCloud className="text-muted-foreground" />
            )}
          </div>
        )}
        <div className="absolute top-1 right-1 flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
          <button
            type="button"
            className="p-1.5 text-white hover:text-yellow-400"
            onClick={() => onSetCover(photo)}
            title="Definir como Capa"
          >
            <Star
              className={`h-4 w-4 ${isCover ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
          </button>
          <button
            type="button"
            className="p-1.5 text-white hover:text-red-400"
            onClick={() => onRemove(photo)}
            title="Remover"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
          <p className="text-xs text-white truncate text-center font-mono">
            {photo.numeroSequencial
              ? `Foto #${photo.numeroSequencial}`
              : "Pendente..."}
          </p>
        </div>
      </div>
    </Card>
  );
}

export default memo(PhotoEditorCard, (prev, next) => {
  return (
    prev.photo.tempId === next.photo.tempId &&
    prev.photo.previewUrl === next.photo.previewUrl &&
    prev.photo.numeroSequencial === next.photo.numeroSequencial &&
    prev.isCover === next.isCover &&
    prev.uploadState.photoTempId === next.uploadState.photoTempId
  );
});
