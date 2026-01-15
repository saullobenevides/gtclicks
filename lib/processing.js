import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import prisma from "./prisma";
import path from "path";

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

/**
 * Downloads a file from S3 and returns it as a Buffer.
 */
async function downloadFromS3(key) {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });
  const response = await s3Client.send(command);
  const stream = response.Body;
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}

/**
 * Uploads a buffer to S3.
 */
async function uploadToS3(key, buffer, contentType = "image/jpeg") {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  });
  await s3Client.send(command);
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

/**
 * Main processing function:
 * 1. Download Original
 * 2. Resize & Optimize
 * 3. Apply Watermark -> Save as Preview
 * 4. Upload Preview
 */
export async function processUploadedImage(s3Key, photoId) {
  console.log(`[Processing] Starting for ${s3Key} (Photo ID: ${photoId})`);

  try {
    // 1. Download Original
    const originalBuffer = await downloadFromS3(s3Key);

    // 2. Load into Sharp
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();

    // 3. Optimize for Preview
    const MAX_DIMENSION = 1600;
    let pipeline = image.rotate();

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
      });
    }

    const resizedBuffer = await pipeline.toBuffer();

    // 4. Apply Tiled Watermark
    try {
      const watermarkPath = path.join(
        process.cwd(),
        "public",
        "watermark-custom.png"
      );

      const watermarkBuffer = await sharp(watermarkPath)
        .resize(200, 200, {
          fit: "contain",
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .toBuffer();

      const watermarkedBuffer = await sharp(resizedBuffer)
        .composite([
          {
            input: watermarkBuffer,
            tile: true,
            opacity: 0.4,
          },
        ])
        .jpeg({ quality: 80, mozjpeg: true })
        .toBuffer();

      // 5. Upload Preview
      const originalName = s3Key.split("/").pop();
      const previewKey = `previews/${originalName}`;

      console.log(`[Processing] Uploading preview to ${previewKey}...`);
      const previewUrl = await uploadToS3(
        previewKey,
        watermarkedBuffer,
        "image/jpeg"
      );

      return {
        success: true,
        previewUrl,
        previewKey,
      };
    } catch (watermarkError) {
      console.error(
        "[Processing] Watermarking failed, uploading non-watermarked preview",
        watermarkError
      );
      const originalName = s3Key.split("/").pop();
      const previewKey = `previews/${originalName}`;
      const previewUrl = await uploadToS3(
        previewKey,
        resizedBuffer,
        "image/jpeg"
      );

      return {
        success: true,
        previewUrl,
        previewKey,
      };
    }
  } catch (error) {
    console.error(`[Processing] Critical Error details:`, error);
    throw error;
  }
}
