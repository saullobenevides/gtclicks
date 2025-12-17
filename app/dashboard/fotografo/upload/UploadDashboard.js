'use client';


import { useEffect, useState } from 'react';
import { useUser } from '@stackframe/stack';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { UploadCloud, Trash2, PlusCircle, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from "sonner";

// ... (existing constants)

const orientationOptions = ['HORIZONTAL', 'VERTICAL', 'PANORAMICA', 'QUADRADO'];

const blankPhoto = () => ({
  id: null,
  titulo: '',
  descricao: '',
  previewUrl: '',
  s3Key: '',
  previewS3Key: '',
  tags: '',
  orientacao: 'HORIZONTAL',
  licencas: [],
});

import EXIF from 'exif-js';

// ... (keep extractMetadata and generatePreview as is)
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

      // Format shutter speed
      let formattedShutterSpeed = null;
      if (shutterSpeed) {
        if (shutterSpeed < 1) {
          formattedShutterSpeed = `1/${Math.round(1/shutterSpeed)}`;
        } else {
          formattedShutterSpeed = `${shutterSpeed}`;
        }
      }

      resolve({
        camera: make && model ? `${make} ${model}` : (model || make || null),
        lens: lens || null,
        focalLength: focalLength ? `${focalLength}mm` : null,
        iso: iso || null,
        shutterSpeed: formattedShutterSpeed,
        aperture: aperture ? `f/${aperture}` : null,
      });
    });
  });
};

const generatePreview = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;
  
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
  
        canvas.width = width;
        canvas.height = height;
  
        ctx.drawImage(img, 0, 0, width, height);
  
        // Watermark
        ctx.save();
        ctx.globalAlpha = 0.4;
        ctx.font = `bold ${width * 0.08}px Arial`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Center watermark
        ctx.translate(width / 2, height / 2);
        ctx.rotate(-30 * Math.PI / 180);
        ctx.fillText('GT Clicks Preview', 0, 0);
        
        // Repeat smaller watermarks
        ctx.restore();
        ctx.save();
        ctx.globalAlpha = 0.15;
        ctx.font = `bold ${width * 0.04}px Arial`;
        ctx.fillStyle = 'white';
        
        const stepX = width / 3;
        const stepY = height / 3;
        
        for (let x = stepX/2; x < width; x += stepX) {
          for (let y = stepY/2; y < height; y += stepY) {
             if (Math.abs(x - width/2) > stepX/2 || Math.abs(y - height/2) > stepY/2) {
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(-30 * Math.PI / 180);
                ctx.fillText('GT Clicks', 0, 0);
                ctx.restore();
             }
          }
        }
        ctx.restore();
  
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to generate preview blob"));
          }
        }, 'image/jpeg', 0.60); // Lower quality for preview
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

