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
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
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
        />

        <div className="border-t border-white/10 pt-4 md:pt-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h3 className="text-lg font-black uppercase tracking-tighter text-white">
                FOTOS NA PASTA ({currentPhotos.length})
              </h3>
              <div className="flex gap-2 w-full sm:w-auto">
                {currentPhotos.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onDeleteAllInFolder}
                    className="flex-1 sm:flex-none text-red-500 hover:text-red-400 hover:bg-red-500/5 border-red-500/20 rounded-none h-10 uppercase tracking-widest text-[10px]"
                  >
                    <Trash2 className="mr-2 h-3 w-3" /> Limpar Pasta
                  </Button>
                )}
              </div>
            </div>

            {/* Bulk Upload Area - Radical Polish */}
            <div className="border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-none p-4 md:p-6 transition-all duration-300 text-center cursor-pointer relative h-32 sm:h-40 flex flex-col items-center justify-center w-full max-w-full min-w-0 group overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={onBulkUpload}
              />
              <div className="flex flex-col items-center gap-2 w-full max-w-full overflow-hidden relative z-0">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-none bg-primary flex items-center justify-center mb-1 md:mb-2 group-hover:scale-110 transition-transform">
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
            <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
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
                        photo.s3Key.split("/").pop(),
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
