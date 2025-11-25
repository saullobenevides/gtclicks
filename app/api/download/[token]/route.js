import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(request, { params }) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
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
      return NextResponse.json({ error: 'Download não encontrado' }, { status: 404 });
    }

    // 2. Verify if the order is PAID
    if (item.pedido.status !== 'PAGO') {
      return NextResponse.json({ error: 'Pedido não finalizado ou pagamento pendente' }, { status: 403 });
    }

    // 3. Generate Signed URL (valid for 5 minutes)
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: item.foto.s3Key,
      ResponseContentDisposition: `attachment; filename="${item.foto.titulo}.jpg"`, // Force download
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 300 seconds = 5 minutes

    // 4. Update download count (optional but good for analytics)
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
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Erro ao processar download' }, { status: 500 });
  }
}
