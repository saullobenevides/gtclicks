"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Search,
  X,
  Loader2,
  Sparkles,
  User,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { searchPhotosBySelfie } from "@/actions/rekognition";
import PhotoCard from "@/components/shared/cards/PhotoCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function SelfieSearch() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 5MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResults(null);
      setError(null);
    }
  };

  const handleSearch = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("selfie", file);

    try {
      const res = await searchPhotosBySelfie(formData);
      if (res.error) {
        setError(res.error);
        toast.error(res.error);
      } else {
        setResults(res.data);
        if (res.data.length === 0) {
          toast.info("Nenhuma foto encontrada");
        } else {
          toast.success(`${res.data.length} fotos encontradas!`);
        }
      }
    } catch (err) {
      setError("Erro ao realizar busca facial.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4 py-8">
      {/* Search Section */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
          <Sparkles className="h-3 w-3" />
          Tecnologia IA
        </div>
        <h2 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight">
          Encontre-se em segundos
        </h2>
        <p className="text-zinc-400 max-w-xl mx-auto">
          Faça o upload de uma selfie e nossa IA encontrará todas as fotos onde
          você aparece em nossas coleções.
        </p>

        <Card className="max-w-md mx-auto bg-zinc-900/50 border-white/10 backdrop-blur-xl overflow-hidden mt-8">
          <CardContent className="p-6">
            {!preview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-primary/50 hover:bg-white/5 transition-all cursor-pointer group"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Camera className="h-8 w-8 text-zinc-400 group-hover:text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-white font-medium">
                      Tire uma selfie ou escolha um arquivo
                    </p>
                    <p className="text-zinc-500 text-xs text-center">
                      SVG, PNG, JPG ou GIF (max. 5MB)
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative aspect-square max-w-[240px] mx-auto rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl">
                  <div className="relative w-full h-full">
                    <Image
                      src={preview}
                      alt="Selfie preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <button
                    onClick={clearFile}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black backdrop-blur-md rounded-full text-white transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-primary animate-spin" />
                        <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                          Analisando...
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !file}
                    className="w-full h-12 rounded-full font-bold text-lg bg-primary hover:bg-primary/90"
                  >
                    {loading ? "Processando..." : "Buscar minhas fotos"}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={clearFile}
                    className="text-zinc-400 hover:text-white"
                  >
                    Trocar foto
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Results Section */}
      {results && (
        <section className="space-y-6 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Resultados da busca ({results.length})
            </h3>
            {results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-white/10 text-zinc-400 hover:text-white"
              >
                Ver em grade cheia
              </Button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {results.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  variant="centered-hover"
                  contextList={results}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 rounded-3xl p-12 text-center space-y-4 border border-white/10">
              <div className="h-20 w-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <User className="h-10 w-10 text-zinc-600" />
              </div>
              <div className="space-y-1">
                <p className="text-white font-bold text-lg">
                  Poxa, não encontramos nada.
                </p>
                <p className="text-zinc-400 max-w-sm mx-auto">
                  Tente fazer o upload de uma foto diferente ou com melhor
                  iluminação.
                </p>
              </div>
              <Button
                variant="link"
                onClick={clearFile}
                className="text-primary"
              >
                Tentar novamente
              </Button>
            </div>
          )}
        </section>
      )}

      {error && (
        <div className="max-w-md mx-auto animate-in bounce-in">
          <Card className="bg-red-500/10 border-red-500/20">
            <CardContent className="p-4 flex items-center gap-3 text-red-500">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
