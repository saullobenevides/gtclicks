import prisma from '../lib/prisma.js';

async function main() {
  console.log('Simulating views...');

  // Get first collection
  const collection = await prisma.colecao.findFirst({
      include: { fotos: true }
  });

  if (!collection) {
      console.log('No collection found to simulate.');
      return;
  }

  console.log(`Boosting views for collection: ${collection.nome}`);

  // Boost Collection Views
  await prisma.colecao.update({
      where: { id: collection.id },
      data: { views: { increment: 450 } } // ~450 visitors
  });

  // Boost Photo Views (Randomly)
  for (const foto of collection.fotos) {
      const randomViews = Math.floor(Math.random() * 120);
      await prisma.foto.update({
          where: { id: foto.id },
          data: { views: { increment: randomViews } }
      });
  }

  console.log('Views simulated successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
