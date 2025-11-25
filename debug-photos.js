import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const username = 'saullobenevides'; // I'll assume this is the username based on the context, or I can try to find it.
  // Actually, let's list all photographers first to be sure.
  
  console.log("Listing all photographers:");
  const photographers = await prisma.fotografo.findMany();
  console.log(photographers);

  if (photographers.length > 0) {
    const photographer = photographers[0];
    console.log(`\nChecking photos for photographer: ${photographer.username} (ID: ${photographer.id})`);
    
    const photos = await prisma.foto.findMany({
      where: {
        fotografoId: photographer.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        titulo: true,
        previewUrl: true,
        orientacao: true,
        tags: true,
        createdAt: true,
        // categoria: true, // This field does not exist in the schema!
      },
    });
    
    console.log(`Found ${photos.length} photos.`);
    if (photos.length > 0) {
      console.log("First photo:", photos[0]);
    } else {
        // Check if there are ANY photos for this photographer without the select/orderby
        const allPhotos = await prisma.foto.count({ where: { fotografoId: photographer.id } });
        console.log(`Total photos in DB for this photographer (ignoring select/order): ${allPhotos}`);
    }
  } else {
    console.log("No photographers found.");
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
