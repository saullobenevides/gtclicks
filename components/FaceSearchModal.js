"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Loader2, ScanFace, RefreshCw, X, ShieldCheck } from "lucide-react";
import PhotoCard from "@/components/PhotoCard";
import { toast } from "sonner";
import Webcam from "react-webcam";

export default function FaceSearchModal({ collectionId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  const webcamRef = useRef(null);

  const captureAndSearch = useCallback(() => {
    setScanning(true);
    
    // Slight delay to simulate scanning and allow user to position
    setTimeout(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) {
            setScanning(false);
            return;
        }

        try {
            // Convert base64 to blob
            const res = await fetch(imageSrc);
            const blob = await res.blob();
            const file = new File([blob], "faceId_scan.jpg", { type: "image/jpeg" });

            const formData = new FormData();
            formData.append("file", file);
            if (collectionId) {
                formData.append("collectionId", collectionId);
            }

            setIsSearching(true);
            const response = await fetch("/api/photos/search/face", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Erro na busca");
            }

            const data = await response.json();
            setResults(data.photos || []);
            
            if (data.photos && data.photos.length === 0) {
                toast.info("Nenhuma foto identificada.");
            } else {
                toast.success(`${data.photos.length} fotos encontradas!`);
            }
        } catch (error) {
            console.error(error);
            toast.error("Erro ao processar Face ID.");
        } finally {
            setIsSearching(false);
            setScanning(false);
        }
    }, 1500); // 1.5s scanning effect
  }, [webcamRef]);

  const resetSearch = () => {
    setResults(null);
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
        setResults(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="h-12 gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-md transition-all hover:scale-105">
          <ScanFace className="h-4 w-4" />
          Face ID
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-black/95 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            Scanner Facial
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Posicione seu rosto na moldura para identificar suas fotos.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 mt-4">
          {!results ? (
            <div className="flex flex-col items-center gap-6">
                <div className="relative w-full max-w-[400px] aspect-[3/4] rounded-3xl overflow-hidden bg-zinc-900 border-4 border-zinc-800 shadow-2xl">
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="w-full h-full object-cover mirror-mode"
                        style={{ transform: "scaleX(-1)" }} 
                    />
                    
                    {/* Face ID Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className={`
                            w-[280px] h-[380px] rounded-[50%] border-2
                            ${scanning ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.3)]' : 'border-white/30'}
                            transition-all duration-500
                        `}>
                            {/* Scanning Laser */}
                            {scanning && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-green-500/80 shadow-[0_0_20px_rgba(34,197,94,0.8)] animate-scan" />
                            )}
                        </div>
                    </div>

                    {/* Status Text Overlay */}
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        {scanning ? (
                            <span className="text-green-400 font-medium tracking-wider bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                                ESCANEANDO...
                            </span>
                        ) : isSearching ? (
                            <span className="text-indigo-400 font-medium tracking-wider bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                                PROCESSANDO...
                            </span>
                        ) : (
                            <span className="text-white/70 text-sm bg-black/50 px-4 py-1 rounded-full backdrop-blur-sm">
                                Olhe para a câmera
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button 
                        onClick={captureAndSearch} 
                        size="lg" 
                        disabled={scanning || isSearching}
                        className={`
                            rounded-full h-16 w-16 p-0 border-4 
                            ${scanning ? 'border-green-500 bg-green-500/20' : 'border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] bg-white'}
                            hover:scale-105 transition-all
                        `}
                    >
                       {scanning || isSearching ? (
                           <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
                       ) : (
                           <ScanFace className="h-8 w-8 text-black" />
                       )}
                    </Button>
                </div>
                <p className="text-xs text-zinc-500">
                    Seus dados biométricos são usados apenas para esta busca.
                </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">
                  {results.length} fotos encontradas
                </h3>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800" onClick={resetSearch}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Escanear Novamente
                </Button>
              </div>
              
              {results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((photo, index) => (
                      <PhotoCard key={photo.id} photo={photo} />
                  ))}
                </div>
              ) : (
                 <div className="text-center py-12">
                    <p className="text-zinc-500">Nenhuma foto encontrada para este perfil.</p>
                    <Button variant="link" onClick={resetSearch} className="mt-4 text-indigo-400">
                        Tentar novamente
                    </Button>
                 </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
      
      <style jsx global>{`
        @keyframes scan {
            0% { top: 10%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 90%; opacity: 0; }
        }
        .animate-scan {
            animation: scan 1.5s ease-in-out infinite;
        }
        .mirror-mode {
            transform: scaleX(-1);
        }
      `}</style>
    </Dialog>
  );
}
