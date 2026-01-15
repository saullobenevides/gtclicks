import { S3Client, DeleteObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Delete a single file from S3
 * @param {string} key - S3 object key
 */
export async function deleteFromS3(key) {
  if (!key) return;

  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`[S3] Deleted object: ${key}`);
  } catch (error) {
    console.error(`[S3] Error deleting object ${key}:`, error);
    // Don't throw, just log. We don't want to break the app flow if S3 fails locally or for non-critical cleanups.
  }
}

/**
 * Delete multiple files from S3
 * @param {string[]} keys - Array of S3 object keys
 */
export async function deleteManyFromS3(keys) {
  if (!keys || keys.length === 0) return;

  try {
    // S3 deleteObjects is limited to 1000 objects per request
    const chunkSize = 1000;
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      const objects = chunk.map((key) => ({ Key: key }));

      const command = new DeleteObjectsCommand({
        Bucket: process.env.S3_UPLOAD_BUCKET,
        Delete: {
          Objects: objects,
          Quiet: true,
        },
      });

      await s3Client.send(command);
      console.log(`[S3] Deleted batch of ${chunk.length} objects`);
    }
  } catch (error) {
    console.error(`[S3] Error deleting multiple objects:`, error);
  }
}
