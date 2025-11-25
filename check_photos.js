import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const username = '@saullo_c_benevides_3360';
  console.log(`Checking photos for username: ${username}`);

  const photographer = await prisma.fotografo.findUnique({
    where: { username },
    include: { 
      fotos: true,
      user: true
    }
  });

  if (!photographer) {
    console.log('❌ Photographer NOT found');
    return;
  }

  console.log(`✅ Photographer found: ${photographer.user?.name} (ID: ${photographer.id})`);
  console.log(`Total photos linked: ${photographer.fotos.length}`);
  
  if (photographer.fotos.length > 0) {
    console.log('Photos details:');
    photographer.fotos.forEach(f => {
      console.log(`- [${f.status}] ${f.titulo} (ID: ${f.id})`);
    });
  } else {
    console.log('No photos found for this photographer.');
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
