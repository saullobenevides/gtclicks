"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  const label =
    photo.numeroSequencial || photo.sequentialId
      ? `IMG_${(photo.numeroSequencial || photo.sequentialId)
          .toString()
          .padStart(4, "0")}`
      : "Processando";

  return (
    <Card
      className={`flex flex-col relative rounded-radius-lg border-border-subtle overflow-hidden ${
        isCover
          ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-10 shadow-lg shadow-primary/20"
          : "bg-surface-card"
      }`}
    >
      <div className="aspect-square relative group">
        {isCover && (
          <div className="absolute top-2 left-2 z-20 px-2 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded">
            Capa
          </div>
        )}
        {photo.previewUrl ? (
          <Image
            src={photo.previewUrl}
            alt={label}
            fill
            sizes="(max-width: 768px) 50vw, 200px"
            className="object-cover"
            loading="lazy"
            quality={80}
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            {uploadState.photoTempId === photo.tempId ? (
              <Loader2 className="animate-spin text-primary" aria-hidden />
            ) : (
              <UploadCloud className="text-muted-foreground/20" aria-hidden />
            )}
          </div>
        )}

        <div className="absolute top-0 right-0 flex flex-col md:flex-row opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-200 gap-0 touch-manipulation">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={isCover}
            className={`h-12 min-h-[48px] w-12 min-w-[48px] flex items-center justify-center text-white border-0 rounded-none transition-transform touch-manipulation ${
              isCover
                ? "opacity-100 cursor-not-allowed bg-black/60"
                : "bg-black/60 hover:bg-black/80 hover:text-yellow-400 active:scale-90"
            }`}
            onClick={() => !isCover && onSetCover(photo)}
            aria-label={isCover ? "Já é a capa" : "Definir como capa"}
            aria-disabled={isCover}
          >
            <Star
              className={`h-5 w-5 shrink-0 ${
                isCover ? "fill-yellow-400 text-yellow-400" : ""
              }`}
              aria-hidden
            />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-12 min-h-[48px] w-12 min-w-[48px] flex items-center justify-center text-white bg-black/60 hover:bg-black/80 hover:text-red-500 border-0 rounded-none active:scale-90 transition-transform touch-manipulation"
            onClick={() => onRemove(photo)}
            aria-label="Remover foto"
          >
            <Trash2 className="h-5 w-5 shrink-0" aria-hidden />
          </Button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm p-3 border-t border-white/5">
          <p className="text-[10px] text-muted-foreground truncate text-center font-mono tracking-tight uppercase">
            {label}
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
