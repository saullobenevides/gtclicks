import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const VARIANT_FOLDERS = {
  preview: "previews",
  original: "originais",
  raw: "uploads",
};

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

const s3Client =
  bucket && region && accessKeyId && secretAccessKey
    ? new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      })
    : null;

export async function POST(request) {
  if (!s3Client) {
    return NextResponse.json(
      { error: "S3 nao configurado. Ajuste as variaveis S3_UPLOAD_* no arquivo .env." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const {
      filename,
      contentType = "application/octet-stream",
      variant = "raw",
    } = body ?? {};

    if (!filename) {
      return NextResponse.json(
        { error: "Informe o nome do arquivo." },
        { status: 400 }
      );
    }

    const normalizedVariant =
      typeof variant === "string" ? variant.toLowerCase() : "raw";
    const folder = VARIANT_FOLDERS[normalizedVariant] ?? VARIANT_FOLDERS.raw;

    const safeName = filename
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]/g, "-")
      .replace(/-+/g, "-");
    const uniqueSuffix = `${Date.now()}-${randomUUID()}`;
    const key = `${folder}/${uniqueSuffix}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    const expiresIn = 15 * 60; // 15 minutos
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn });
    const encodedKey = key.split("/").map(encodeURIComponent).join("/");
    const fileUrl = `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;

    return NextResponse.json({
      uploadUrl,
      fileUrl,
      key,
      expiresIn,
      variant: normalizedVariant,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Falha ao gerar URL assinada.", details: error.message },
      { status: 500 }
    );
  }
}
