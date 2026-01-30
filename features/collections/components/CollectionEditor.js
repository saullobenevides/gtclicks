"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import EXIF from "exif-js";
import { toast } from "sonner";

import EditorHeader from "./editor/EditorHeader";
import BasicDetailsTab from "./editor/BasicDetailsTab";
import PhotoManagerTab from "./editor/PhotoManagerTab";
import PricingTab from "./editor/PricingTab";
import PublishTab from "./editor/PublishTab";
import EditorBottomBar from "./editor/EditorBottomBar";

import { extractMetadata } from "../utils/metadata";
import { usePhotoUpload } from "../hooks/usePhotoUpload";
import { updateCollection, setCollectionCover } from "@/actions/collections";

const blankPhoto = () => ({
  id: null,
  tempId: Math.random().toString(36).substr(2, 9),
  titulo: "",
  descricao: "",
  previewUrl: "",
  s3Key: "",
  previewS3Key: "",
  tags: "",
  orientacao: "HORIZONTAL",
});

export default function CollectionEditor({ collection: initialData }) {
  const router = useRouter();
  const initialCollection = initialData || {};

  const [collectionData, setCollectionData] = useState({
    nome: initialCollection.nome || "",
    slug: initialCollection.slug || "",
    descricao: initialCollection.descricao || "",
    categoria: initialCollection.categoria || "",
    status: initialCollection.status || "RASCUNHO",
    precoFoto: initialCollection.precoFoto || 0,
    capaUrl: initialCollection.capaUrl || "",
    createdAt: initialCollection.createdAt
      ? new Date(initialCollection.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    cidade: initialCollection.cidade || "",
    estado: initialCollection.estado || "",
    local: initialCollection.local || "",
    dataInicio: initialCollection.dataInicio
      ? new Date(initialCollection.dataInicio).toISOString().split("T")[0]
      : initialCollection.createdAt
        ? new Date(initialCollection.createdAt).toISOString().split("T")[0]
        : "",
    dataFim: initialCollection.dataFim
      ? new Date(initialCollection.dataFim).toISOString().split("T")[0]
      : "",
    descontos: initialCollection.descontos || [],
    faceRecognitionEnabled: initialCollection.faceRecognitionEnabled || false,
  });

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, nome: "Raiz" }]);

  const [allPhotos, setAllPhotos] = useState(
    (initialCollection.fotos || []).map((p) => ({
      ...p,
      tempId: p.id || Math.random().toString(36).substr(2, 9),
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false); // Track changes

  const { uploadState, handleFileSelect } = usePhotoUpload(
    initialCollection.id,
    currentFolder,
  );

  const currentPhotos = useMemo(() => {
    return allPhotos.filter((p) => {
      if (currentFolder === null) {
        return !p.folderId;
      }
      return p.folderId === currentFolder.id;
    });
  }, [allPhotos, currentFolder]);

  // Warning check for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-update slug when name changes
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  const handleCollectionDataChange = (field, value) => {
    setCollectionData((prev) => {
      const updates = { [field]: value };
      if (field === "nome" && !initialCollection.id) {
        updates.slug = slugify(value);
      }
      return { ...prev, ...updates };
    });
    setIsDirty(true);
  };

  const handleSetCover = useCallback(
    async (photo) => {
      if (!photo.id) {
        toast.error("Aguarde o processamento da foto para definir como capa.");
        return;
      }

      const toastId = toast.loading("Gerando capa original...");
      try {
        const result = await setCollectionCover(initialCollection.id, photo.id);
        if (result.error) throw new Error(result.error);

        setCollectionData((prev) => ({ ...prev, capaUrl: result.coverUrl }));
        toast.dismiss(toastId);
        toast.success("Capa definida com sucesso!");
        setIsDirty(true);
      } catch (error) {
        console.error(error);
        toast.dismiss(toastId);
        toast.error(error.message || "Erro ao definir capa");
      }
    },
    [initialCollection.id],
  );

  const handleNavigate = (folder) => {
    if (folder.id === null) {
      setCurrentFolder(null);
      setFolderPath([{ id: null, nome: "Raiz" }]);
    } else {
      const index = folderPath.findIndex((f) => f.id === folder.id);
      if (index !== -1) {
        setFolderPath(folderPath.slice(0, index + 1));
      } else {
        setFolderPath([...folderPath, { id: folder.id, nome: folder.nome }]);
      }
      setCurrentFolder(folder);
    }
  };

  const removePhoto = useCallback(
    (photoToRemove) => {
      if (photoToRemove.id) {
        setDeletedPhotoIds((prev) => [...prev, photoToRemove.id]);
      }
      setAllPhotos((prev) =>
        prev.filter((p) => p.tempId !== photoToRemove.tempId),
      );
      if (collectionData.capaUrl === photoToRemove.previewUrl) {
        setCollectionData((prev) => ({ ...prev, capaUrl: "" }));
      }
      toast.success("Foto removida.");
      setIsDirty(true);
    },
    [collectionData.capaUrl],
  );

  const updatePhoto = useCallback((photoToUpdate, field, value) => {
    setAllPhotos((prev) =>
      prev.map((p) =>
        p.tempId === photoToUpdate.tempId ? { ...p, [field]: value } : p,
      ),
    );
    setIsDirty(true);
  }, []);

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    toast.info(`Iniciando upload de ${files.length} fotos...`);

    const newPhotos = files.map((file) => ({
      ...blankPhoto(),
      titulo: file.name.split(".")[0],
      folderId: currentFolder?.id || null,
    }));

    setAllPhotos((prev) => [...prev, ...newPhotos]);

    let completed = 0;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoPlaceholder = newPhotos[i];

      try {
        const updatedPhoto = await handleFileSelect(
          photoPlaceholder,
          file,
          updatePhoto,
        );
        if (updatedPhoto) {
          setAllPhotos((prev) =>
            prev.map((p) =>
              p.tempId === photoPlaceholder.tempId ? updatedPhoto : p,
            ),
          );
        }
        completed++;
        if (completed % 5 === 0)
          toast.success(`${completed}/${files.length} enviados...`);
      } catch (err) {
        console.error(`Erro ao enviar ${file.name}`, err);
        toast.error(`Falha no envio de ${file.name}`);
      }
    }
    toast.success("Upload em massa concluído!");
  };

  const handleFolderUpload = async (e) => {
    // Currently reuses bulk upload logic.
    // In the future, we can use file.webkitRelativePath to create subfolders automatically.
    await handleBulkUpload(e);
  };

  const [analyzingId, setAnalyzingId] = useState(null);
  const [analyzingCollection, setAnalyzingCollection] = useState(false);

  const handleAnalyzeCollection = async () => {
    if (!collectionData.capaUrl) {
      toast.error("Defina uma capa para a coleção antes de usar a IA.");
      return;
    }

    setAnalyzingCollection(true);
    try {
      const aiRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: collectionData.capaUrl }),
      });

      if (!aiRes.ok) throw new Error("Falha na análise IA");

      const aiData = await aiRes.json();
      setCollectionData((prev) => ({
        ...prev,
        nome: aiData.title || prev.nome,
        descricao: aiData.description || prev.descricao,
      }));
      toast.success("Coleção preenchida com magia IA! ✨");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao analisar coleção.");
    } finally {
      setAnalyzingCollection(false);
    }
  };

  const handleAnalyzePhoto = async (photo) => {
    if (!photo.previewUrl) {
      toast.error("A foto precisa ter um preview para ser analisada.");
      return;
    }

    setAnalyzingId(photo.tempId);
    try {
      const aiRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: photo.previewUrl }),
      });

      if (!aiRes.ok) throw new Error("Falha na análise IA");

      const aiData = await aiRes.json();
      setAllPhotos((prev) =>
        prev.map((p) => {
          if (p.tempId !== photo.tempId) return p;
          return {
            ...p,
            titulo: aiData.title || p.titulo,
            descricao: aiData.description || p.descricao,
            tags: Array.isArray(aiData.tags)
              ? aiData.tags.join(", ")
              : aiData.tags || p.tags,
            corPredominante: aiData.primaryColor,
          };
        }),
      );
      toast.success("Foto preenchida com magia IA! ✨");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Erro ao processar imagem para IA.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleSaveChanges = async () => {
    // Validation: Check min price
    if (Number(collectionData.precoFoto) < 5) {
      toast.error("O preço mínimo por foto deve ser R$ 5,00");
      return;
    }

    // Validation: Check status and photos
    const validPhotosCount = allPhotos.filter(
      (p) => !deletedPhotoIds.includes(p.id) || !p.id,
    ).length; // Check strictly non-deleted photos

    // Simplification: Check if we have visible photos remaining
    const remainingPhotos = allPhotos.filter(
      (p) =>
        !deletedPhotoIds.includes(p.tempId) && !deletedPhotoIds.includes(p.id),
    );

    if (collectionData.status === "PUBLICADA" && remainingPhotos.length === 0) {
      toast.error("Não é possível publicar uma coleção sem fotos.");
      return;
    }

    setSubmitting(true);
    try {
      let finalCapaUrl = collectionData.capaUrl;
      const validPhotos = allPhotos.filter(
        (p) => p.previewUrl && !deletedPhotoIds.includes(p.id),
      );

      if (!finalCapaUrl && validPhotos.length > 0) {
        finalCapaUrl = validPhotos[validPhotos.length - 1].previewUrl;
        setCollectionData((prev) => ({ ...prev, capaUrl: finalCapaUrl }));
      }

      /* Refactored to use Server Action */
      // Ideally we should use FormData, but since updateCollection accepts (id, data), we pass object for now
      // or refactor action to expect FormData. I implemented action to accept 'data' as any (JSON object).
      // So we can check actions/collections.ts: export async function updateCollection(collectionId: string, data: any)

      let result;
      if (initialCollection.id) {
        // UPDATE EXISTING
        result = await updateCollection(initialCollection.id, {
          ...collectionData,
          capaUrl: finalCapaUrl,
        });
      } else {
        // CREATE NEW
        const formData = new FormData();
        // Append all fields to FormData for createCollection
        Object.entries(collectionData).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            if (key === "descontos") {
              formData.append(key, JSON.stringify(value));
            } else {
              formData.append(key, value);
            }
          }
        });
        // CreateCollection expects FormData
        const { createCollection } = await import("@/actions/collections");
        result = await createCollection(formData);
      }

      if (result.error) {
        throw new Error(result.error || "Erro ao salvar coleção.");
      }

      setIsDirty(false); // Reset dirty status on success

      if (!initialCollection.id && result.data?.id) {
        toast.success("Coleção criada com sucesso!");
        // Redirect to edit page
        router.push(`/dashboard/fotografo/colecoes/${result.data.id}/editar`);
        return;
      }

      const payload = {
        fotografoId: initialCollection.fotografoId,
        collectionId: initialCollection.id,
        fotos: allPhotos,
        deletedPhotoIds,
      };

      if (payload.fotos.length > 0 || payload.deletedPhotoIds.length > 0) {
        const batchRes = await fetch("/api/fotos/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!batchRes.ok) {
          const err = await batchRes.json();
          throw new Error(err.error || "Erro ao salvar fotos em massa.");
        }
      }

      toast.success("Alterações salvas com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("Save Error Detail:", error);
      if (error.message.includes("Nao foi possivel salvar as fotos")) {
        toast.error(
          "Erro ao salvar fotos. Verifique os logs do servidor para mais detalhes.",
        );
      } else {
        toast.error(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteCollection = async () => {
    setDeleting(true);
    try {
      await fetch(`/api/colecoes/${initialCollection.id}`, {
        method: "DELETE",
      });
      toast.success("Coleção excluída com sucesso.");
      router.push("/dashboard/fotografo/colecoes");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setDeleteOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAllInFolder = () => {
    if (
      !confirm(
        "Tem certeza? Isso removerá todas as fotos VISÍVEIS nesta pasta.",
      )
    )
      return;
    const idsToRemove = currentPhotos.map((p) => p.id).filter(Boolean);
    setDeletedPhotoIds((prev) => [...prev, ...idsToRemove]);
    const tempIdsToRemove = currentPhotos.map((p) => p.tempId);
    setAllPhotos((prev) =>
      prev.filter((p) => !tempIdsToRemove.includes(p.tempId)),
    );
    toast.success("Pasta limpa com sucesso.");
  };

  const addDiscount = () => {
    setCollectionData((prev) => ({
      ...prev,
      descontos: [
        ...(prev.descontos || []),
        { min: 5, price: parseFloat(prev.precoFoto || 0) },
      ],
    }));
  };

  const removeDiscount = (index) => {
    setCollectionData((prev) => ({
      ...prev,
      descontos: prev.descontos.filter((_, i) => i !== index),
    }));
  };

  const updateDiscount = (index, field, value) => {
    setCollectionData((prev) => ({
      ...prev,
      descontos: prev.descontos.map((d, i) =>
        i === index ? { ...d, [field]: parseFloat(value) } : d,
      ),
    }));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="block space-y-8 pb-32 md:pb-8 w-full px-0 sm:px-0">
        <div className="px-4 md:px-0 w-full min-w-0">
          <EditorHeader
            title={initialCollection.id ? "Editar Coleção" : "Nova Coleção"}
            submitting={submitting}
            onSave={handleSaveChanges}
            isDirty={isDirty}
          />
        </div>

        <Tabs defaultValue="detalhes" className="w-full">
          <div className="w-full max-w-[100vw] h-14 overflow-x-auto overflow-y-hidden sticky top-16 md:static z-40 bg-black/95 backdrop-blur-md md:bg-transparent border-b border-white/5 md:border-none mb-6 md:mb-8 no-scrollbar">
            <TabsList className="flex w-max md:w-full md:grid md:grid-cols-4 lg:w-[600px] h-14 p-0 bg-transparent rounded-none gap-0 select-none px-4 md:px-0">
              <TabsTrigger
                value="detalhes"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px]"
              >
                Detalhes
              </TabsTrigger>
              <TabsTrigger
                value="fotos"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px]"
                disabled={!initialCollection.id}
              >
                Fotos ({currentPhotos.length})
              </TabsTrigger>
              <TabsTrigger
                value="precos"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px]"
              >
                Preços
              </TabsTrigger>
              <TabsTrigger
                value="publicacao"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px]"
              >
                Publicação
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-4 md:px-0 w-full min-w-0">
            <TabsContent
              value="detalhes"
              className="mt-6 w-full overflow-x-hidden"
            >
              <BasicDetailsTab
                collectionData={collectionData}
                onDataChange={handleCollectionDataChange}
              />
            </TabsContent>
          </div>

          <div className="px-0 md:px-0">
            <TabsContent value="fotos" className="space-y-6">
              {!initialCollection.id ? (
                <div className="text-center py-12 border border-dashed rounded-lg bg-surface-subtle">
                  <p className="text-text-secondary mb-4">
                    Salvel a coleção para começar a adicionar fotos.
                  </p>
                  <Button
                    onClick={handleSaveChanges}
                    disabled={!isDirty || submitting}
                  >
                    Salvar Rascunho
                  </Button>
                </div>
              ) : (
                <PhotoManagerTab
                  collectionId={initialCollection.id}
                  currentFolder={currentFolder}
                  folderPath={folderPath}
                  currentPhotos={currentPhotos}
                  collectionData={collectionData}
                  uploadState={uploadState}
                  // analyzingId={analyzingId}
                  // analyzingCollection={analyzingCollection}
                  onNavigate={handleNavigate}
                  // onAnalyzeCollection={handleAnalyzeCollection}
                  // onDeleteAllInFolder={handleDeleteAllInFolder}
                  onBulkUpload={handleBulkUpload}
                  onSetCover={handleSetCover}
                  onRemovePhoto={removePhoto}
                  onUpdatePhoto={updatePhoto}
                  // onAnalyzePhoto={handleAnalyzePhoto}

                  // Add missing props if they were used in the original PhotoManagerTab
                  onFolderUpload={handleFolderUpload}
                  // onFolderCreated -> likely internal or via prop if needed
                />
              )}
            </TabsContent>
          </div>

          <div className="px-4 md:px-0">
            <TabsContent
              value="precos"
              className="mt-6 w-full overflow-x-hidden"
            >
              <PricingTab
                collectionData={collectionData}
                onDataChange={handleCollectionDataChange}
                addDiscount={addDiscount}
                removeDiscount={removeDiscount}
                updateDiscount={updateDiscount}
              />
            </TabsContent>
          </div>

          <div className="px-4 md:px-0 w-full min-w-0">
            <TabsContent
              value="publicacao"
              className="mt-6 w-full overflow-x-hidden"
            >
              <PublishTab
                collectionData={collectionData}
                initialCollection={initialCollection}
                onDataChange={handleCollectionDataChange}
                setDeleteOpen={setDeleteOpen}
              />
            </TabsContent>
          </div>
        </Tabs>

        <EditorBottomBar
          onSave={handleSaveChanges}
          onBack={() => router.back()}
          submitting={submitting}
        />

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Coleção</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir esta coleção? Esta ação não pode
                ser desfeita e todas as fotos serão perdidas.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteCollection}
                disabled={deleting}
              >
                {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
