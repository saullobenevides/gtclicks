'use client';


import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, Trash2, PlusCircle, Loader2, Save, ArrowLeft, Star, Sparkles, DollarSign, Share2 } from 'lucide-react';
import EXIF from 'exif-js';
import FolderManager from './FolderManager';
import Breadcrumbs from './Breadcrumbs';
import LocationSelector from './LocationSelector';
import PlaceSelector from './PlaceSelector';
import { CATEGORIES } from '@/lib/constants';
import { toast } from "sonner";

// ... (keep constants and helper functions)
const orientationOptions = ['HORIZONTAL', 'VERTICAL', 'PANORAMICA', 'QUADRADO'];
const blankPhoto = () => ({
  id: null,
  tempId: Math.random().toString(36).substr(2, 9),
  titulo: '',
  descricao: '',
  previewUrl: '',
  s3Key: '',
  previewS3Key: '',
  tags: '',
  orientacao: 'HORIZONTAL',
});

// ... (keep extractMetadata and generatePreview)
const extractMetadata = (file) => {
  return new Promise((resolve) => {
    EXIF.getData(file, function() {
      const make = EXIF.getTag(this, "Make");
      const model = EXIF.getTag(this, "Model");
      const iso = EXIF.getTag(this, "ISOSpeedRatings");
      const focalLength = EXIF.getTag(this, "FocalLength");
      const aperture = EXIF.getTag(this, "FNumber");
      const shutterSpeed = EXIF.getTag(this, "ExposureTime");
      const lens = EXIF.getTag(this, "LensModel") || EXIF.getTag(this, "LensInfo");
      let formattedShutterSpeed = null;
      if (shutterSpeed) {
        if (shutterSpeed < 1) {
          formattedShutterSpeed = `1/${Math.round(1/shutterSpeed)}`;
        } else {
          formattedShutterSpeed = `${shutterSpeed}`;
        }
      }
      resolve({ camera: make && model ? `${make} ${model}` : (model || make || null), lens, focalLength: focalLength ? `${focalLength}mm` : null, iso, shutterSpeed: formattedShutterSpeed, aperture: aperture ? `f/${aperture}` : null });
    });
  });
};

const generatePreview = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 1200, MAX_HEIGHT = 1200;
        let width = img.width, height = img.height;
        if (width > height) { if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; } }
        else { if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; } }
        canvas.width = width; canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.save(); ctx.globalAlpha = 0.4; ctx.font = `bold ${width*0.08}px Arial`; ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.translate(width/2, height/2); ctx.rotate(-30 * Math.PI / 180); ctx.fillText('GT Clicks Preview', 0, 0);
        ctx.restore();
        canvas.toBlob((blob) => { if (blob) resolve(blob); else reject(new Error("Failed to generate preview blob")); }, 'image/jpeg', 0.60);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

