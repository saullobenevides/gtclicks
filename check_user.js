import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const username = 'saullo_c_benevides_3360';
  console.log(`Checking for photographer with username: ${username}`);

  const photographer = await prisma.fotografo.findUnique({
    where: { username },
    include: { user: true }
  });

  if (photographer) {
    console.log('✅ Photographer found:', photographer);
  } else {
    console.log('❌ Photographer NOT found');
    // List all photographers to see what's available
    const all = await prisma.fotografo.findMany({ select: { username: true } });
    console.log('Available photographers:', all.map(p => p.username));
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
