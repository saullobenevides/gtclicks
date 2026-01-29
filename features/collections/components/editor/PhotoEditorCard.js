"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
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
      className={`flex flex-col relative rounded-none border-white/10 overflow-hidden ${isCover ? "ring-2 ring-primary z-10" : "bg-black/40"}`}
    >
      <div className="aspect-square relative group">
        {photo.previewUrl ? (
          <Image
            src={photo.previewUrl}
            alt="Preview"
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            {uploadState.photoTempId === photo.tempId ? (
              <Loader2 className="animate-spin text-primary" />
            ) : (
              <UploadCloud className="text-muted-foreground/20" />
            )}
          </div>
        )}

        {/* Mobile-First Extreme Touch Targets (min-48px) */}
        <div className="absolute top-0 right-0 flex flex-col md:flex-row opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button
            type="button"
            disabled={isCover}
            className={`h-12 w-12 flex items-center justify-center text-white bg-black/60 transition-transform ${isCover ? "opacity-100 cursor-default" : "hover:bg-black/80 hover:text-yellow-400 active:scale-90"}`}
            onClick={() => !isCover && onSetCover(photo)}
            title={isCover ? "Já é a capa" : "Definir como Capa"}
          >
            <Star
              className={`h-5 w-5 ${isCover ? "fill-yellow-400 text-yellow-400" : ""}`}
            />
          </button>
          <button
            type="button"
            className="h-12 w-12 flex items-center justify-center text-white bg-black/60 hover:bg-black/80 hover:text-red-500 active:scale-90 transition-transform"
            onClick={() => onRemove(photo)}
            title="Remover"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-white/5">
          <p className="text-[10px] text-muted-foreground truncate text-center font-mono tracking-tight uppercase">
            {photo.numeroSequencial || photo.sequentialId
              ? `IMG_${(photo.numeroSequencial || photo.sequentialId).toString().padStart(4, "0")}`
              : "PROCESSANDO..."}
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
