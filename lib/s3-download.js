import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getS3Client, s3Config } from "@/lib/s3-client";

const s3Client = getS3Client();

/**
 * Generate a presigned URL for downloading a file from S3
 * @param {string} key - S3 object key (file path)
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} - Presigned download URL
 */
export async function generateDownloadUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: s3Config.bucket,
      Key: key,
      ResponseContentDisposition: `attachment; filename="${key.split("/").pop()}"`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    throw error;
  }
}

/**
 * Extract S3 key from a full S3 URL
 * @param {string} s3Url - Full S3 URL
 * @returns {string} - S3 object key
 */
export function extractS3Key(s3Url) {
  if (!s3Url) return null;

  // Handle different S3 URL formats
  if (s3Url.includes(".s3.")) {
    // Format: https://bucket.s3.region.amazonaws.com/path/to/file
    const url = new URL(s3Url);
    return url.pathname.substring(1); // Remove leading /
  } else if (s3Url.startsWith("s3://")) {
    // Format: s3://bucket/path/to/file
    return s3Url.replace(/^s3:\/\/[^/]+\//, "");
  }

  return s3Url; // Already a key
}
