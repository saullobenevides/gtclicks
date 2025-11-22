"use client";

import { useEffect, useMemo, useState } from "react";
import { useUser } from "@stackframe/stack";
import { CATEGORIES } from "@/lib/constants";
import { addWatermark } from "@/lib/watermark";
import styles from "./page.module.css";

const orientationOptions = ["HORIZONTAL", "VERTICAL", "PANORAMICA", "QUADRADO"];

const blankPhoto = () => ({
  titulo: "",
  descricao: "",
  previewUrl: "",
  originalUrl: "",
  tags: "",
  orientacao: "HORIZONTAL",
  categoria: "",
});

export default function UploadDashboard() {
  const user = useUser({ or: "anonymous" });
  const isAuthenticated = Boolean(user && !user.isAnonymous && user.id);

  const [fotografoId, setFotografoId] = useState("");
  const [fotografoLookup, setFotografoLookup] = useState({
    loading: false,
    error: "",
    data: null,
  });
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [colecoes, setColecoes] = useState([]);
  const [colecoesLoading, setColecoesLoading] = useState(false);
  const [collectionMode, setCollectionMode] = useState("avulso");
  const [selectedCollection, setSelectedCollection] = useState("");
  const [newCollection, setNewCollection] = useState({ nome: "", descricao: "", capaUrl: "" });
  const [photos, setPhotos] = useState([blankPhoto()]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({ index: null, label: "" });
  const [coverIndex, setCoverIndex] = useState(0);

  const autoProfile = fotografoLookup.data;
  const canEditFotografoId = !autoProfile?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      setFotografoLookup({ loading: false, error: "", data: null });
      setFotografoId("");
      return;
    }

    let cancelled = false;
    setFotografoLookup({ loading: true, error: "", data: null });

    const params = new URLSearchParams({ userId: user.id });
    fetch(`/api/fotografos/resolve?${params.toString()}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload?.error || "Nao encontramos seu perfil de fotografo.");
        }
        return payload.data;
      })
      .then((data) => {
        if (cancelled) return;
        setFotografoLookup({ loading: false, error: "", data });
        setFotografoId(data?.id ?? "");
      })
      .catch((error) => {
        if (cancelled) return;
        setFotografoLookup({
          loading: false,
          error: error.message,
          data: null,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!fotografoId) {
      setColecoes([]);
      setSelectedCollection("");
      return;
    }
    setColecoesLoading(true);
    fetch(`/api/colecoes?fotografoId=${fotografoId}`)
      .then((res) => res.json())
      .then((data) => {
        setColecoes(data?.data ?? []);
      })
      .catch(() => {
        setStatus({ type: "error", message: "Nao foi possivel carregar as colecoes." });
      })
      .finally(() => setColecoesLoading(false));
  }, [fotografoId]);

  const collectionSummary = useMemo(() => {
    if (collectionMode === "existente") {
      const col = colecoes.find((c) => c.id === selectedCollection);
      return col ? `Publicando na colecao ${col.nome}` : "Selecione uma colecao";
    }
    if (collectionMode === "nova") {
      return newCollection.nome ? `Nova colecao: ${newCollection.nome}` : "Informe o nome da nova colecao";
    }
    return "Fotos avulsas (cada foto vira produto individual)";
  }, [collectionMode, colecoes, newCollection.nome, selectedCollection]);

  const handleCreateProfile = async () => {
    if (!user?.id) return;
    
    setCreatingProfile(true);
    try {
      const response = await fetch("/api/fotografos/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          name: user.displayName || user.primaryEmail,
          email: user.primaryEmail,
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Erro ao criar perfil");
      }
      
      setFotografoLookup({ loading: false, error: "", data: data.data });
      setFotografoId(data.data.id);
      setStatus({ type: "success", message: "Perfil de fotógrafo criado com sucesso!" });
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setCreatingProfile(false);
    }
  };

  const fotografoFieldHelper = (() => {
    if (fotografoLookup.loading) {
      return "Buscando seu perfil de fotografo...";
    }
    if (autoProfile?.username) {
      const displayName = autoProfile?.nome
        ? `${autoProfile.nome} (@${autoProfile.username})`
        : `@${autoProfile.username}`;
      return `Perfil conectado automaticamente: ${displayName}.`;
    }
    if (fotografoLookup.error) {
      return null; // Will show create button instead
    }
    return "Cole aqui o ID gerado para voce na tabela Fotografo (cuid...).";
  })();

  const updatePhoto = (index, field, value) => {
    setPhotos((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
    if (coverIndex === index) setCoverIndex(0);
    if (coverIndex > index) setCoverIndex(coverIndex - 1);
  };

  const addPhoto = () => {
    setPhotos((prev) => [...prev, blankPhoto()]);
  };

  const uploadFromDevice = async (index, targetField, file, variant) => {
    if (!file) return;
    setUploadState({ index, label: `Enviando ${file.name}...` });

    try {
      const presignRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, variant }),
      });
      const presignData = await presignRes.json();
      if (!presignRes.ok) {
        throw new Error(presignData?.error || "Falha ao gerar URL assinada");
      }

      const uploadRes = await fetch(presignData.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Nao foi possivel enviar o arquivo para o storage");
      }

      // Update both previewUrl and originalUrl for now since we only have one input
      setPhotos((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          [targetField]: presignData.fileUrl,
          // If we are setting the preview, also set the original as a fallback so the API doesn't complain
          ...(targetField === "previewUrl" ? { originalUrl: presignData.fileUrl } : {}),
        };
        return next;
      });

      setUploadState({ index: null, label: "" });
      setStatus({ type: "success", message: "Arquivo enviado e URL preenchida automaticamente." });
    } catch (error) {
      setUploadState({ index: null, label: "" });
      setStatus({ type: "error", message: error.message });
    }
  };

  const handleFileSelect = async (index, file) => {
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setStatus({ 
        type: "error", 
        message: "Formato inválido. Use apenas JPG, PNG ou WebP." 
      });
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setStatus({ 
        type: "error", 
        message: "Arquivo muito grande. Tamanho máximo: 10MB" 
      });
      return;
    }

    // Auto-detect orientation
    const img = new Image();
    img.onload = () => {
      const orientation = img.width > img.height ? "HORIZONTAL" : "VERTICAL";
      updatePhoto(index, "orientacao", orientation);
    };
    img.src = URL.createObjectURL(file);

    try {
      setUploadState({ index, label: "Gerando marca d'água..." });
      const watermarkedFile = await addWatermark(file);
      
      // Upload Preview (Watermarked)
      await uploadFromDevice(index, "previewUrl", watermarkedFile, "preview");
      
      // Upload Original (Clean)
      await uploadFromDevice(index, "originalUrl", file, "original");
      
    } catch (error) {
      console.error("Erro ao processar imagem:", error);
      setStatus({ type: "error", message: "Erro ao processar imagem para upload." });
      setUploadState({ index: null, label: "" });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!fotografoId) {
      setStatus({
        type: "error",
        message:
          "Nao conseguimos identificar seu ID de fotografo. Confirme se o perfil foi criado e cole o ID manualmente.",
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "", message: "" });

    const novaColecaoPayload = collectionMode === "nova" ? newCollection : undefined;

    const payload = {
      fotografoId,
      modoColecao: collectionMode,
      colecaoId: collectionMode === "existente" ? selectedCollection : undefined,
      novaColecao: novaColecaoPayload,
      coverIndex: collectionMode === "nova" ? coverIndex : undefined,
      fotos: photos,
    };

    try {
      const response = await fetch("/api/fotos/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao salvar as fotos");
      }
      const total = Array.isArray(data?.data) ? data.data.length : photos.length;
      setStatus({ type: "success", message: `${total} foto(s) publicadas.` });
      setPhotos([blankPhoto()]);
      if (collectionMode === "nova" && data?.colecaoId) {
        setCollectionMode("existente");
        setSelectedCollection(data.colecaoId);
        setNewCollection({ nome: "", descricao: "", capaUrl: "" });
        setColecoes((prev) => {
          if (prev.some((col) => col.id === data.colecaoId)) {
            return prev;
          }
          return [
            {
              id: data.colecaoId,
              nome: novaColecaoPayload?.nome ?? "Nova colecao",
              descricao: novaColecaoPayload?.descricao ?? "",
            },
            ...prev,
          ];
        });
      }
      if (collectionMode === "avulso") {
        setSelectedCollection("");
      }
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.uploadCard}>
      {status.message && (
        <div
          className={`${styles.statusMessage} ${
            status.type === "error" ? styles.statusError : styles.statusSuccess
          }`}
        >
          {status.message}
        </div>
      )}

      {fotografoLookup.error && !autoProfile?.id && (
        <div className={styles.createProfilePrompt}>
          <h3>Bem-vindo ao GTClicks!</h3>
          <p>
            Para começar a publicar suas fotos, você precisa criar seu perfil de fotógrafo.
            Clique no botão abaixo para criar automaticamente.
          </p>
          <button
            type="button"
            onClick={handleCreateProfile}
            disabled={creatingProfile}
            className={styles.primaryButton}
          >
            {creatingProfile ? "Criando perfil..." : "Criar Perfil de Fotógrafo"}
          </button>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <h3 className={styles.sectionTitle}>1. Organização</h3>
        <div className={styles.modeRow}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="collectionMode"
              value="avulso"
              checked={collectionMode === "avulso"}
              onChange={(e) => setCollectionMode(e.target.value)}
            />
            Fotos Avulsas
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="collectionMode"
              value="existente"
              checked={collectionMode === "existente"}
              onChange={(e) => setCollectionMode(e.target.value)}
            />
            Adicionar a Coleção Existente
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              name="collectionMode"
              value="nova"
              checked={collectionMode === "nova"}
              onChange={(e) => setCollectionMode(e.target.value)}
            />
            Criar Nova Coleção
          </label>
        </div>
      </div>

      {collectionMode === "existente" && (
        <div className={styles.fieldGroup}>
          <label>Selecione a Coleção</label>
          <select
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
            disabled={colecoesLoading}
          >
            <option value="">Selecione...</option>
            {colecoes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
          {collectionSummary && (
            <small className={styles.helper}>
              {collectionSummary.nome} • {collectionSummary.totalFotos} fotos já publicadas
            </small>
          )}
        </div>
      )}

      {collectionMode === "nova" && (
        <div className={styles.newCollectionGrid}>
          <div className={styles.fieldGroup}>
            <label>Nome da Coleção</label>
            <input
              placeholder="Ex: Verão 2025, Retratos Urbanos..."
              value={newCollection.nome}
              onChange={(e) => setNewCollection({ ...newCollection, nome: e.target.value })}
            />
          </div>

          <div className={styles.fieldGroup} style={{ gridColumn: "1 / -1" }}>
            <label>Descrição da Série</label>
            <textarea
              placeholder="Conte a história por trás dessa série de fotos..."
              value={newCollection.descricao}
              onChange={(e) => setNewCollection({ ...newCollection, descricao: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className={styles.fieldGroup}>
        <h3 className={styles.sectionTitle}>2. Fotos</h3>
        <div className={styles.photosGrid}>
          {photos.map((photo, index) => (
            <div key={index} className={styles.photoCard}>
              <div className={styles.photoHeader}>
                <span style={{ fontWeight: 600, color: "var(--color-heading)" }}>Foto #{index + 1}</span>
                {photos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className={styles.removeButton}
                  >
                    Remover
                  </button>
                )}
              </div>

              <div className={styles.fileUpload}>
                <label className={styles.fileUploadLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(index, e.target.files?.[0])}
                  />
                  {photo.previewUrl ? (
                    <span style={{ color: "var(--color-success)" }}>✓ Arquivo selecionado</span>
                  ) : (
                    <>
                      <span>Clique para selecionar</span> ou arraste aqui
                    </>
                  )}
                </label>
              </div>

              <div className={styles.fieldGroup}>
                <label>Título</label>
                <input
                  placeholder="Título da foto"
                  value={photo.titulo}
                  onChange={(e) => updatePhoto(index, "titulo", e.target.value)}
                />
              </div>

              <div className={styles.fieldGroup}>
                <label>Descrição</label>
                <textarea
                  placeholder="Descreva a foto..."
                  value={photo.descricao}
                  onChange={(e) => updatePhoto(index, "descricao", e.target.value)}
                  rows={2}
                />
              </div>

              <div className={styles.inlineFields}>
                <div className={styles.fieldGroup}>
                  <label>Orientação</label>
                  <select
                    value={photo.orientacao}
                    onChange={(e) => updatePhoto(index, "orientacao", e.target.value)}
                  >
                    {orientationOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.fieldGroup}>
                  <label>Categoria</label>
                  <select
                    value={photo.categoria}
                    onChange={(e) => updatePhoto(index, "categoria", e.target.value)}
                  >
                    <option value="">Selecione...</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.fieldGroup}>
                <label>Tags</label>
                <input
                  placeholder="natureza, brasil..."
                  value={photo.tags}
                  onChange={(e) => updatePhoto(index, "tags", e.target.value)}
                />
              </div>

              {collectionMode === "nova" && (
                <div style={{ marginTop: "0.5rem" }}>
                  <label className={styles.radioLabel} style={{ fontSize: "0.9rem" }}>
                    <input
                      type="radio"
                      name="coverSelection"
                      checked={coverIndex === index}
                      onChange={() => setCoverIndex(index)}
                    />
                    Usar como capa da coleção
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.actionsRow}>
        <button type="button" onClick={addPhoto} className={styles.secondaryButton}>
          + Adicionar outra foto
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !isAuthenticated}
          className={styles.primaryButton}
        >
          {submitting ? "Enviando..." : "Publicar Fotos"}
        </button>
      </div>
    </div>
  );
}
