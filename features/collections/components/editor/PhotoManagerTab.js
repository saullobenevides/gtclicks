'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, Trash2, Sparkles, Loader2 } from 'lucide-react';
import FolderManager from '../FolderManager';
import Breadcrumbs from '@/components/shared/Breadcrumbs';
import PhotoEditorCard from './PhotoEditorCard';

export default function PhotoManagerTab({ 
  collectionId,
  currentFolder,
  folderPath,
  currentPhotos,
  collectionData,
  uploadState,
  analyzingId,
  analyzingCollection,
  onNavigate,
  onAnalyzeCollection,
  onDeleteAllInFolder,
  onBulkUpload,
  onSetCover,
  onRemovePhoto,
  onUpdatePhoto,
  onAnalyzePhoto
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Gerenciamento de Fotos</CardTitle>
          <CardDescription>Organize em pastas e faça upload.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Pasta atual:</span>
            <Breadcrumbs path={folderPath} onNavigate={onNavigate} />
          </div>
        </div>

        {/* Folder Manager */}
        <FolderManager 
          collectionId={collectionId} 
          currentFolder={currentFolder} 
          onNavigate={onNavigate}
        />

        <div className="border-t pt-6">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Fotos nesta pasta ({currentPhotos.length})</h3>
              <div className="flex gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="text-yellow-500 hover:text-yellow-600 hover:bg-yellow-500/10 border-yellow-500/20 gap-2"
                  onClick={onAnalyzeCollection}
                  disabled={analyzingCollection}
                >
                  {analyzingCollection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                  IA na Capa
                </Button>
                {currentPhotos.length > 0 && (
                  <Button variant="outline" size="sm" onClick={onDeleteAllInFolder} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
                    <Trash2 className="mr-2 h-3 w-3" /> Limpar Pasta
                  </Button>
                )}
              </div>
            </div>
            
            {/* Bulk Upload Area */}
            <div className="border-2 border-dashed border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl p-8 transition-colors text-center cursor-pointer relative h-32 flex flex-col items-center justify-center">
              <input 
                type="file" 
                multiple 
                accept="image/jpeg,image/png,image/webp"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                onChange={onBulkUpload}
              />
              <div className="flex flex-col items-center gap-1">
                <UploadCloud className="h-8 w-8 text-primary mb-1" />
                <h4 className="font-bold text-lg">Solte suas fotos aqui</h4>
              </div>
            </div>
          </div>

          {/* Photos Grid */}
          {currentPhotos.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed rounded-lg text-muted-foreground">
              <p>Nenhuma foto nesta pasta.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {currentPhotos.map((photo) => (
                <PhotoEditorCard 
                  key={photo.tempId}
                  photo={photo}
                  isCover={collectionData.capaUrl === photo.previewUrl}
                  uploadState={uploadState}
                  analyzingId={analyzingId}
                  onSetCover={onSetCover}
                  onRemove={onRemovePhoto}
                  onUpdate={onUpdatePhoto}
                  onAnalyze={onAnalyzePhoto}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
