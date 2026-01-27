import {
  RekognitionClient,
  IndexFacesCommand,
  SearchFacesByImageCommand,
  CreateCollectionCommand,
  ListCollectionsCommand,
  DeleteFacesCommand,
} from "@aws-sdk/client-rekognition";

const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;
const collectionId = process.env.REKOGNITION_COLLECTION_ID || "gtclicks-faces";

const rekognitionClient = new RekognitionClient({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Garantia de que a coleção do Rekognition existe
 */
export async function ensureCollectionExists() {
  try {
    const listCommand = new ListCollectionsCommand({});
    const response = await rekognitionClient.send(listCommand);

    if (!response.CollectionIds?.includes(collectionId)) {
      console.log(`[Rekognition] Criando coleção: ${collectionId}`);
      const createCommand = new CreateCollectionCommand({
        CollectionId: collectionId,
      });
      await rekognitionClient.send(createCommand);
    }
    return true;
  } catch (error) {
    console.error("[Rekognition] Erro ao verificar/criar coleção:", error);
    return false;
  }
}

/**
 * Indexa faces de uma imagem no S3
 * @param {string} s3Bucket
 * @param {string} s3Key
 * @param {string} externalImageId - ID da Foto no Prisma
 */
export async function indexPhotoFaces(s3Bucket, s3Key, externalImageId) {
  try {
    await ensureCollectionExists();

    const command = new IndexFacesCommand({
      CollectionId: collectionId,
      Image: {
        S3Object: {
          Bucket: s3Bucket,
          Name: s3Key,
        },
      },
      ExternalImageId: externalImageId,
      MaxFaces: 50,
      QualityFilter: "AUTO",
      DetectionAttributes: ["DEFAULT"],
    });

    const response = await rekognitionClient.send(command);
    return {
      success: true,
      faceCount: response.FaceRecords?.length || 0,
      indexedFaces: response.FaceRecords?.map((f) => f.Face?.FaceId) || [],
    };
  } catch (error) {
    console.error(`[Rekognition] Erro ao indexar faces para ${s3Key}:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * Pesquisa fotos por uma imagem de selfie (buffer)
 * @param {Buffer} imageBuffer
 */
export async function searchByFace(imageBuffer) {
  try {
    const command = new SearchFacesByImageCommand({
      CollectionId: collectionId,
      Image: {
        Bytes: imageBuffer,
      },
      MaxFaces: 100,
      FaceMatchThreshold: 85, // Threshold de 85% de confiança
    });

    const response = await rekognitionClient.send(command);

    // Retorna os ExternalImageIds das fotos correspondentes
    const matchedPhotoIds = [
      ...new Set(
        response.FaceMatches?.map((m) => m.Face?.ExternalImageId).filter(
          Boolean,
        ),
      ),
    ];

    return {
      success: true,
      matchedPhotoIds,
      matches: response.FaceMatches,
    };
  } catch (error) {
    console.error("[Rekognition] Erro ao pesquisar por face:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Remove faces indexadas de uma foto
 * @param {string[]} faceIds
 */
export async function deleteIndexedFaces(faceIds) {
  if (!faceIds || faceIds.length === 0) return { success: true };

  try {
    const command = new DeleteFacesCommand({
      CollectionId: collectionId,
      FaceIds: faceIds,
    });
    await rekognitionClient.send(command);
    return { success: true };
  } catch (error) {
    console.error("[Rekognition] Erro ao deletar faces:", error);
    return { success: false, error: error.message };
  }
}
