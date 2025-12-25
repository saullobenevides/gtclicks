import { NextResponse } from 'next/server';
import { searchFaces } from '@/lib/rekognition';
import prisma from '@/lib/prisma';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Nenhuma imagem enviada' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Search for faces
    const matches = await searchFaces(buffer);

    if (!matches || matches.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Extract photo IDs (ExternalImageId)
    // Filter out matches with low confidence if needed (already filtered in lib)
    const photoIds = [...new Set(matches.map(match => match.Face.ExternalImageId))];

    if (photoIds.length === 0) {
      return NextResponse.json({ photos: [] });
    }

    // Fetch photos from DB
    // If collectionId is provided, filter by it
    const collectionId = formData.get('collectionId');
    
    // Define filter criteria
    const where = {
        id: { in: photoIds },
        status: 'PUBLICADA',
    };
    
    if (collectionId) {
        where.colecaoId = collectionId;
    }

    const photos = await prisma.foto.findMany({
      where,
      include: {
        fotografo: {
          select: {
            username: true,
            user: { select: { name: true } },
          },
        },
      },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error searching faces:', error);
    return NextResponse.json({ error: 'Erro ao buscar rostos: ' + error.message }, { status: 500 });
  }
}
