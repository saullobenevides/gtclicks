import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getS3Client, s3Config } from "@/lib/s3-client";

/**
 * Delete a single file from S3
 * @param {string} key - S3 object key
 */
export async function deleteFromS3(key) {
  if (!key) return;

  const s3Client = getS3Client();
  if (!s3Client) {
    console.error("[S3] Cannot delete: S3 client not initialized.");
    return;
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
    });
    await s3Client.send(command);
    console.log(`[S3] Deleted object: ${key}`);
  } catch (error) {
    console.error(`[S3] Error deleting object ${key}:`, error);
  }
}

/**
 * Delete multiple files from S3
 * @param {string[]} keys - Array of S3 object keys
 */
export async function deleteManyFromS3(keys) {
  if (!keys || keys.length === 0) return;

  const s3Client = getS3Client();
  if (!s3Client) {
    console.error("[S3] Cannot delete many: S3 client not initialized.");
    return;
  }

  if (!s3Config.bucket) {
    console.error("[S3] Cannot delete many: S3 bucket not configured.");
    return;
  }

  try {
    const chunkSize = 1000;
    for (let i = 0; i < keys.length; i += chunkSize) {
      const chunk = keys.slice(i, i + chunkSize);
      const objects = chunk.map((key) => ({ Key: key }));

      const command = new DeleteObjectsCommand({
        Bucket: s3Config.bucket,
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
    throw error;
  }
}

/**
 * Delete multiple photos and their previews from S3
 * @param {string[]} s3Keys - Array of original S3 object keys
 */
export async function deleteManyPhotoFiles(s3Keys) {
  if (!s3Keys || s3Keys.length === 0) return;

  const allKeysToDelete = [];

  s3Keys.forEach((key) => {
    if (!key) return;
    allKeysToDelete.push(key);

    // Preview files are stored in previews/ using the same original filename
    const fileName = key.split("/").pop();
    allKeysToDelete.push(`previews/${fileName}`);
  });

  if (allKeysToDelete.length > 0) {
    try {
      console.log(
        `[S3 Cleanup] Targeting ${allKeysToDelete.length} files (originals + previews)`,
      );
      await deleteManyFromS3(allKeysToDelete);
    } catch (error) {
      console.error(
        "[S3 Cleanup] Failed to delete some files from S3, continuing anyway...",
        error,
      );
    }
  }
}
