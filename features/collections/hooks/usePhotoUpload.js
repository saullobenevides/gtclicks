import { useState } from 'react';
import { toast } from "sonner";
import { extractMetadata } from '../utils/metadata';

export function usePhotoUpload(collectionId, currentFolder) {
  const [uploadState, setUploadState] = useState({ photoTempId: null, label: '' });

  const uploadFromDevice = async (photoToUpload, file) => {
    if (!file) return;
    setUploadState({ photoTempId: photoToUpload.tempId, label: `Extraindo metadados...` });

    try {
      const metadata = await extractMetadata(file);
      setUploadState({ photoTempId: photoToUpload.tempId, label: `Enviando arquivo original...` });
      
      const originalPresign = await fetch("/api/upload", { 
          method: "POST", 
          headers: { "Content-Type": "application/json" }, 
          body: JSON.stringify({ filename: file.name, contentType: file.type, folder: "originals" }) 
      }).then(r => r.json());

      if (originalPresign.error) throw new Error("Falha ao gerar URL de upload");

      await fetch(originalPresign.uploadUrl, { 
          method: "PUT", 
          headers: { "Content-Type": file.type || "application/octet-stream" }, 
          body: file 
      });

      setUploadState({ photoTempId: photoToUpload.tempId, label: `Processando (Marca d'água + IA)...` });
      
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; });

      const processRes = await fetch("/api/photos/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          s3Key: originalPresign.s3Key,
          width: img.width, height: img.height,
          titulo: file.name.split('.')[0],
          ...metadata,
          colecaoId: collectionId,
          folderId: currentFolder?.id || null, 
        }),
      });

      const processData = await processRes.json();
      if (!processRes.ok) throw new Error(processData?.error || "Erro ao processar foto");

      setUploadState({ photoTempId: null, label: '' });
      return {
        ...photoToUpload,
        id: processData.foto.id, 
        s3Key: originalPresign.s3Key,
        previewUrl: processData.foto.previewUrl, 
        titulo: processData.foto.titulo,
        ...metadata,
        folderId: currentFolder?.id || null
      };
    } catch (error) {
      console.error(error);
      setUploadState({ photoTempId: null, label: '' });
      toast.error(error.message);
      throw error;
    }
  };

  const handleFileSelect = async (photo, file, onUpdatePhoto) => {
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) { 
        toast.error(`Formato inválido: ${file.name}`); 
        return; 
    }
    
    // Check orientation
    const img = new Image();
    img.onload = () => { 
        const orientation = img.width > img.height ? 'HORIZONTAL' : 'VERTICAL'; 
        onUpdatePhoto(photo, 'orientacao', orientation); 
    };
    img.src = URL.createObjectURL(file);
    
    return await uploadFromDevice(photo, file);
  };

  return {
    uploadState,
    handleFileSelect
  };
}
