import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import sharp from "sharp";
import exifReader from "exif-reader";
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

    // EXIF Extraction
    let dataCaptura = null;
    if (metadata.exif) {
      try {
        const exifData = exifReader(metadata.exif);
        if (exifData) {
          // Try multiple date fields (exif-reader often uses capitalized group names)
          const dt =
            exifData.Photo?.DateTimeOriginal ||
            exifData.exif?.DateTimeOriginal ||
            exifData.Image?.DateTime ||
            exifData.image?.DateTime ||
            exifData.Image?.ModifyDate ||
            exifData.image?.ModifyDate;

          if (dt && dt instanceof Date && !isNaN(dt.getTime())) {
            dataCaptura = dt;
          } else if (dt && typeof dt === "string") {
            // Manual parse for standard EXIF string: "YYYY:MM:DD HH:MM:SS"
            // or ISO format "YYYY-MM-DDTHH:MM:SS"
            try {
              // Create a localized date parsing attempt
              // 1. Try standard ISO/Date constructor first (covers YYYY-MM-DD)
              const isoTry = new Date(dt);
              if (!isNaN(isoTry.getTime())) {
                dataCaptura = isoTry;
              } else {
                // 2. Fallback to EXIF specific format "YYYY:MM:DD HH:MM:SS"
                const parts = dt.split(/[:\s]/).map(Number);
                if (parts.length >= 6 && !parts.some(isNaN)) {
                  const dateObj = new Date(
                    parts[0],
                    parts[1] - 1,
                    parts[2],
                    parts[3],
                    parts[4],
                    parts[5]
                  );
                  if (!isNaN(dateObj.getTime())) {
                    dataCaptura = dateObj;
                  }
                }
              }
            } catch (e) {
              console.warn(
                `[Processing] Date parse fallback failed for '${dt}':`,
                e.message
              );
            }
          }
        }
      } catch (exifErr) {
        console.warn("[Processing] EXIF parsing error:", exifErr.message);
      }
    }

    let pipeline = image.rotate();

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
      });
    }

    const resizedBuffer = await pipeline.toBuffer();

    // 4. Apply Tiled Text Watermark (tamanho fixo para todas orientações)
    try {
      // Tamanho fixo: mesma célula e fonte para horizontal, vertical, quadrado
      const TILE_SIZE = 200;
      const FONT_SIZE = 32;

      console.log(
        `[Processing] Generating tiled watermark. Tile: ${TILE_SIZE}px, Font: ${FONT_SIZE}px (fixed for all sizes)`
      );

      // Create SVG com texto repetido em célula fixa
      const svgText = `
        <svg width="${TILE_SIZE}" height="${TILE_SIZE}" xmlns="http://www.w3.org/2000/svg">
          <style>
            .text { 
              fill: rgba(255, 255, 255, 0.45); 
              font-size: ${FONT_SIZE}px; 
              font-weight: bold; 
              font-family: Arial, sans-serif;
              text-anchor: middle;
              alignment-baseline: middle;
            }
          </style>
          <text x="50%" y="50%" class="text" transform="rotate(-45, ${
            TILE_SIZE / 2
          }, ${TILE_SIZE / 2})">GT Clicks</text>
        </svg>
      `;

      const watermarkBuffer = Buffer.from(svgText);

      const watermarkedBuffer = await sharp(resizedBuffer)
        .composite([
          {
            input: watermarkBuffer,
            tile: true,
            opacity: 1.0, // Opacity is handled in SVG fill
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
        dataCaptura,
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
        dataCaptura,
      };
    }
  } catch (error) {
    console.error(`[Processing] Critical Error details:`, error);
    throw error;
  }
}

/**
 * Generates a clean (non-watermarked) cover image from an existing S3 key.
 * Resizes to max 1600px and uploads to 'previews/' folder to ensure public access.
 */
export async function generateCoverImage(s3Key) {
  try {
    console.log(`[Cover Generation] Starting for ${s3Key}`);

    // 1. Download Original
    const originalBuffer = await downloadFromS3(s3Key);

    // 2. Load into Sharp
    const image = sharp(originalBuffer);
    const metadata = await image.metadata();

    // 3. Resize (Max 1600px)
    const MAX_DIMENSION = 1600;
    let pipeline = image.rotate();

    if (metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
      pipeline = pipeline.resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
      });
    }

    // 4. Output as JPEG (Clean, No Watermark)
    const coverBuffer = await pipeline
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer();

    // 5. Upload to 'previews/' (using 'previews/' to inherit public bucket policy)
    const originalName = s3Key.split("/").pop();
    const timestamp = Date.now();
    // Prefix with 'cover-' to distinguish, but keep in previews folder
    const coverKey = `previews/cover-${timestamp}-${originalName}`;

    console.log(`[Cover Generation] Uploading cover to ${coverKey}...`);
    const coverUrl = await uploadToS3(coverKey, coverBuffer, "image/jpeg");

    return coverUrl;
  } catch (error) {
    console.error(`[Cover Generation] Failed:`, error);
    throw error;
  }
}
