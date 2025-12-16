import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkPreview() {
  try {
    const photo = await prisma.foto.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!photo) {
      console.log('No photos found.');
      return;
    }

    console.log('Latest Photo:', photo.titulo);
    console.log('Preview URL:', photo.previewUrl);

    if (!photo.previewUrl) {
      console.log('No preview URL set.');
      return;
    }

    const res = await fetch(photo.previewUrl);
    console.log('Fetch Status:', res.status);
    console.log('Fetch Status Text:', res.statusText);
    
    if (!res.ok) {
        const text = await res.text();
        console.log('Error Body (first 200 chars):', text.substring(0, 200));
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPreview();
