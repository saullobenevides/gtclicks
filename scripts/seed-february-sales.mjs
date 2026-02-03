/**
 * Script para criar mocks de vendas de fevereiro/2025.
 * Use: node scripts/seed-february-sales.mjs
 *
 * Cria usuários clientes e pedidos PAGOS com createdAt em fevereiro de 2025,
 * para popular o ranking de top compradores do mês.
 */
import {
  PrismaClient,
  PedidoStatus,
  UserRole,
  OrientacaoFoto,
  FotoStatus,
} from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();
const prisma = new PrismaClient();

function getCurrentMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

function getLastMonthRange() {
  const now = new Date();
  return {
    start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
    end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
  };
}

async function getOrCreateLicencas() {
  let licencas = await prisma.licenca.findMany({ take: 2 });
  if (licencas.length === 0) {
    licencas = await Promise.all([
      prisma.licenca.create({
        data: {
          nome: "Editorial",
          descricao: "Uso em revistas, blogs e redes sociais.",
          termos: "Crédito obrigatório ao fotógrafo.",
        },
      }),
      prisma.licenca.create({
        data: {
          nome: "Comercial",
          descricao: "Uso em anúncios e campanhas.",
          termos: "Inclui até 500k impressões.",
        },
      }),
    ]);
    console.log("  ✓ Licenças criadas: Editorial, Comercial");
  }
  return licencas;
}

async function getOrCreateFotos(licencas) {
  let fotos = await prisma.foto.findMany({
    where: { status: "PUBLICADA" },
    take: 5,
    include: { licencas: true },
  });

  if (fotos.length === 0) {
    let fotografo = await prisma.fotografo.findFirst();
    if (!fotografo) {
      const fotografoUser = await prisma.user.create({
        data: {
          name: "Fotógrafo Demo",
          email: `fotografo-demo-${Date.now()}@gtclicks.com`,
          role: UserRole.FOTOGRAFO,
        },
      });
      fotografo = await prisma.fotografo.create({
        data: {
          userId: fotografoUser.id,
          username: `fotografo-demo-${Date.now().toString(36)}`,
          especialidades: ["eventos"],
        },
      });
      console.log("  ✓ Fotógrafo criado: fotografo-demo");
    }

    const colecao = await prisma.colecao.create({
      data: {
        nome: "Coleção Demo",
        slug: `colecao-demo-${Date.now()}`,
        fotografoId: fotografo.id,
        status: "PUBLICADA",
        precoFoto: 10,
      },
    });

    const fotosData = [
      {
        titulo: "Foto Demo 1",
        orientacao: OrientacaoFoto.HORIZONTAL,
        s3Key: `mock/feb-seed-${Date.now()}-1.jpg`,
        width: 800,
        height: 600,
        formato: "jpg",
        tamanhoBytes: 102400,
        previewUrl:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        fotografoId: fotografo.id,
        colecaoId: colecao.id,
        status: FotoStatus.PUBLICADA,
        indexedFaceIds: [],
      },
      {
        titulo: "Foto Demo 2",
        orientacao: OrientacaoFoto.HORIZONTAL,
        s3Key: `mock/feb-seed-${Date.now()}-2.jpg`,
        width: 800,
        height: 600,
        formato: "jpg",
        tamanhoBytes: 102400,
        previewUrl:
          "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
        fotografoId: fotografo.id,
        colecaoId: colecao.id,
        status: FotoStatus.PUBLICADA,
        indexedFaceIds: [],
      },
      {
        titulo: "Foto Demo 3",
        orientacao: OrientacaoFoto.HORIZONTAL,
        s3Key: `mock/feb-seed-${Date.now()}-3.jpg`,
        width: 800,
        height: 600,
        formato: "jpg",
        tamanhoBytes: 102400,
        previewUrl:
          "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400",
        fotografoId: fotografo.id,
        colecaoId: colecao.id,
        status: FotoStatus.PUBLICADA,
        indexedFaceIds: [],
      },
    ];

    for (const fotoData of fotosData) {
      const foto = await prisma.foto.create({ data: fotoData });
      for (const lic of licencas) {
        await prisma.fotoLicenca.create({
          data: {
            fotoId: foto.id,
            licencaId: lic.id,
            preco: lic.nome === "Comercial" ? 249 : 89,
          },
        });
      }
      fotos.push(foto);
    }
    console.log("  ✓ Fotos criadas: 3 fotos demo");
  }

  return fotos;
}

