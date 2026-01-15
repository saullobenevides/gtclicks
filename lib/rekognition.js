import { RekognitionClient, CreateCollectionCommand, IndexFacesCommand, SearchFacesByImageCommand, DeleteFacesCommand, ListCollectionsCommand } from "@aws-sdk/client-rekognition";

const REGION = "us-east-1"; // Rekognition not available in sa-east-1
const COLLECTION_ID = "gtclicks-collection";

const rekognitionClient = new RekognitionClient({
  region: REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function createCollection() {
  try {
    const listCommand = new ListCollectionsCommand({});
    const existing = await rekognitionClient.send(listCommand);
    
    if (existing.CollectionIds && existing.CollectionIds.includes(COLLECTION_ID)) {
      console.log(`Collection ${COLLECTION_ID} already exists.`);
      return { success: true, message: "Collection already exists" };
    }

    const command = new CreateCollectionCommand({ CollectionId: COLLECTION_ID });
    await rekognitionClient.send(command);
    console.log(`Collection ${COLLECTION_ID} created.`);
    return { success: true, message: "Collection created" };
  } catch (error) {
    console.error("Error creating collection:", error);
    throw error;
  }
}

export async function indexFace(input, photoId) {
  try {
    const imageParam = input.s3Object 
      ? { S3Object: { Bucket: input.s3Object.Bucket, Name: input.s3Object.Name } }
      : { Bytes: input.imageBuffer };

    const command = new IndexFacesCommand({
      CollectionId: COLLECTION_ID,
      Image: imageParam,
      ExternalImageId: photoId, 
      DetectionAttributes: ["DEFAULT"],
      MaxFaces: 10, 
      QualityFilter: "AUTO",
    });

    const response = await rekognitionClient.send(command);
    console.log(`Indexed face for photo ${photoId}:`, response.FaceRecords?.length || 0, "faces found.");
    return response;
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
        console.log("Collection not found, creating...");
        await createCollection();
        // Retry once
        return indexFace(input, photoId);
    }
    console.error("Error indexing face:", error);
    throw error;
  }
}

export async function searchFaces(imageBuffer) {
  try {
    const command = new SearchFacesByImageCommand({
      CollectionId: COLLECTION_ID,
      Image: {
        Bytes: imageBuffer,
      },
      MaxFaces: 1000, // Increased limit to find all photos of the person
      FaceMatchThreshold: 85, // Confidence threshold
    });

    const response = await rekognitionClient.send(command);
    return response.FaceMatches;
  } catch (error) {
    console.error("Error searching faces:", error);
    throw error;
  }
}

export async function deleteFaces(faceIds) {
  try {
    const command = new DeleteFacesCommand({
      CollectionId: COLLECTION_ID,
      FaceIds: faceIds,
    });

    const response = await rekognitionClient.send(command);
    return response;
  } catch (error) {
    console.error("Error deleting faces:", error);
    throw error;
  }
}
