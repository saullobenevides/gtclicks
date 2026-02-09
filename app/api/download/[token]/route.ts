import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getAuthenticatedUser } from "@/lib/auth";
import { checkDownloadRateLimit } from "@/lib/rate-limit";

const MAX_DOWNLOADS_PER_PURCHASE = 10;

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_UPLOAD_SECRET_ACCESS_KEY ?? "",
  },
});

function getClientIdentifier(request: Request, token: string): string {
  try {
    const forwarded = request.headers?.get?.("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    return `download:${ip}:${token}`;
  } catch {
    return `download:unknown:${token}`;
  }
}

export async function GET(
  request: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 });
    }

    const { allowed } = await checkDownloadRateLimit(
      getClientIdentifier(request, token)
    );
    if (!allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em alguns minutos." },
        { status: 429 }
      );
    }

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
        { status: 404 }
      );
    }

    if (item.pedido.status !== "PAGO") {
      return NextResponse.json(
        { error: "Pedido não finalizado ou pagamento pendente" },
        { status: 403 }
      );
    }

    if (item.downloadsCount >= MAX_DOWNLOADS_PER_PURCHASE) {
      return NextResponse.json(
        { error: "Limite de downloads atingido para esta compra." },
        { status: 403 }
      );
    }

    const user = await getAuthenticatedUser();
    if (user && item.pedido.userId !== user.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const command = new GetObjectCommand({
      Bucket: process.env.S3_UPLOAD_BUCKET,
      Key: item.foto.s3Key,
      ResponseContentDisposition: `attachment; filename="${item.foto.titulo}.jpg"`,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });

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
        downloadsCount: { increment: 1 },
      },
    });

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("Download error details:", error);

    const err = error as {
      name?: string;
      Code?: string;
      message?: string;
      $metadata?: { httpStatusCode?: number };
    };
    if (err.name === "NoSuchKey") {
      return NextResponse.json(
        { error: "Arquivo não encontrado no armazenamento (S3)" },
        { status: 404 }
      );
    }
    if (err.Code === "AccessDenied" || err.$metadata?.httpStatusCode === 403) {
      return NextResponse.json(
        { error: "Erro ao processar download" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erro ao processar download" },
      { status: 500 }
    );
  }
}
