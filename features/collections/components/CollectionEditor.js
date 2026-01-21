"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function CollectionEditor({ collection: initialCollection }) {
  const router = useRouter();

  const [collectionData, setCollectionData] = useState({
    nome: initialCollection.nome || "",
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

  const handleCollectionDataChange = (field, value) => {
    setCollectionData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSetCover = (photo) => {
    if (photo.previewUrl) {
      setCollectionData((prev) => ({ ...prev, capaUrl: photo.previewUrl }));
      toast.success("Capa definida com sucesso!");
    }
  };

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

  const removePhoto = (photoToRemove) => {
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
  };

  const updatePhoto = (photoToUpdate, field, value) => {
    setAllPhotos((prev) =>
      prev.map((p) =>
        p.tempId === photoToUpdate.tempId ? { ...p, [field]: value } : p,
      ),
    );
  };

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
    setSubmitting(true);
    try {
      let finalCapaUrl = collectionData.capaUrl;
      if (!finalCapaUrl) {
        const validPhotos = allPhotos.filter(
          (p) => p.previewUrl && !deletedPhotoIds.includes(p.id),
        );
        if (validPhotos.length > 0) {
          finalCapaUrl = validPhotos[validPhotos.length - 1].previewUrl;
          setCollectionData((prev) => ({ ...prev, capaUrl: finalCapaUrl }));
        }
      }

      await fetch(`/api/colecoes/${initialCollection.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...collectionData, capaUrl: finalCapaUrl }),
      });

      const payload = {
        fotografoId: initialCollection.fotografoId,
        fotos: allPhotos
          .filter((p) => p.id)
          .map((p) => ({
            id: p.id,
            titulo: p.titulo,
            descricao: p.descricao,
            tags:
              typeof p.tags === "string"
                ? p.tags
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                : p.tags || [],
            orientacao: p.orientacao,
            folderId: p.folderId,
          })),
        deletedPhotoIds,
      };

      if (payload.fotos.length > 0 || payload.deletedPhotoIds.length > 0) {
        await fetch("/api/fotos/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      toast.success("Alterações salvas com sucesso!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error.message);
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
    <div className="flex flex-col gap-8 pb-24 md:pb-0 overflow-x-hidden w-full">
      <EditorHeader submitting={submitting} onSave={handleSaveChanges} />

      <Tabs defaultValue="detalhes" className="w-full">
        <div className="w-full max-w-full overflow-hidden px-1">
          <TabsList className="flex w-full md:grid md:grid-cols-4 lg:w-[600px] overflow-x-auto md:overflow-visible h-auto p-1 bg-zinc-900 rounded-lg border border-zinc-800 gap-1 md:gap-0 no-scrollbar select-none">
            <TabsTrigger
              value="detalhes"
              className="data-[state=active]:bg-white! data-[state=active]:text-black! data-[state=active]:font-bold py-2 min-w-[80px] md:min-w-0 flex-1 md:flex-none"
            >
              Detalhes
            </TabsTrigger>
            <TabsTrigger
              value="fotos"
              className="data-[state=active]:bg-white! data-[state=active]:text-black! data-[state=active]:font-bold py-2 min-w-[80px] md:min-w-0 flex-1 md:flex-none"
            >
              Fotos ({currentPhotos.length})
            </TabsTrigger>
            <TabsTrigger
              value="precos"
              className="data-[state=active]:bg-white! data-[state=active]:text-black! data-[state=active]:font-bold py-2 min-w-[80px] md:min-w-0 flex-1 md:flex-none"
            >
              Preços
            </TabsTrigger>
            <TabsTrigger
              value="publicacao"
              className="data-[state=active]:bg-white! data-[state=active]:text-black! data-[state=active]:font-bold py-2 min-w-[80px] md:min-w-0 flex-1 md:flex-none"
            >
              Publicação
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="detalhes"
          className="mt-6 w-full max-w-full overflow-x-hidden"
        >
          <BasicDetailsTab
            collectionData={collectionData}
            onDataChange={handleCollectionDataChange}
          />
        </TabsContent>

        <TabsContent
          value="fotos"
          className="mt-6 w-full max-w-full overflow-x-hidden"
        >
          <PhotoManagerTab
            collectionId={initialCollection.id}
            currentFolder={currentFolder}
            folderPath={folderPath}
            currentPhotos={currentPhotos}
            collectionData={collectionData}
            uploadState={uploadState}
            analyzingId={analyzingId}
            analyzingCollection={analyzingCollection}
            onNavigate={handleNavigate}
            onAnalyzeCollection={handleAnalyzeCollection}
            onDeleteAllInFolder={handleDeleteAllInFolder}
            onBulkUpload={handleBulkUpload}
            onSetCover={handleSetCover}
            onRemovePhoto={removePhoto}
            onUpdatePhoto={updatePhoto}
            onAnalyzePhoto={handleAnalyzePhoto}
          />
        </TabsContent>

        <TabsContent
          value="precos"
          className="mt-6 w-full max-w-full overflow-x-hidden"
        >
          <PricingTab
            collectionData={collectionData}
            onDataChange={handleCollectionDataChange}
            addDiscount={addDiscount}
            removeDiscount={removeDiscount}
            updateDiscount={updateDiscount}
          />
        </TabsContent>

        <TabsContent
          value="publicacao"
          className="mt-6 w-full max-w-full overflow-x-hidden"
        >
          <PublishTab
            collectionData={collectionData}
            initialCollection={initialCollection}
            onDataChange={handleCollectionDataChange}
            setDeleteOpen={setDeleteOpen}
          />
        </TabsContent>
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
  );
}
