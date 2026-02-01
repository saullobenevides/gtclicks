"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, Trash2 } from "lucide-react";
import FolderManager from "../FolderManager";
import Breadcrumbs from "@/components/shared/Breadcrumbs";
import PhotoEditorCard from "./PhotoEditorCard";

export default function PhotoManagerTab({
  collectionId,
  currentFolder,
  folderPath,
  currentPhotos,
  collectionData,
  uploadState,
  onNavigate,
  onDeleteAllInFolder,
  onBulkUpload,
  onSetCover,
  onRemovePhoto,
  onUpdatePhoto,
  onEnsureCollection,
}) {
  return (
    <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 md:px-6 py-4 pl-4 md:py-6">
        <div>
          <CardTitle>Gerenciamento de Fotos</CardTitle>
          <CardDescription>Organize em pastas e faça upload.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 overflow-hidden bg-background/95 backdrop-blur-md md:bg-transparent w-full min-w-0 transition-all duration-200">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full min-w-0 pr-4 mask-linear-fade">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap shrink-0">
              PASTA:
            </span>
            <Breadcrumbs path={folderPath} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Folder Manager */}
        <FolderManager
          collectionId={collectionId}
          currentFolder={currentFolder}
          onNavigate={onNavigate}
          onEnsureCollection={onEnsureCollection}
        />

        <div className="border-t border-white/10 pt-4 md:pt-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                FOTOS NA PASTA ({currentPhotos.length})
              </h3>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                {currentPhotos.length > 0 && onDeleteAllInFolder && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteAllInFolder}
                    className="flex-1 sm:flex-none min-h-[44px] text-red-500 hover:text-red-400 hover:bg-red-500/5 border-2 border-red-500/20 rounded-radius-lg h-11 uppercase tracking-widest text-[10px] touch-manipulation"
                    aria-label="Limpar todas as fotos desta pasta"
                  >
                    <Trash2 className="mr-2 h-3 w-3 shrink-0" aria-hidden />
                    Limpar Pasta
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Upload Area */}
            <div className="border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-radius-lg p-4 md:p-6 transition-all duration-300 text-center cursor-pointer relative min-h-[140px] sm:min-h-[160px] flex flex-col items-center justify-center w-full max-w-full min-w-0 group overflow-hidden touch-manipulation active:scale-[0.99]">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 min-h-[140px]"
                onChange={onBulkUpload}
                aria-label="Enviar fotos (JPEG, PNG ou WEBP)"
              />
              <div className="flex flex-col items-center gap-2 w-full max-w-full overflow-hidden relative z-0">
                <div className="h-10 w-10 md:h-11 md:w-11 rounded-radius-lg bg-primary flex items-center justify-center mb-1 md:mb-2 group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-5 w-5 md:h-6 md:w-6 text-white" />
                </div>
                <h4 className="font-black text-xs sm:text-lg uppercase tracking-widest text-white">
                  TOQUE PARA ENVIAR FOTOS
                </h4>
                <p className="text-[10px] text-muted-foreground uppercase opacity-60">
                  JPEG, PNG ou WEBP
                </p>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          {currentPhotos.length === 0 ? (
            <div
              role="status"
              className="text-center p-8 md:p-10 border-2 border-dashed border-white/10 rounded-radius-lg bg-black/20 text-muted-foreground"
            >
              <p>Nenhuma foto nesta pasta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {currentPhotos.map((photo) => (
                <PhotoEditorCard
                  key={photo.tempId}
                  photo={photo}
                  isCover={
                    collectionData.capaUrl === photo.previewUrl ||
                    (collectionData.capaUrl &&
                      photo.s3Key &&
                      collectionData.capaUrl.includes(
                        photo.s3Key.split("/").pop()
                      ))
                  }
                  uploadState={uploadState}
                  onSetCover={onSetCover}
                  onRemove={onRemovePhoto}
                  onUpdate={onUpdatePhoto}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
