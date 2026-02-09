"use client";

import { createContext, useContext, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import PhotoModalContent from "@/components/photo/PhotoModalContent";

interface Photo {
  id: string;
  [key: string]: unknown;
}

interface PhotoModalContextValue {
  openPhoto: (photo: Photo | null, list?: Photo[]) => void;
  closePhoto: () => void;
}

const PhotoModalContext = createContext<PhotoModalContextValue>({
  openPhoto: () => {},
  closePhoto: () => {},
});

export const usePhotoModal = () => useContext(PhotoModalContext);

interface PhotoModalProviderProps {
  children: React.ReactNode;
}

export function PhotoModalProvider({ children }: PhotoModalProviderProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoList, setPhotoList] = useState<Photo[]>([]);

  const openPhoto = useCallback((photo: Photo | null, list: Photo[] = []) => {
    setSelectedPhoto(photo);
    if (Array.isArray(list) && list.length > 0) {
      setPhotoList(list);
    } else {
      setPhotoList([]);
    }
  }, []);

  const closePhoto = useCallback(() => {
    setSelectedPhoto(null);
    setPhotoList([]);
  }, []);

  const handleNext = useCallback(() => {
    if (!selectedPhoto || photoList.length === 0) return;
    const currentIndex = photoList.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex !== -1 && currentIndex < photoList.length - 1) {
      setSelectedPhoto(photoList[currentIndex + 1]);
    }
  }, [selectedPhoto, photoList]);

  const handlePrev = useCallback(() => {
    if (!selectedPhoto || photoList.length === 0) return;
    const currentIndex = photoList.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex > 0) {
      setSelectedPhoto(photoList[currentIndex - 1]);
    }
  }, [selectedPhoto, photoList]);

  const hasNext =
    selectedPhoto &&
    photoList.length > 0 &&
    photoList.findIndex((p) => p.id === selectedPhoto.id) <
      photoList.length - 1;
  const hasPrev =
    selectedPhoto &&
    photoList.length > 0 &&
    photoList.findIndex((p) => p.id === selectedPhoto.id) > 0;

  return (
    <PhotoModalContext.Provider value={{ openPhoto, closePhoto }}>
      {children}

      <Dialog
        open={!!selectedPhoto}
        onOpenChange={(open) => !open && closePhoto()}
      >
        <DialogOverlay className="bg-black/90 backdrop-blur-md z-[100]" />
        <DialogContent
          className="w-screen h-[100dvh] max-w-none m-0 p-0 border-none bg-black z-[101] focus:outline-none [&>button]:hidden rounded-none shadow-none"
          aria-describedby={undefined}
        >
          <VisuallyHidden>
            <DialogTitle>Detalhes da Foto</DialogTitle>
          </VisuallyHidden>

          {selectedPhoto && (
            <PhotoModalContent
              photo={selectedPhoto}
              onClose={closePhoto}
              onNext={hasNext ? handleNext : null}
              onPrev={hasPrev ? handlePrev : null}
            />
          )}
        </DialogContent>
      </Dialog>
    </PhotoModalContext.Provider>
  );
}
