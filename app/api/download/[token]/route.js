import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY,
  },
});

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    // 1. Find the order item by token
    const item = await prisma.itemPedido.findFirst({
      where: { downloadToken: token },
      include: {
        pedido: true,
        foto: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        { error: "Download não encontrado" },
        { status: 404 },
      );
    }

    // 2. Verify if the order is PAID
    if (item.pedido.status !== "PAGO") {
      return NextResponse.json(
        { error: "Pedido não finalizado ou pagamento pendente" },
        { status: 403 },
      );
    }

    // 3. Generate Signed URL (valid for 5 minutes)
    const command = new GetObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: item.foto.s3Key,
      ResponseContentDisposition: `attachment; filename="${item.foto.titulo}.jpg"`, // Force download
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 300 seconds = 5 minutes

    // 4. Update download count (Photo and Collection)
    await prisma.foto.update({
      where: { id: item.fotoId },
      data: { downloads: { increment: 1 } },
    });

    if (item.foto.colecaoId) {
      await prisma.colecao.update({
        where: { id: item.foto.colecaoId },
        data: { downloads: { increment: 1 } },
      });
    }

    await prisma.itemPedido.update({
      where: { id: item.id },
      data: {
        downloadsCount: {
          increment: 1,
        },
      },
    });

    // 5. Redirect to the signed URL
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Download error details:", error);

    // Check for specific AWS errors
    if (error.name === "NoSuchKey") {
      return NextResponse.json(
        { error: "Arquivo não encontrado no armazenamento (S3)" },
        { status: 404 },
      );
    }
    if (
      error.Code === "AccessDenied" ||
      error.$metadata?.httpStatusCode === 403
    ) {
      return NextResponse.json(
        { error: "Erro de permissão no S3 (AccessDenied)" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        error: "Erro ao processar download",
        details: error.message,
        missingEnv: !process.env.S3_UPLOAD_ACCESS_KEY_ID
          ? "AWS Keys Missing"
          : null,
      },
      { status: 500 },
    );
  }
}
