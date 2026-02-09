"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@stackframe/stack";
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
  previewS3Key: "",
  tags: "",
  orientacao: "HORIZONTAL",
});

export default function CollectionEditor({ collection: initialData }) {
  const router = useRouter();
  const user = useUser();
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
    eventoDuracao: initialCollection.dataFim ? "multi" : "single",
    descontos: initialCollection.descontos || [],
    faceRecognitionEnabled: initialCollection.faceRecognitionEnabled || false,
  });

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderPath, setFolderPath] = useState([{ id: null, nome: "Raiz" }]);

  const [allPhotos, setAllPhotos] = useState(
    (initialCollection.fotos || []).map((p) => ({
      ...p,
      tempId: p.id || Math.random().toString(36).substr(2, 9),
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [effectiveCollectionId, setEffectiveCollectionId] = useState(
    initialCollection.id ?? null
  );
  const [effectiveFotografoId, setEffectiveFotografoId] = useState(
    initialCollection.fotografoId ?? null
  );
  const [activeTab, setActiveTab] = useState("detalhes");

  const collectionIdForUpload = effectiveCollectionId || initialCollection.id;

  const { uploadState, handleFileSelect } = usePhotoUpload(
    collectionIdForUpload,
    currentFolder
  );

  /** Cria a coleção com TODOS os dados preenchidos pelo usuário. Retorna o ID ou null. */
  const ensureCollectionExists = useCallback(async () => {
    if (effectiveCollectionId || initialCollection.id) {
      return effectiveCollectionId || initialCollection.id;
    }
    try {
      const formData = new FormData();
      const fieldsToSave = {
        nome: collectionData.nome?.trim() || "Nova Coleção",
        descricao: collectionData.descricao || "",
        categoria: collectionData.categoria || "",
        precoFoto: Number(collectionData.precoFoto) || 5,
        status: collectionData.status || "RASCUNHO",
        faceRecognitionEnabled: collectionData.faceRecognitionEnabled || false,
        cidade: collectionData.cidade || "",
        estado: collectionData.estado || "",
        local: collectionData.local || "",
        dataInicio: collectionData.dataInicio || "",
        dataFim: collectionData.dataFim || "",
        descontos:
          Array.isArray(collectionData.descontos) &&
          collectionData.descontos.length > 0
            ? JSON.stringify(collectionData.descontos)
            : "",
      };
      Object.entries(fieldsToSave).forEach(([key, value]) => {
        const str = typeof value === "string" ? value : String(value ?? "");
        if (key === "nome" || str !== "") {
          formData.append(key, str);
        }
      });
      const { createCollection } = await import("@/actions/collections");
      const result = await createCollection(formData);
      if (result.error) throw new Error(result.error);
      const newId = result.data.id;
      setEffectiveCollectionId(newId);
      if (result.data.fotografoId) {
        setEffectiveFotografoId(result.data.fotografoId);
      }
      return newId;
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Erro ao criar coleção.");
      return null;
    }
  }, [
    effectiveCollectionId,
    initialCollection.id,
    collectionData.nome,
    collectionData.descricao,
    collectionData.categoria,
    collectionData.precoFoto,
    collectionData.status,
    collectionData.faceRecognitionEnabled,
    collectionData.cidade,
    collectionData.estado,
    collectionData.local,
    collectionData.dataInicio,
    collectionData.dataFim,
    collectionData.descontos,
  ]);

  const currentPhotos = useMemo(() => {
    return allPhotos.filter((p) => {
      if (currentFolder === null) {
        return !p.folderId;
      }
      return p.folderId === currentFolder.id;
    });
  }, [allPhotos, currentFolder]);

  // Cria a coleção ao abrir a aba Fotos (nova coleção) – fotógrafo define a ordem
  const creatingRef = useRef(false);
  useEffect(() => {
    if (
      activeTab === "fotos" &&
      !effectiveCollectionId &&
      !initialCollection.id &&
      !creatingRef.current
    ) {
      creatingRef.current = true;
      ensureCollectionExists().finally(() => {
        creatingRef.current = false;
      });
    }
  }, [
    activeTab,
    effectiveCollectionId,
    initialCollection.id,
    ensureCollectionExists,
  ]);

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
      if (field === "nome") {
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
        const cId = effectiveCollectionId || initialCollection.id;
        const result = await setCollectionCover(cId, photo.id);
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
    [effectiveCollectionId, initialCollection.id]
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
        prev.filter((p) => p.tempId !== photoToRemove.tempId)
      );
      if (collectionData.capaUrl === photoToRemove.previewUrl) {
        setCollectionData((prev) => ({ ...prev, capaUrl: "" }));
      }
      toast.success("Foto removida.");
      setIsDirty(true);
    },
    [collectionData.capaUrl]
  );

  const updatePhoto = useCallback((photoToUpdate, field, value) => {
    setAllPhotos((prev) =>
      prev.map((p) =>
        p.tempId === photoToUpdate.tempId ? { ...p, [field]: value } : p
      )
    );
    setIsDirty(true);
  }, []);

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    let cId = effectiveCollectionId || initialCollection.id;
    if (!cId) {
      cId = await ensureCollectionExists();
      if (!cId) return;
    }

    toast.info(`Iniciando upload de ${files.length} fotos...`);

    const newPhotos = files.map((file) => ({
      ...blankPhoto(),
      titulo: file.name.split(".")[0],
      folderId: currentFolder?.id || null,
    }));

    setAllPhotos((prev) => [...prev, ...newPhotos]);

    let completed = 0;
    let firstUploadedPhoto = null;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const photoPlaceholder = newPhotos[i];

      try {
        const updatedPhoto = await handleFileSelect(
          photoPlaceholder,
          file,
          updatePhoto,
          cId
        );
        if (updatedPhoto) {
          setAllPhotos((prev) =>
            prev.map((p) =>
              p.tempId === photoPlaceholder.tempId ? updatedPhoto : p
            )
          );
          if (!firstUploadedPhoto) firstUploadedPhoto = updatedPhoto;
        }
        completed++;
        if (completed % 5 === 0)
          toast.success(`${completed}/${files.length} enviados...`);
      } catch (err) {
        console.error(`Erro ao enviar ${file.name}`, err);
        toast.error(`Falha no envio de ${file.name}`);
      }
    }

    // Auto-definir capa quando a primeira foto é enviada e ainda não há capa
    if (
      firstUploadedPhoto?.id &&
      firstUploadedPhoto?.previewUrl &&
      !collectionData.capaUrl &&
      cId
    ) {
      try {
        const coverResult = await setCollectionCover(
          cId,
          firstUploadedPhoto.id
        );
        if (!coverResult.error && coverResult.coverUrl) {
          setCollectionData((prev) => ({
            ...prev,
            capaUrl: coverResult.coverUrl,
          }));
          toast.success("Capa definida automaticamente!");
        } else {
          setCollectionData((prev) => ({
            ...prev,
            capaUrl: firstUploadedPhoto.previewUrl,
          }));
        }
      } catch (e) {
        setCollectionData((prev) => ({
          ...prev,
          capaUrl: firstUploadedPhoto.previewUrl,
        }));
      }
    }

    toast.success("Upload em massa concluído!");
    if (cId && !initialCollection.id) {
      router.push(`/dashboard/fotografo/colecoes/${cId}/editar`);
    }
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
        })
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
      (p) => !deletedPhotoIds.includes(p.id) || !p.id
    ).length; // Check strictly non-deleted photos

    // Simplification: Check if we have visible photos remaining
    const remainingPhotos = allPhotos.filter(
      (p) =>
        !deletedPhotoIds.includes(p.tempId) && !deletedPhotoIds.includes(p.id)
    );

    if (collectionData.status === "PUBLICADA" && remainingPhotos.length === 0) {
      toast.error("Não é possível publicar uma coleção sem fotos.");
      return;
    }

    setSubmitting(true);
    try {
      let finalCapaUrl = collectionData.capaUrl;
      const validPhotos = allPhotos.filter(
        (p) => p.previewUrl && !deletedPhotoIds.includes(p.id)
      );

      const collectionIdToSave = effectiveCollectionId || initialCollection.id;

      // Capa SEM marca d'água: usar generateCoverImage (setCollectionCover) em vez de previewUrl
      if (!finalCapaUrl && validPhotos.length > 0 && collectionIdToSave) {
        const lastPhoto = validPhotos[validPhotos.length - 1];
        if (lastPhoto.id) {
          const coverResult = await setCollectionCover(
            collectionIdToSave,
            lastPhoto.id
          );
          if (!coverResult.error && coverResult.coverUrl) {
            finalCapaUrl = coverResult.coverUrl;
            setCollectionData((prev) => ({ ...prev, capaUrl: finalCapaUrl }));
          } else {
            finalCapaUrl = lastPhoto.previewUrl; // fallback (com marca)
          }
        } else {
          finalCapaUrl = lastPhoto.previewUrl;
        }
      } else if (!finalCapaUrl && validPhotos.length > 0) {
        // Nova coleção: usa preview como fallback; capa limpa será gerada após salvar
        finalCapaUrl = validPhotos[validPhotos.length - 1].previewUrl;
        setCollectionData((prev) => ({ ...prev, capaUrl: finalCapaUrl }));
      }

      let result;
      if (collectionIdToSave) {
        // UPDATE EXISTING
        result = await updateCollection(collectionIdToSave, {
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

      if (!collectionIdToSave && result.data?.id) {
        toast.success("Coleção criada com sucesso!");
        setEffectiveCollectionId(result.data.id);
        router.push(`/dashboard/fotografo/colecoes/${result.data.id}/editar`);
        return;
      }

      let fotografoId = effectiveFotografoId || initialCollection.fotografoId;

      if (
        !fotografoId &&
        user?.id &&
        (allPhotos.length > 0 || deletedPhotoIds.length > 0)
      ) {
        try {
          const res = await fetch(`/api/fotografos/resolve?userId=${user.id}`);
          if (res.ok) {
            const data = await res.json();
            fotografoId = data?.data?.id;
            if (fotografoId) setEffectiveFotografoId(fotografoId);
          }
        } catch (e) {
          console.warn("Fallback fotografoId fetch failed:", e);
        }
      }

      if (
        !fotografoId &&
        (allPhotos.length > 0 || deletedPhotoIds.length > 0)
      ) {
        toast.error(
          "Não foi possível identificar o fotógrafo. Faça login novamente."
        );
        return;
      }

      const payload = {
        fotografoId,
        collectionId: collectionIdToSave,
        fotos: allPhotos.map((p) => ({
          id: p.id || undefined,
          titulo: p.titulo,
          descricao: p.descricao,
          orientacao: p.orientacao,
          folderId: p.folderId ?? null,
          colecaoId: collectionIdToSave || p.colecaoId,
          s3Key: p.s3Key ?? undefined,
          width: p.width,
          height: p.height,
          numeroSequencial: p.numeroSequencial,
          dataCaptura: p.dataCaptura
            ? typeof p.dataCaptura === "string"
              ? p.dataCaptura
              : p.dataCaptura instanceof Date
              ? p.dataCaptura.toISOString()
              : undefined
            : undefined,
        })),
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
          const msg =
            err.error ||
            (err.details ? JSON.stringify(err.details) : null) ||
            "Erro ao salvar fotos em massa.";
          throw new Error(msg);
        }
      }

      toast.success("Alterações salvas com sucesso!");
      router.refresh();
    } catch (error) {
      console.error("Save Error Detail:", error);
      if (error.message.includes("Nao foi possivel salvar as fotos")) {
        toast.error(
          "Erro ao salvar fotos. Verifique os logs do servidor para mais detalhes."
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
        "Tem certeza? Isso removerá todas as fotos VISÍVEIS nesta pasta."
      )
    )
      return;
    const idsToRemove = currentPhotos.map((p) => p.id).filter(Boolean);
    setDeletedPhotoIds((prev) => [...prev, ...idsToRemove]);
    const tempIdsToRemove = currentPhotos.map((p) => p.tempId);
    setAllPhotos((prev) =>
      prev.filter((p) => !tempIdsToRemove.includes(p.tempId))
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
        i === index ? { ...d, [field]: parseFloat(value) } : d
      ),
    }));
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      <div className="block space-y-8 pb-32 md:pb-12 w-full px-0 min-w-0">
        <div className="px-4 md:px-0 w-full min-w-0">
          <EditorHeader
            title={initialCollection.id ? "Editar Coleção" : "Nova Coleção"}
            submitting={submitting}
            onSave={handleSaveChanges}
            isDirty={isDirty}
          />
        </div>

        <Tabs defaultValue="detalhes" className="w-full">
          <div className="w-full max-w-[100vw] min-h-[56px] overflow-x-auto overflow-y-hidden sticky top-16 md:static z-40 bg-black/95 backdrop-blur-md md:bg-transparent border-b border-white/5 md:border-none mb-6 md:mb-8 no-scrollbar">
            <TabsList
              aria-label="Abas do editor: Detalhes, Fotos, Preços, Publicação"
              className="flex w-max md:w-full md:grid md:grid-cols-4 lg:w-[600px] h-14 p-0 bg-transparent rounded-none gap-0 select-none px-4 md:px-0"
            >
              <TabsTrigger
                value="detalhes"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px] touch-manipulation"
              >
                Detalhes
              </TabsTrigger>
              <TabsTrigger
                value="fotos"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px] touch-manipulation"
              >
                Fotos ({currentPhotos.length})
              </TabsTrigger>
              <TabsTrigger
                value="precos"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px] touch-manipulation"
              >
                Preços
              </TabsTrigger>
              <TabsTrigger
                value="publicacao"
                className="data-[state=active]:text-primary! data-[state=active]:font-black text-xs uppercase tracking-widest relative h-full min-h-[48px] rounded-none border-b-2 border-transparent data-[state=active]:border-primary transition-all flex-1 min-w-[100px] touch-manipulation"
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

          <div className="px-4 md:px-0 w-full min-w-0">
            <TabsContent
              value="fotos"
              className="space-y-6 mt-6 overflow-x-hidden"
            >
              <PhotoManagerTab
                collectionId={effectiveCollectionId || initialCollection.id}
                currentFolder={currentFolder}
                folderPath={folderPath}
                currentPhotos={currentPhotos}
                collectionData={collectionData}
                uploadState={uploadState}
                onNavigate={handleNavigate}
                onDeleteAllInFolder={handleDeleteAllInFolder}
                onBulkUpload={handleBulkUpload}
                onSetCover={handleSetCover}
                onRemovePhoto={removePhoto}
                onUpdatePhoto={updatePhoto}
                onFolderUpload={handleFolderUpload}
                onEnsureCollection={ensureCollectionExists}
              />
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
