import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const bucket = process.env.S3_UPLOAD_BUCKET;
const region = process.env.S3_UPLOAD_REGION;
const accessKeyId = process.env.S3_UPLOAD_ACCESS_KEY_ID;
const secretAccessKey = process.env.S3_UPLOAD_SECRET_ACCESS_KEY;

const s3Client = new S3Client({
  region,
  credentials: { accessKeyId, secretAccessKey },
});

export async function GET(request, { params }) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.json({ error: "Token invalido" }, { status: 400 });
    }

    // Find ItemPedido by downloadToken
    const item = await prisma.itemPedido.findFirst({
      where: { downloadToken: token },
      include: {
        pedido: true,
        foto: true,
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Link invalido ou expirado" }, { status: 404 });
    }

    // Check if order is paid
    if (item.pedido.status !== "PAGO") {
      return NextResponse.json({ error: "Pedido nao processado" }, { status: 403 });
    }

    // Generate S3 Signed URL for download
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: item.foto.s3Key,
      ResponseContentDisposition: `attachment; filename="${item.foto.titulo}.jpg"`,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minutes

    // Increment download count
    await prisma.itemPedido.update({
      where: { id: item.id },
      data: { downloadsCount: { increment: 1 } },
    });

    // Redirect to S3 URL
    return NextResponse.redirect(url);
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Erro ao processar download" }, { status: 500 });
  }
}