export default function UploadDashboard() {
  const user = useUser({ or: 'anonymous' });
  const isAuthenticated = Boolean(user && !user.isAnonymous && user.id);

  const [fotografoId, setFotografoId] = useState('');
  const [fotografoLookup, setFotografoLookup] = useState({ loading: true, error: '', data: null });
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [photos, setPhotos] = useState([blankPhoto()]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadState, setUploadState] = useState({ index: null, label: '' });
  const [availableLicenses, setAvailableLicenses] = useState([]);

  useEffect(() => {
    fetch('/api/licencas')
      .then((res) => res.json())
      .then((data) => setAvailableLicenses(data.data || []))
      .catch((err) => console.error('Failed to fetch licenses:', err));
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      setFotografoLookup({ loading: false, error: '', data: null });
      setFotografoId('');
      return;
    }

    let cancelled = false;
    setFotografoLookup({ loading: true, error: '', data: null });
    fetch(`/api/fotografos/resolve?userId=${user.id}`)
      .then(async (res) => {
        const payload = await res.json();
        if (!res.ok) throw new Error(payload?.error || 'Não encontramos seu perfil.');
        return payload.data;
      })
      .then((data) => {
        if (cancelled) return;
        setFotografoLookup({ loading: false, error: '', data });
        setFotografoId(data?.id ?? '');
      })
      .catch((err) => {
        if (cancelled) return;
        setFotografoLookup({ loading: false, error: err.message, data: null });
      });
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id]);

  const handleCreateProfile = async () => {
    if (!user) return;
    setCreatingProfile(true);
    try {
      const response = await fetch('/api/fotografos/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: user.displayName || 'Fotógrafo',
          email: user.primaryEmail || `${user.id}@gtclicks.temp`,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Erro ao criar perfil');
      
      setFotografoId(data.data.id);
      setFotografoLookup({ loading: false, error: '', data: data.data });
      toast.success('Perfil criado com sucesso! Agora você pode publicar fotos.');
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setCreatingProfile(false);
    }
  };

  const addPhoto = () => {
    setPhotos([...photos, blankPhoto()]);
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const updatePhoto = (index, field, value) => {
    setPhotos(photos.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  const updateLicense = (index, licenseId, field, value) => {
    setPhotos(photos.map((p, i) => {
      if (i !== index) return p;
      const currentLicenses = p.licencas || [];
      const licenseIndex = currentLicenses.findIndex((l) => l.licencaId === licenseId);
      
      let newLicenses = [...currentLicenses];
      if (licenseIndex >= 0) {
        newLicenses[licenseIndex] = { ...newLicenses[licenseIndex], [field]: value };
      } else {
        newLicenses.push({ licencaId: licenseId, [field]: value });
      }
      return { ...p, licencas: newLicenses };
    }));
  };

  const uploadFromDevice = async (index, file) => {
    if (!file) return;
    setUploadState({ index, label: `Extraindo metadados...` });

    try {
      const metadata = await extractMetadata(file);
      
      setUploadState({ index, label: `Gerando preview...` });
      const previewBlob = await generatePreview(file);
      
      setUploadState({ index, label: `Enviando arquivos...` });

      const [originalPresign, previewPresign] = await Promise.all([
        fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "originals" }),
        }).then(r => r.json()),
        fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: `preview_${file.name}`, contentType: "image/jpeg", folder: "previews" }),
        }).then(r => r.json())
      ]);

      if (originalPresign.error || previewPresign.error) {
        throw new Error("Falha ao gerar URLs de upload");
      }

      await Promise.all([
        fetch(originalPresign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        }),
        fetch(previewPresign.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": "image/jpeg" },
          body: previewBlob,
        })
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
          width: img.width,
          height: img.height,
          titulo: file.name.split('.')[0],
          ...metadata // Pass extracted metadata
        }),
      });

      const processData = await processRes.json();
      if (!processRes.ok) throw new Error(processData?.error || "Erro ao processar foto");

      setPhotos((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          id: processData.foto.id,
          s3Key: originalPresign.s3Key,
          previewS3Key: previewPresign.s3Key,
          previewUrl: processData.foto.previewUrl,
          titulo: processData.foto.titulo,
          ...metadata // Update local state with metadata
        };
        return next;
      });

      setUploadState({ index: null, label: '' });
      toast.success('Upload concluído! Preencha os detalhes e publique.');
    } catch (error) {
      console.error(error);
      setUploadState({ index: null, label: '' });
      toast.error(error.message);
    }
  };

  const handleFileSelect = async (index, file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use apenas JPG, PNG ou WebP.');
      return;
    }
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('Arquivo muito grande. Tamanho máximo: 50MB');
      return;
    }
    const img = new Image();
    img.onload = () => {
      const orientation = img.width > img.height ? 'HORIZONTAL' : 'VERTICAL';
      updatePhoto(index, 'orientacao', orientation);
    };
    img.src = URL.createObjectURL(file);

    await uploadFromDevice(index, file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!fotografoId) {
      toast.error('ID de fotógrafo não encontrado.');
      return;
    }

    setSubmitting(true);

    const payload = {
      fotografoId,
      fotos: photos.filter((p) => p.id).map((p) => ({ ...p, licencas: p.licencas?.filter((l) => l.enabled && l.preco) || [] })),
    };

    try {
      const response = await fetch('/api/fotos/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Falha ao salvar as fotos');
      toast.success('Fotos publicadas com sucesso!');
      setPhotos([blankPhoto()]);
    } catch (error) {
        toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (fotografoLookup.loading) {
    return <div>Carregando perfil...</div>;
  }

  if (fotografoLookup.error && !fotografoLookup.data?.id) {
    return (
      <Card className="text-center">
        <CardHeader>
          <CardTitle>Bem-vindo ao GTClicks!</CardTitle>
          <CardDescription>Para começar a publicar, crie seu perfil de fotógrafo.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleCreateProfile} disabled={creatingProfile}>
            {creatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {creatingProfile ? 'Criando perfil...' : 'Criar Perfil de Fotógrafo'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader className="flex-row items-center justify-between">
                <CardTitle>Foto #{index + 1}</CardTitle>
                {photos.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removePhoto(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex flex-grow flex-col gap-4">
                <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed">
                  <Label htmlFor={`file-upload-${index}`} className="flex cursor-pointer flex-col items-center gap-2 text-center text-muted-foreground">
                    <UploadCloud className="h-8 w-8" />
                    <input id={`file-upload-${index}`} type="file" accept="image/*" onChange={(e) => handleFileSelect(index, e.target.files?.[0])} className="hidden" />
                    {uploadState.index === index ? (
                      <span>{uploadState.label}</span>
                    ) : photo.s3Key ? (
                      <span className="text-green-500">✓ Upload Concluído</span>
                    ) : (
                      <span>Clique ou arraste para enviar</span>
                    )}
                  </Label>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`titulo-${index}`}>Título</Label>
                  <Input id={`titulo-${index}`} placeholder="Título da foto" value={photo.titulo} onChange={(e) => updatePhoto(index, 'titulo', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`descricao-${index}`}>Descrição</Label>
                  <Textarea id={`descricao-${index}`} placeholder="Descreva a foto..." value={photo.descricao} onChange={(e) => updatePhoto(index, 'descricao', e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`orientacao-${index}`}>Orientação</Label>
                  <Select value={photo.orientacao} onValueChange={(value) => updatePhoto(index, 'orientacao', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {orientationOptions.map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor={`tags-${index}`}>Tags</Label>
                  <Input id={`tags-${index}`} placeholder="natureza, brasil (separadas por vírgula)" value={photo.tags} onChange={(e) => updatePhoto(index, 'tags', e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label>Licenças e Preços</Label>
                  {availableLicenses.map((licenca) => {
                    const currentLicense = photo.licencas?.find((l) => l.licencaId === licenca.id);
                    const isEnabled = currentLicense?.enabled ?? false;
                    return (
                      <div key={licenca.id} className="flex items-center gap-4 rounded-md border p-3">
                        <Checkbox
                          id={`licenca-${index}-${licenca.id}`}
                          checked={isEnabled}
                          onCheckedChange={(checked) => updateLicense(index, licenca.id, 'enabled', checked)}
                        />
                        <Label htmlFor={`licenca-${index}-${licenca.id}`} className="flex-grow">{licenca.nome}</Label>
                        {isEnabled && (
                          <Input
                            type="number"
                            placeholder="R$ 0,00"
                            value={currentLicense?.preco ?? ''}
                            onChange={(e) => updateLicense(index, licenca.id, 'preco', e.target.value)}
                            className="w-28"
                            step="0.01" min="0"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button type="button" variant="ghost" onClick={addPhoto}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar outra foto
          </Button>
          <Button type="submit" size="lg" disabled={submitting || !isAuthenticated}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {submitting ? 'Publicando...' : 'Publicar Fotos'}
          </Button>
        </div>
      </form>
    </div>
  );
}
