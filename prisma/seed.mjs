import { PrismaClient, OrientacaoFoto, PedidoStatus, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/password.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Limpando dados anteriores...");
  await prisma.itemPedido.deleteMany();
  await prisma.pedido.deleteMany();
  await prisma.fotoLicenca.deleteMany();
  await prisma.foto.deleteMany();
  await prisma.colecao.deleteMany();
  await prisma.licenca.deleteMany();
  await prisma.fotografo.deleteMany();
  await prisma.user.deleteMany();

  console.log("👤 Criando usuários...");
  const password = await hashPassword("senha-demo");
  const [clienteJoana, marinaUser, caioUser] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Joana Compradora",
        email: "cliente@gtclicks.com",
        passwordHash: password,
        role: UserRole.CLIENTE,
      },
    }),
    prisma.user.create({
      data: {
        name: "Marina Levy",
        email: "marina@gtclicks.com",
        passwordHash: password,
        role: UserRole.FOTOGRAFO,
      },
    }),
    prisma.user.create({
      data: {
        name: "Caio Freitas",
        email: "caio@gtclicks.com",
        passwordHash: password,
        role: UserRole.FOTOGRAFO,
      },
    }),
  ]);

  console.log("📸 Criando perfis de fotógrafos...");
  const [marinaProfile, caioProfile] = await Promise.all([
    prisma.fotografo.create({
      data: {
        userId: marinaUser.id,
        username: "luzurbana",
        bio: "Fotógrafa editorial apaixonada por luzes neon e texturas urbanas.",
        cidade: "São Paulo, SP",
        especialidades: ["editorial", "urbano"],
        redesSociais: { instagram: "@luzurbana", portfolio: "https://luzurbana.studio" },
        avatarUrl:
          "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=compress&fit=crop&w=400&q=80",
        bannerUrl:
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=compress&fit=crop&w=1200&q=80",
      },
    }),
    prisma.fotografo.create({
      data: {
        userId: caioUser.id,
        username: "atmosfera",
        bio: "Explora neblinas amazônicas para criar fotos etéreas.",
        cidade: "Manaus, AM",
        especialidades: ["natureza", "textura"],
        redesSociais: { instagram: "@atmosfera", portfolio: "https://atmosfera.photos" },
        avatarUrl:
          "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=compress&fit=crop&w=400&q=80",
        bannerUrl:
          "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=compress&fit=crop&w=1200&q=80",
      },
    }),
  ]);

  console.log("🪪 Criando licenças padrão...");
  const [licEditorial, licComercial] = await Promise.all([
    prisma.licenca.create({
      data: {
        nome: "Editorial",
        descricao: "Uso em revistas, blogs, redes sociais e materiais orgânicos.",
        precoPadrao: 89,
        termos: "Crédito obrigatório ao fotógrafo.",
      },
    }),
    prisma.licenca.create({
      data: {
        nome: "Comercial",
        descricao: "Uso em anúncios, embalagens e campanhas patrocinadas.",
        precoPadrao: 249,
        termos: "Inclui até 500k impressões. Para mais, fale com o suporte.",
      },
    }),
  ]);

  console.log("🗂️ Criando coleções e fotos...");
  const colecoesSeed = [
    {
      data: {
        nome: "Retratos Neon",
        slug: "retratos-neon",
        descricao: "Retratos vibrantes com atmosfera cyberpunk.",
        capaUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=compress&fit=crop&w=900&q=80",
        fotografoId: marinaProfile.id,
        fotos: {
          create: [
            {
              titulo: "Linha Azul",
              slug: "linha-azul",
              descricao: "Retrato com linhas de luz azul e contraste forte.",
              tags: ["neon", "editorial"],
              orientacao: OrientacaoFoto.HORIZONTAL,
              corPredominante: "azul",
              previewUrl:
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=compress",
              originalUrl: "s3://gtclicks/originals/linha-azul.dng",
            },
            {
              titulo: "Neon Rosa",
              slug: "neon-rosa",
              descricao: "Expressão suave iluminada por neon rosa.",
              tags: ["neon", "portrait"],
              orientacao: OrientacaoFoto.VERTICAL,
              corPredominante: "rosa",
              previewUrl:
                "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=compress",
              originalUrl: "s3://gtclicks/originals/neon-rosa.dng",
            },
          ],
        },
      },
    },
    {
      data: {
        nome: "Brumas Amazônicas",
        slug: "brumas-amazonicas",
        descricao: "Texturas orgânicas e clima misterioso na floresta.",
        capaUrl:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=compress&fit=crop&w=900&q=80",
        fotografoId: caioProfile.id,
        fotos: {
          create: [
            {
              titulo: "Bruma Verde",
              slug: "bruma-verde",
              descricao: "Folhagens cobertas por neblina suave.",
              tags: ["natureza", "textura"],
              orientacao: OrientacaoFoto.HORIZONTAL,
              corPredominante: "verde",
              previewUrl:
                "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=compress",
              originalUrl: "s3://gtclicks/originals/bruma-verde.dng",
            },
            {
              titulo: "Rio Suspenso",
              slug: "rio-suspenso",
              descricao: "Rio serpenteado visto do alto.",
              tags: ["paisagem", "aereo"],
              orientacao: OrientacaoFoto.PANORAMICA,
              corPredominante: "verde",
              previewUrl:
                "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=compress",
              originalUrl: "s3://gtclicks/originals/rio-suspenso.dng",
            },
          ],
        },
      },
    },
  ];

  const createdColecoes = [];
  for (const entry of colecoesSeed) {
    const colecao = await prisma.colecao.create({
      data: entry.data,
      include: { fotos: true },
    });

    createdColecoes.push(colecao);

    for (const foto of colecao.fotos) {
      await prisma.fotoLicenca.createMany({
        data: [
          { fotoId: foto.id, licencaId: licEditorial.id, preco: licEditorial.precoPadrao },
          { fotoId: foto.id, licencaId: licComercial.id, preco: licComercial.precoPadrao },
        ],
      });
    }
  }

  console.log("🧾 Criando pedido de exemplo...");
  const pedido = await prisma.pedido.create({
    data: {
      clienteId: clienteJoana.id,
      total: 338,
      status: PedidoStatus.PAGO,
      checkoutSessionId: "sess_demo_123",
      paymentProvider: "stripe",
      itens: {
        create: [
          {
            fotoId: createdColecoes[0].fotos[0].id,
            licencaId: licEditorial.id,
            precoUnitario: 89,
            downloadUrlAssinada: "https://cdn.gtclicks.com/downloads/linha-azul",
          },
          {
            fotoId: createdColecoes[1].fotos[0].id,
            licencaId: licComercial.id,
            precoUnitario: 249,
            downloadUrlAssinada: "https://cdn.gtclicks.com/downloads/bruma-verde",
          },
        ],
      },
    },
    include: { itens: true },
  });

  console.log(`✅ Seed concluído. Pedido gerado: ${pedido.id}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
