import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding licenses...');

  // Create standard licenses
  const licenses = [
    {
      nome: 'Licença Editorial',
      descricao: 'Uso em blogs, redes sociais, projetos pessoais e educacionais. Não permite uso comercial.',
      precoPadrao: 49.90,
      termos: 'Você pode usar esta foto para fins editoriais, incluindo posts em redes sociais, blogs pessoais e materiais educacionais. Uso comercial não é permitido.',
    },
    {
      nome: 'Licença Comercial',
      descricao: 'Uso em anúncios, sites corporativos, materiais de marketing e publicações comerciais.',
      precoPadrao: 149.90,
      termos: 'Você pode usar esta foto para fins comerciais, incluindo anúncios, sites corporativos, materiais de marketing e publicações comerciais. Revenda ou sublicenciamento não é permitido.',
    },
    {
      nome: 'Licença Exclusiva',
      descricao: 'Direitos exclusivos sobre a foto. A imagem será removida da plataforma após a compra.',
      precoPadrao: 499.90,
      termos: 'Você adquire direitos exclusivos sobre esta foto. A imagem será removida da plataforma e você terá uso ilimitado. O fotógrafo não poderá vender ou licenciar esta foto para terceiros.',
    },
  ];

  for (const license of licenses) {
    const existing = await prisma.licenca.findFirst({
      where: { nome: license.nome },
    });

    if (!existing) {
      await prisma.licenca.create({ data: license });
      console.log(`✓ Created license: ${license.nome}`);
    } else {
      console.log(`→ License ${license.nome} already exists`);
    }
  }

  console.log('✅ Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
