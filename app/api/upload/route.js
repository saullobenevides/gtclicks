import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import prisma from "@/lib/prisma";
import { uploadRequestSchema } from "@/lib/validations";
import { getAuthenticatedUser } from "@/lib/auth";

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
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
  });

  if (!fotografo) {
    return NextResponse.json({ error: "Perfil de fotografo nao encontrado ou nao autorizado" }, { status: 403 });
  }

  if (!s3Client) {
    return NextResponse.json(
      { error: "S3 nao configurado." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const validation = uploadRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: validation.error.format() },
        { status: 400 }
      );
    }

    const { filename, contentType, folder = "uploads" } = validation.data;

    const fileExtension = filename.split(".").pop();
    const uniqueId = randomUUID();
    const s3Key = `${folder}/${uniqueId}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: s3Key,
      ContentType: contentType || "application/octet-stream",
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

    return NextResponse.json({
      uploadUrl,
      s3Key,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return NextResponse.json(
      { error: "Erro ao gerar URL de upload" },
      { status: 500 }
    );
  }
}
