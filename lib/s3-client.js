import { S3Client } from "@aws-sdk/client-s3";

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

// Singleton instance
let clientInstance = null;

export function getS3Client() {
  if (clientInstance) return clientInstance;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    // Only warn in development, or return null to handle gracefully
    console.warn("S3 Configuration missing in environment variables.");
    return null;
  }

  clientInstance = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return clientInstance;
}

export const s3Config = {
  bucket,
  region,
};