export default function CollectionEditor({ collection: initialCollection }) {
  const router = useRouter();
  
  const [collectionData, setCollectionData] = useState({
    nome: initialCollection.nome || '',
    descricao: initialCollection.descricao || '',
    categoria: initialCollection.categoria || '',
    status: initialCollection.status || 'RASCUNHO',
    precoFoto: initialCollection.precoFoto || 0,
    capaUrl: initialCollection.capaUrl || '',
    createdAt: initialCollection.createdAt ? new Date(initialCollection.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    
    // New Fields
    cidade: initialCollection.cidade || '',
    estado: initialCollection.estado || '',
    local: initialCollection.local || '',
    dataInicio: initialCollection.dataInicio ? new Date(initialCollection.dataInicio).toISOString().split('T')[0] : (initialCollection.createdAt ? new Date(initialCollection.createdAt).toISOString().split('T')[0] : ''),
    dataFim: initialCollection.dataFim ? new Date(initialCollection.dataFim).toISOString().split('T')[0] : '', 
    descontos: initialCollection.descontos || [], // [{min: 5, price: 10}]
  });
  
  // Folder Navigation State
  const [currentFolder, setCurrentFolder] = useState(null); // null = root
  const [folderPath, setFolderPath] = useState([{ id: null, nome: 'Raiz' }]);
  
  // Photos State (Filtered by current folder)
  // Ensure all photos have a tempId for stable tracking
  const [allPhotos, setAllPhotos] = useState((initialCollection.fotos || []).map(p => ({
      ...p,
      tempId: p.id || Math.random().toString(36).substr(2, 9)
  })));
  const [submitting, setSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({ photoTempId: null, label: '' });
  const [deletedPhotoIds, setDeletedPhotoIds] = useState([]);

  // Filter photos when folder changes or photos update
  const currentPhotos = useMemo(() => {
    return allPhotos.filter(p => {
      if (currentFolder === null) {
        return !p.folderId; // Root photos have no folderId
      }
      return p.folderId === currentFolder.id;
    });
  }, [allPhotos, currentFolder]);

  const handleCollectionDataChange = (field, value) => {
    setCollectionData(prev => ({ ...prev, [field]: value }));
  };

  const handleSetCover = (photo) => {
    if (photo.previewUrl) {
      setCollectionData(prev => ({ ...prev, capaUrl: photo.previewUrl }));
      toast.success("Capa definida com sucesso!");
    }
  };

  const handleNavigate = (folder) => {
    if (folder.id === null) {
      setCurrentFolder(null);
      setFolderPath([{ id: null, nome: 'Raiz' }]);
    } else {
      const index = folderPath.findIndex(f => f.id === folder.id);
      if (index !== -1) {
        setFolderPath(folderPath.slice(0, index + 1));
      } else {
        setFolderPath([...folderPath, { id: folder.id, nome: folder.nome }]);
      }
      setCurrentFolder(folder);
    }
  };

  // Photo management functions
  const addPhoto = () => {
    const newPhoto = { ...blankPhoto(), folderId: currentFolder?.id || null };
    setAllPhotos(prev => [...prev, newPhoto]);
  };

  const removePhoto = (photoToRemove) => {
    if (photoToRemove.id) {
        setDeletedPhotoIds(prev => [...prev, photoToRemove.id]);
    }
    setAllPhotos(prev => prev.filter(p => p.tempId !== photoToRemove.tempId));
    if (collectionData.capaUrl === photoToRemove.previewUrl) {
      setCollectionData(prev => ({ ...prev, capaUrl: '' }));
    }
    toast.success("Foto removida.");
  };

  const updatePhoto = (photoToUpdate, field, value) => {
    setAllPhotos(prev => prev.map(p => p.tempId === photoToUpdate.tempId ? { ...p, [field]: value } : p));
  };


  const uploadFromDevice = async (photoToUpload, file) => {
    if (!file) return;
    setUploadState({ photoTempId: photoToUpload.tempId, label: `Extraindo metadados...` });

    try {
      const metadata = await extractMetadata(file);
      const previewBlob = await generatePreview(file);
      
      setUploadState({ photoTempId: photoToUpload.tempId, label: `Enviando arquivos...` });
      const [originalPresign, previewPresign] = await Promise.all([
        fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "originals" }) }).then(r => r.json()),
        fetch("/api/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ filename: `preview_${file.name}`, contentType: "image/jpeg", folder: "previews" }) }).then(r => r.json()),
      ]);

      if (originalPresign.error || previewPresign.error) throw new Error("Falha ao gerar URLs de upload");

      await Promise.all([
        fetch(originalPresign.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type || "application/octet-stream" }, body: file }),
        fetch(previewPresign.uploadUrl, { method: "PUT", headers: { "Content-Type": "image/jpeg" }, body: previewBlob }),
      ]);

      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const processRes = await fetch("/api/photos/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key: originalPresign.s3Key,
          previewS3Key: previewPresign.s3Key,
          width: img.width, height: img.height,
          titulo: file.name.split('.')[0],
          ...metadata,
          colecaoId: initialCollection.id,
          folderId: currentFolder?.id || null, // Use folderId instead of string path
        }),
      });

      const processData = await processRes.json();
      if (!processRes.ok) throw new Error(processData?.error || "Erro ao processar foto");

      setAllPhotos((prev) => prev.map(p => p.tempId === photoToUpload.tempId ? {
        ...p,
        id: processData.foto.id,
        s3Key: originalPresign.s3Key,
        previewS3Key: previewPresign.s3Key,
        previewUrl: processData.foto.previewUrl,
        titulo: processData.foto.titulo,
        ...metadata,
        folderId: currentFolder?.id || null
      } : p));

      setUploadState({ photoTempId: null, label: '' });
      toast.success('Upload concluído! Preencha os detalhes e publique.');
    } catch (error) {
      console.error(error);
      setUploadState({ photoTempId: null, label: '' });
      toast.error(error.message);
    }
  };

  const handleFileSelect = async (photo, file) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { toast.error(`Formato inválido: ${file.name}`); return; }
    
    // Update local state first
    const img = new Image();
    img.onload = () => { 
        const orientation = img.width > img.height ? 'HORIZONTAL' : 'VERTICAL'; 
        updatePhoto(photo, 'orientacao', orientation); 
    };
    img.src = URL.createObjectURL(file);
    
    await uploadFromDevice(photo, file);
  };

  const handleBulkUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    toast.info(`Iniciando upload de ${files.length} fotos...`);

    // 1. Create placeholders for all files immediately
    const newPhotos = files.map(file => ({
        ...blankPhoto(),
        titulo: file.name.split('.')[0], // Auto-title from filename
        folderId: currentFolder?.id || null
    }));

    // Add to state so user sees them immediately
    setAllPhotos(prev => [...prev, ...newPhotos]);

    // 2. Process uploads sequentially (or focused parallel) to avoid browser freeze
    // We match the newPhoto tempId to the file index
    let completed = 0;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const photoPlaceholder = newPhotos[i];
        
        try {
            await handleFileSelect(photoPlaceholder, file);
            completed++;
            if (completed % 5 === 0) toast.success(`${completed}/${files.length} enviados...`);
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
    toast("IA analisando a capa da coleção...", { icon: <Sparkles className="h-4 w-4 animate-spin text-yellow-500" /> });

    try {
      const aiRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageUrl: collectionData.capaUrl
        }),
      });
      
      if (!aiRes.ok) {
        const errorData = await aiRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha na análise IA");
      }

      const aiData = await aiRes.json();
      
      setCollectionData(prev => ({
        ...prev,
        nome: aiData.title || prev.nome,
        descricao: aiData.description || prev.descricao,
        // We could also suggest a category based on aiData.tags but that requires mapping to our ENUM
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
    toast("IA analisando a imagem...", { icon: <Sparkles className="h-4 w-4 animate-spin text-yellow-500" /> });

    try {
      // Send URL to server to avoid CORS issues with client-side fetch
      const aiRes = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageUrl: photo.previewUrl
        }),
      });
          
      if (!aiRes.ok) {
        const errorData = await aiRes.json().catch(() => ({}));
        throw new Error(errorData.error || "Falha na análise IA - Verifique o console ou tente novamente.");
      }

      const aiData = await aiRes.json();
      
      // Update photo with AI data
      setAllPhotos(prev => prev.map(p => {
         if (p.tempId !== photo.tempId) return p;
         return {
           ...p,
           titulo: aiData.title || p.titulo,
           descricao: aiData.description || p.descricao,
           tags: Array.isArray(aiData.tags) ? aiData.tags.join(", ") : (aiData.tags || p.tags),
           corPredominante: aiData.primaryColor
         };
      }));
      
      toast.success("Foto preenchida com magia IA! ✨");

    } catch (error) {
       console.error(error);
       setAnalyzingId(null);
       toast.error(error.message || "Erro ao processar imagem para IA.");
    } finally {
      setAnalyzingId(null);
    }

  };

  const handleSaveChanges = async () => {
    setSubmitting(true);

    try {
      // Logic to set default cover if none selected
      let finalCapaUrl = collectionData.capaUrl;
      if (!finalCapaUrl) {
         // Find the last photo with a previewUrl
         const validPhotos = allPhotos.filter(p => p.previewUrl && !deletedPhotoIds.includes(p.id));
         if (validPhotos.length > 0) {
           finalCapaUrl = validPhotos[validPhotos.length - 1].previewUrl;
           setCollectionData(prev => ({ ...prev, capaUrl: finalCapaUrl }));
         }
      }

      // 1. Save Collection Details
      const colResponse = await fetch(`/api/colecoes/${initialCollection.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...collectionData, capaUrl: finalCapaUrl }),
      });
      if (!colResponse.ok) {
          const text = await colResponse.text();
          let errorMsg = 'Falha ao salvar detalhes da coleção';
          try {
             const json = JSON.parse(text);
             if (json?.error) {
                 errorMsg = json.error;
                 if (json.details) errorMsg += `: ${json.details}`;
             }
          } catch (e) {
             console.warn('Response was not JSON:', text);
          }
          throw new Error(errorMsg);
      }

      // 2. Save Photo Details (batch update)
      const payload = {
        fotografoId: initialCollection.fotografoId,
        fotos: allPhotos.filter(p => p.id).map(p => ({
          id: p.id,
          titulo: p.titulo,
          descricao: p.descricao,
          tags: typeof p.tags === 'string' ? p.tags.split(',').map(tag => tag.trim()).filter(Boolean) : (p.tags || []),
          orientacao: p.orientacao,
          folderId: p.folderId, // Ensure folderId is sent
        })),
        deletedPhotoIds, // Send deleted IDs
      };
      if (payload.fotos.length > 0 || payload.deletedPhotoIds.length > 0) {
        const photoResponse = await fetch('/api/fotos/batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!photoResponse.ok) {
            const text = await photoResponse.text();
            let errorMsg = 'Falha ao salvar detalhes das fotos';
            try {
               const json = JSON.parse(text);
               if (json?.error) errorMsg = json.error;
            } catch (e) {
               console.warn('Response was not JSON:', text);
            }
            throw new Error(errorMsg);
        }
      }

      toast.success('Alterações salvas com sucesso!');
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
      const res = await fetch(`/api/colecoes/${initialCollection.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao excluir coleção');
      }
      
      toast.success("Coleção excluída com sucesso.");
      router.push('/dashboard/fotografo/colecoes');
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
      if (!confirm("Tem certeza? Isso removerá todas as fotos VISÍVEIS nesta pasta.")) return;
      
      const idsToRemove = currentPhotos.map(p => p.id).filter(Boolean);
      setDeletedPhotoIds(prev => [...prev, ...idsToRemove]);
      
      const tempIdsToRemove = currentPhotos.map(p => p.tempId);
      setAllPhotos(prev => prev.filter(p => !tempIdsToRemove.includes(p.tempId)));
      
      toast.success("Pasta limpa com sucesso.");
  };

  const addDiscount = () => {
    setCollectionData(prev => ({
      ...prev,
      descontos: [...(prev.descontos || []), { min: 5, price: parseFloat(prev.precoFoto || 0) }]
    }));
  };

  const removeDiscount = (index) => {
    setCollectionData(prev => ({
      ...prev,
      descontos: prev.descontos.filter((_, i) => i !== index)
    }));
  };

  const updateDiscount = (index, field, value) => {
    setCollectionData(prev => ({
      ...prev,
      descontos: prev.descontos.map((d, i) => i === index ? { ...d, [field]: parseFloat(value) } : d)
    }));
  };



  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Editar Coleção</h1>
          <div className="flex gap-2">
             <Button type="button" variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
             </Button>
             <Button type="button" onClick={handleSaveChanges} disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save className="mr-2 h-4 w-4" />
                Salvar Tudo
            </Button>
          </div>
      </div>

      <Tabs defaultValue="detalhes" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px] h-auto p-1 bg-zinc-900 rounded-lg border border-zinc-800">
          <TabsTrigger value="detalhes" className="data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:font-bold py-2 transition-all hover:text-white/80 data-[state=active]:hover:text-black">Detalhes</TabsTrigger>
          <TabsTrigger value="fotos" className="data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:font-bold py-2 transition-all hover:text-white/80 data-[state=active]:hover:text-black">Fotos ({currentPhotos.length})</TabsTrigger>
          <TabsTrigger value="precos" className="data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:font-bold py-2 transition-all hover:text-white/80 data-[state=active]:hover:text-black">Preços</TabsTrigger>
          <TabsTrigger value="publicacao" className="data-[state=active]:!bg-white data-[state=active]:!text-black data-[state=active]:font-bold py-2 transition-all hover:text-white/80 data-[state=active]:hover:text-black">Publicação</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: DETALHES --- */}
        <TabsContent value="detalhes" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Coleção</CardTitle>
              <CardDescription>Informações básicas para identificar o evento.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="collection-name">Título da Coleção</Label>
                    <Input id="collection-name" value={collectionData.nome} onChange={(e) => handleCollectionDataChange('nome', e.target.value)} placeholder="Ex: Corrida 5k Santos / Ensaio Fotográfico" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="collection-category">Categoria</Label>
                    <Select value={collectionData.categoria} onValueChange={(value) => handleCollectionDataChange('categoria', value)}>
                      <SelectTrigger id="collection-category">
                        <SelectValue placeholder="Selecione..." />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
              </div>

               <div className="grid md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="collection-date-start">Início do Evento</Label>
                    <Input id="collection-date-start" type="date" value={collectionData.dataInicio} onChange={(e) => handleCollectionDataChange('dataInicio', e.target.value)} />
                  </div>
                   <div className="space-y-1.5">
                    <Label htmlFor="collection-date-end">Fim do Evento</Label>
                    <Input id="collection-date-end" type="date" value={collectionData.dataFim} onChange={(e) => handleCollectionDataChange('dataFim', e.target.value)} />
                  </div>
                  
                  {/* Location Selector Component covers City and State */}
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                 <LocationSelector 
                    selectedState={collectionData.estado}
                    selectedCity={collectionData.cidade}
                    onStateChange={(val) => handleCollectionDataChange('estado', val)}
                    onCityChange={(val) => handleCollectionDataChange('cidade', val)}
                 />
              </div>
              
              <div className="space-y-1.5">
                  <PlaceSelector 
                     value={collectionData.local} 
                     onChange={(val) => handleCollectionDataChange('local', val)}
                     onCityStateChange={({ city, state }) => {
                        // Optional: optimize automatically setting city/state if found
                        handleCollectionDataChange('cidade', city);
                        handleCollectionDataChange('estado', state);
                        toast.info(`Cidade e Estado atualizados para: ${city} - ${state}`);
                     }}
                  />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="collection-description">Descrição</Label>
                <Textarea id="collection-description" value={collectionData.descricao} onChange={(e) => handleCollectionDataChange('descricao', e.target.value)} placeholder="Conte mais sobre como foi o evento..." className="h-24" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* --- TAB 2: FOTOS --- */}
        <TabsContent value="fotos" className="space-y-4 mt-6">
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
                            <Breadcrumbs path={folderPath} onNavigate={handleNavigate} />
                        </div>
                    </div>

                    {/* Folder Manager */}
                    <FolderManager 
                        collectionId={initialCollection.id} 
                        currentFolder={currentFolder} 
                        onNavigate={(folder) => handleNavigate(folder)}
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
                                       onClick={handleAnalyzeCollection}
                                       disabled={analyzingCollection}
                                     >
                                         {analyzingCollection ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                         IA na Capa
                                     </Button>
                                    {currentPhotos.length > 0 && (
                                        <Button variant="outline" size="sm" onClick={handleDeleteAllInFolder} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200">
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
                                    onChange={handleBulkUpload}
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
                            {currentPhotos.map((photo, index) => (
                                <Card key={photo.tempId} className={`flex flex-col relative ${collectionData.capaUrl === photo.previewUrl ? 'ring-2 ring-primary' : ''}`}>
                                <div className="aspect-square relative group">
                                    {photo.previewUrl ? (
                                        <img src={photo.previewUrl} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-t-lg" />
                                    ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center">
                                            {uploadState.photoTempId === photo.tempId ? <Loader2 className="animate-spin" /> : <UploadCloud className="text-muted-foreground" />}
                                        </div>
                                    )}
                                    <div className="absolute top-1 right-1 flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 p-1 rounded">
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-yellow-400" onClick={() => handleSetCover(photo)}>
                                            <Star className={`h-4 w-4 ${collectionData.capaUrl === photo.previewUrl ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                        </Button>
                                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-white hover:text-red-400" onClick={() => removePhoto(photo)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-2">
                                        <Input 
                                            className="h-6 text-xs bg-transparent border-none text-white focus-visible:ring-0 placeholder:text-white/50" 
                                            placeholder="Título..." 
                                            value={photo.titulo} 
                                            onChange={(e) => updatePhoto(photo, 'titulo', e.target.value)} 
                                        />
                                    </div>
                                </div>
                                <div className="p-2 gap-1 flex flex-col">
                                    <div className="flex items-center gap-1">
                                         <Input className="h-6 text-xs" placeholder="Tags..." value={Array.isArray(photo.tags) ? photo.tags.join(', ') : photo.tags} onChange={(e) => updatePhoto(photo, 'tags', e.target.value)} />
                                         <Button 
                                            type="button" 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-6 w-6 text-yellow-500"
                                            onClick={() => handleAnalyzePhoto(photo)}
                                            disabled={analyzingId === photo.tempId}
                                         >
                                            <Sparkles className="h-3 w-3" />
                                         </Button>
                                    </div>
                                </div>
                                </Card>
                            ))}
                        </div>
                        )}
                    </div>
                </CardContent>
             </Card>
        </TabsContent>

        {/* --- TAB 3: PREÇOS --- */}
        <TabsContent value="precos" className="space-y-4 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Precificação</CardTitle>
                    <CardDescription>Defina o valor base e descontos progressivos.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    {/* Main Price Card */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-4">
                        <Label htmlFor="price-base" className="text-lg font-medium text-primary">Preço Unitário da Foto</Label>
                        <div className="relative max-w-[200px] w-full">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">R$</span>
                            <Input 
                                id="price-base" 
                                type="number" 
                                className="pl-12 h-14 text-2xl font-bold text-center bg-background border-primary/30 focus-visible:ring-primary shadow-sm"
                                value={collectionData.precoFoto} 
                                onChange={(e) => handleCollectionDataChange('precoFoto', e.target.value)} 
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">Este é o valor padrão para uma única foto.</p>
                    </div>

                    <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-6">
                             <div className="space-y-1">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-500" />
                                    Pacotes de Desconto
                                </h3>
                                <p className="text-sm text-muted-foreground">Incentive a compra de mais fotos oferecendo preços menores.</p>
                             </div>
                             <Button type="button" variant="outline" size="sm" onClick={addDiscount} className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800">
                                <PlusCircle className="mr-2 h-4 w-4" /> Novo Pacote
                             </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(!collectionData.descontos || collectionData.descontos.length === 0) && (
                                <div className="col-span-full text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground bg-muted/30">
                                    <p>Nenhuma regra de desconto ativa.</p>
                                    <p className="text-xs mt-1">Clique em "Novo Pacote" para criar uma.</p>
                                </div>
                            )}
                            
                            {collectionData.descontos?.map((discount, index) => (
                                <div key={index} className="relative group border rounded-xl p-4 bg-card shadow-sm hover:shadow-md transition-all flex flex-col gap-3">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                        onClick={() => removeDiscount(index)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>

                                    <div className="flex items-center justify-between gap-2">
                                        <div className="space-y-1 flex-1">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Quantidade Mínima</Label>
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    type="number" 
                                                    className="h-9 font-medium" 
                                                    value={discount.min} 
                                                    onChange={(e) => updateDiscount(index, 'min', e.target.value)}
                                                />
                                                <span className="text-sm font-medium">fotos</span>
                                            </div>
                                        </div>
                                        <ArrowLeft className="h-4 w-4 text-muted-foreground rotate-180" />
                                        <div className="space-y-1 flex-1 text-right">
                                            <Label className="text-xs text-muted-foreground uppercase tracking-wide text-green-600">Novo Preço Unitário</Label>
                                            <div className="relative">
                                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">R$</span>
                                                <Input 
                                                    type="number" 
                                                    className="h-9 pl-7 font-bold text-green-600 text-right" 
                                                    value={discount.price} 
                                                    onChange={(e) => updateDiscount(index, 'price', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-center bg-muted/50 py-1 rounded">
                                        Cliente paga <span className="font-bold text-green-700">R$ {(discount.price * discount.min).toFixed(2)}</span> por {discount.min} fotos
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

        {/* --- TAB 4: PUBLICAÇÃO --- */}
        <TabsContent value="publicacao" className="space-y-4 mt-6">
            <Card>
                <CardHeader>
                    <CardTitle>Publicar Coleção</CardTitle>
                    <CardDescription>Revise e coloque sua coleção no ar.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center space-x-2">
                        <Label className="font-medium">Status Atual:</Label>
                        <Select value={collectionData.status} onValueChange={(value) => handleCollectionDataChange('status', value)}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="RASCUNHO">Rascunho (Privado)</SelectItem>
                                <SelectItem value="PUBLICADA">✨ Publicada (Visível)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {initialCollection.slug && (
                        <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                            <Label>Link Público</Label>
                            <div className="flex gap-2">
                                <Input readOnly value={typeof window !== 'undefined' ? `${window.location.origin}/colecoes/${initialCollection.slug}` : ''} className="font-mono text-sm" />
                                <Button size="icon" variant="outline" onClick={() => {
                                   if (typeof window !== 'undefined') {
                                       navigator.clipboard.writeText(`${window.location.origin}/colecoes/${initialCollection.slug}`);
                                       toast.success("Copiado!");
                                   }
                                }}>
                                    <Share2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-8 border-t">
                         <Button type="button" variant="outline" className="text-red-500 border-red-200 hover:bg-red-50" onClick={() => setDeleteOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir Coleção Permanentemente
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </TabsContent>

      </Tabs>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Coleção</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita e todas as fotos serão perdidas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleDeleteCollection} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