async function getOrCreateUsers() {
  const clients = [
    { name: "Sofia Martinez", email: "sofia@gtclicks.com" },
    { name: "Lucas Silva", email: "lucas@gtclicks.com" },
    { name: "Ana Costa", email: "ana@gtclicks.com" },
  ];

  const users = [];
  for (const c of clients) {
    let user = await prisma.user.findUnique({ where: { email: c.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: c.name,
          email: c.email,
          role: UserRole.CLIENTE,
        },
      });
      console.log(`  ✓ Usuário criado: ${c.name}`);
    }
    users.push(user);
  }
  return users;
}

async function getFotosAndLicencas() {
  const licencas = await getOrCreateLicencas();
  const fotos = await getOrCreateFotos(licencas);
  return { fotos, licencas };
}

function randomDateInMonth(range) {
  const start = range.start.getTime();
  const end = range.end.getTime();
  return new Date(start + Math.random() * (end - start));
}

async function createCurrentMonthPedidos(users, { fotos, licencas }) {
  const range = getCurrentMonthRange();
  // Ranking: 1º Sofia R$1250, 2º Lucas R$980,50, 3º Ana R$450
  const pedidosPorUsuario = [
    [
      { total: 450, numItens: 3 },
      { total: 400, numItens: 2 },
      { total: 400, numItens: 2 },
    ],
    [
      { total: 500, numItens: 3 },
      { total: 480.5, numItens: 2 },
    ],
    [{ total: 450, numItens: 2 }],
  ];

  for (let u = 0; u < users.length; u++) {
    const user = users[u];
    const pedidos = pedidosPorUsuario[u];
    for (const config of pedidos) {
      const precoPorItem = config.total / config.numItens;
      const itens = [];
      for (let i = 0; i < config.numItens; i++) {
        const foto = fotos[i % fotos.length];
        const licenca = licencas[i % licencas.length];
        itens.push({
          fotoId: foto.id,
          licencaId: licenca.id,
          precoPago: Math.round(precoPorItem * 100) / 100,
        });
      }
      const total = itens.reduce((s, i) => s + Number(i.precoPago), 0);
      const createdAt = randomDateInMonth(range);
      await prisma.pedido.create({
        data: {
          userId: user.id,
          total,
          status: PedidoStatus.PAGO,
          paymentId: `mock_feb_${user.id.slice(-6)}_${Date.now()}`,
          createdAt,
          itens: { create: itens },
        },
      });
      console.log(
        `  ✓ ${user.name}: R$ ${total.toFixed(
          2
        )} (${createdAt.toLocaleDateString("pt-BR")})`
      );
    }
  }
}

async function createLastMonthWinner(users, { fotos, licencas }) {
  const range = getLastMonthRange();
  const user = users[0];
  const total = 4894;
  const numItens = 8;
  const precoPorItem = total / numItens;

  const itens = [];
  for (let i = 0; i < numItens; i++) {
    const foto = fotos[i % fotos.length];
    const licenca = licencas[i % licencas.length];
    itens.push({
      fotoId: foto.id,
      licencaId: licenca.id,
      precoPago: precoPorItem,
    });
  }

  const midMonth = new Date(
    range.start.getFullYear(),
    range.start.getMonth(),
    15,
    14,
    30,
    0
  );
  await prisma.pedido.create({
    data: {
      userId: user.id,
      total,
      status: PedidoStatus.PAGO,
      paymentId: `mock_prev_${user.id.slice(-6)}`,
      createdAt: midMonth,
      itens: { create: itens },
    },
  });
  const monthName = range.start.toLocaleString("pt-BR", { month: "long" });
  console.log(
    `  ✓ Pedido ${monthName} R$ ${total} (último vencedor): ${user.name}`
  );
}

async function main() {
  const now = new Date();
  const monthName = now.toLocaleString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  console.log(`📅 Criando mocks de vendas de ${monthName}...\n`);

  const users = await getOrCreateUsers();
  const fotosLicencas = await getFotosAndLicencas();

  console.log(`\n🛒 Pedidos de ${monthName}:`);
  await createCurrentMonthPedidos(users, fotosLicencas);

  const lastMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1
  ).toLocaleString("pt-BR", { month: "long" });
  console.log(`\n🏆 Último vencedor (${lastMonth}):`);
  await createLastMonthWinner(users, fotosLicencas);

  console.log("\n✅ Mocks criados com sucesso!");
}

main()
  .catch((e) => {
    console.error("Erro:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
