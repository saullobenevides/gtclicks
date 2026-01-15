import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting FINAL INTEGRATION CHECK...');

  try {
    // 1. Setup Actors
    const clientEmail = `client_${Date.now()}@test.com`;
    const photogEmail = `photog_${Date.now()}@test.com`;

    const client = await prisma.user.create({ data: { email: clientEmail, name: 'Client', role: 'CLIENTE' } });
    const photogUser = await prisma.user.create({ data: { email: photogEmail, name: 'Photog', role: 'FOTOGRAFO' } });
    
    const photographer = await prisma.fotografo.create({
      data: { userId: photogUser.id, username: `p_${Date.now()}` }
    });

    console.log('✅ Actors created');

    // 2. Create Asset
    const collection = await prisma.colecao.create({
      data: { nome: 'Final Check Col', slug: `fc-${Date.now()}`, fotografoId: photographer.id }
    });

    const s3Key = `uploads/${Date.now()}.jpg`;
    const previewUrl = `https://bucket.s3.region.amazonaws.com/${s3Key}`;
    
    const photo = await prisma.foto.create({
      data: {
        titulo: 'Final Photo',
        s3Key: s3Key,
        width: 1000, height: 1000, formato: 'jpg', tamanhoBytes: 5000,
        previewUrl: previewUrl,
        fotografoId: photographer.id,
        colecaoId: collection.id,
        orientacao: 'HORIZONTAL',
        status: 'PUBLICADA'
      }
    });

    const licenca = await prisma.licenca.create({
      data: { nome: 'Standard', termos: 'Standard terms' }
    });

    // Link license to photo (price 100.00)
    await prisma.fotoLicenca.create({
      data: { fotoId: photo.id, licencaId: licenca.id, preco: 100.00 }
    });

    console.log('✅ Assets created');

    // 3. Create Order (mimic API logic)
    const orderTotal = 100.00;
    const pedido = await prisma.pedido.create({
      data: {
        userId: client.id,
        total: orderTotal,
        status: 'PENDENTE',
        itens: {
          create: [{
            foto: { connect: { id: photo.id } },
            licenca: { connect: { id: licenca.id } },
            precoPago: 100.00
          }]
        }
      },
      include: { itens: true }
    });

    console.log(`✅ Order created (ID: ${pedido.id}, Status: ${pedido.status})`);

    // 4. Simulate Webhook (Payment Approved)
    // Check idempotency: first run
    await processWebhook(pedido.id);
    
    // Check idempotency: second run (should skip)
    await processWebhook(pedido.id);

    // 5. Verify Financials
    const saldo = await prisma.saldo.findUnique({ where: { fotografoId: photographer.id } });
    const transacoes = await prisma.transacao.findMany({ where: { fotografoId: photographer.id } });

    const expectedBalance = 100.00 * 0.80; // 80% commission
    console.log('Financial Check:');
    console.log(`- Balance: ${saldo?.disponivel} (Expected: ${expectedBalance})`);
    console.log(`- Transactions: ${transacoes.length} (Expected: 1)`);

    if (Number(saldo?.disponivel) === expectedBalance && transacoes.length === 1) {
      console.log('✅ FINANCIAL CHECK PASSED');
    } else {
      console.error('❌ FINANCIAL CHECK FAILED');
    }

    // Cleanup
    console.log('Cleaning up...');
    // (Omitting deep cleanup for brevity, using cascade where possible or manual)
    await prisma.transacao.deleteMany({ where: { fotografoId: photographer.id } });
    await prisma.saldo.deleteMany({ where: { fotografoId: photographer.id } });
    await prisma.itemPedido.deleteMany({ where: { pedidoId: pedido.id } });
    await prisma.pedido.deleteMany({ where: { id: pedido.id } });
    await prisma.fotoLicenca.deleteMany({ where: { fotoId: photo.id } });
    await prisma.foto.deleteMany({ where: { id: photo.id } });
    await prisma.colecao.deleteMany({ where: { id: collection.id } });
    await prisma.licenca.deleteMany({ where: { id: licenca.id } });
    await prisma.fotografo.deleteMany({ where: { id: photographer.id } });
    await prisma.user.deleteMany({ where: { id: { in: [client.id, photogUser.id] } } });

  } catch (e) {
    console.error('❌ TEST FAILED:', e);
  }
}

async function processWebhook(pedidoId) {
    console.log(`\nProcessing Webhook for ${pedidoId}...`);
    const existingOrder = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: { status: true }
    });

    if (existingOrder && existingOrder.status === "PAGO") {
        console.log(`[Webhook] Order ${pedidoId} is already marked as PAGO. Skipping processing.`);
        return;
    }

    // Update order
    await prisma.pedido.update({
        where: { id: pedidoId },
        data: { status: "PAGO" }
    });

    // Credit logic
    const items = await prisma.itemPedido.findMany({
        where: { pedidoId },
        include: { foto: true }
    });

    for (const item of items) {
        const fotografoId = item.foto.fotografoId;
        const precoTotal = Number(item.precoPago);
        const valorFotografo = precoTotal * 0.80;

        await prisma.saldo.upsert({
            where: { fotografoId },
            create: { fotografoId, disponivel: 0, bloqueado: 0 },
            update: {}
        });

        await prisma.transacao.create({
            data: {
                fotografoId,
                tipo: "VENDA",
                valor: valorFotografo,
                descricao: "Venda Teste"
            }
        });

        await prisma.saldo.update({
            where: { fotografoId },
            data: { disponivel: { increment: valorFotografo } }
        });
        console.log(`[Webhook] Credited ${valorFotografo} to ${fotografoId}`);
    }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
