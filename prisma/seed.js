import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding licenses...');

  // Create standard licenses
  const licenses = [
    {
      nome: 'Licença Editorial',
      descricao: 'Uso em blogs, redes sociais, projetos pessoais e educacionais. Não permite uso comercial.',
      termos: 'Você pode usar esta foto para fins editoriais, incluindo posts em redes sociais, blogs pessoais e materiais educacionais. Uso comercial não é permitido.',
    },
    {
      nome: 'Licença Comercial',
      descricao: 'Uso em anúncios, sites corporativos, materiais de marketing e publicações comerciais.',
      termos: 'Você pode usar esta foto para fins comerciais, incluindo anúncios, sites corporativos, materiais de marketing e publicações comerciais. Revenda ou sublicenciamento não é permitido.',
    },
    {
      nome: 'Licença Exclusiva',
      descricao: 'Direitos exclusivos sobre a foto. A imagem será removida da plataforma após a compra.',
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

  // Create or Update Main Photographer User
  const photographerEmail = 'teste@gtclicks.com';
  let user = await prisma.user.findUnique({ where: { email: photographerEmail } });
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: photographerEmail,
        name: 'Fotógrafo Teste',
        image: 'https://github.com/shadcn.png',
        role: 'FOTOGRAFO',
      }
    });
    console.log('✓ Created Test User');
  } else {
    // Ensure role is FOTOGRAFO
    if (user.role !== 'FOTOGRAFO') {
       await prisma.user.update({ where: { id: user.id }, data: { role: 'FOTOGRAFO' } });
       console.log('✓ Updated Test User role');
    }
  }

  // Create Photographer Profile
  let photographer = await prisma.fotografo.findUnique({ where: { userId: user.id } });
  if (!photographer) {
    photographer = await prisma.fotografo.create({
      data: {
        userId: user.id,
        username: 'fotografoteste',
        bio: 'Fotógrafo profissional especializado em tecnologia e eventos.',
        cidade: 'São Paulo',
        estado: 'SP',
        instagram: 'fotografoteste',
        chavePix: 'teste@pix.com.br',
        cpf: '123.456.789-00',
        especialidades: ['Eventos Corporativos', 'Retratos', 'Tecnologia'],
        equipamentos: 'Sony A7III, 24-70mm GM',
        portfolioUrl: 'https://gtclicks.com'
      }
    });
    console.log('✓ Created Photographer Profile');
  }

  // Create Sample Collection
  const collectionSlug = 'tech-event-2025';
  let collection = await prisma.colecao.findUnique({ where: { slug: collectionSlug } });
  
  if (!collection) {
    collection = await prisma.colecao.create({
      data: {
        nome: 'Tech Summit 2025',
        slug: collectionSlug,
        descricao: 'Fotos exclusivas do maior evento de tecnologia do ano.',
        categoria: 'CORPORATIVO',
        status: 'PUBLICADA',
        precoFoto: 25.00,
        capaUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80',
        fotografoId: photographer.id,
        fotos: {
            create: [
                {
                    titulo: 'Keynote Speaker',
                    descricao: 'Palestrante principal apresentando novas tendências de IA.',
                    s3Key: 'seeds/speaker.jpg',
                    previewUrl: 'https://images.unsplash.com/photo-1475721027767-pja438964d85?auto=format&fit=crop&q=80',
                    width: 1920,
                    height: 1080,
                    formato: 'jpg',
                    tamanhoBytes: 2500000,
                    orientacao: 'HORIZONTAL',
                    tags: ['palestra', 'ia', 'tecnologia', 'palco'],
                    status: 'PUBLICADA',
                    fotografoId: photographer.id
                },
                {
                    titulo: 'Networking Area',
                    descricao: 'Área de convivência com profissionais trocando experiências.',
                    s3Key: 'seeds/networking.jpg',
                    previewUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80',
                    width: 1920,
                    height: 1080,
                    formato: 'jpg',
                    tamanhoBytes: 2200000,
                    orientacao: 'HORIZONTAL',
                    tags: ['networking', 'coffee', 'pessoas', 'negócios'],
                    status: 'PUBLICADA',
                    fotografoId: photographer.id
                }
            ]
        }
      }
    });
    console.log('✓ Created Sample Collection');
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
