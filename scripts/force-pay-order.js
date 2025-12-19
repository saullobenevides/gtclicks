import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function forcePayLatestOrder() {
  try {
    // 1. Find latest PENDING order
    const order = await prisma.pedido.findFirst({
      where: { status: 'PENDENTE' },
      orderBy: { createdAt: 'desc' },
      include: { itens: { include: { foto: true } } }
    });

    if (!order) {
      console.log('❌ Nenhum pedido PENDENTE encontrado.');
      return;
    }

    console.log(`📦 Pedido encontrado: #${order.id.slice(0, 8)} | Total: R$ ${order.total}`);

    // 2. Process Transaction (Simulate Webhook Logic)
    await prisma.$transaction(async (tx) => {
      // A. Update Order
      await tx.pedido.update({
        where: { id: order.id },
        data: { 
          status: 'PAGO',
          paymentId: `sim_${Date.now()}`
        }
      });
      console.log('✅ Status do pedido atualizado para PAGO');

      // B. Distribute Funds (80/20)
      for (const item of order.itens) {
        const fotografoId = item.foto.fotografoId;
        const amounts = {
          gross: Number(item.precoPago),
          photographer: Number(item.precoPago) * 0.8,
          platform: Number(item.precoPago) * 0.2
        };

        // Credit Photographer
        await tx.saldo.upsert({
          where: { fotografoId },
          create: {
            fotografoId,
            disponivel: amounts.photographer,
            bloqueado: 0
          },
          update: {
            disponivel: { increment: amounts.photographer }
          }
        });

        // Log Transaction
        await tx.transacao.create({
          data: {
            fotografoId,
            tipo: 'VENDA',
            valor: amounts.photographer,
            descricao: `Venda de foto: ${item.foto.titulo}`
            // pedidoId field does not exist in Transacao model
          }
        });

        console.log(`💰 Fotógrafo creditado: R$ ${amounts.photographer.toFixed(2)} (Foto: ${item.foto.titulo})`);
      }
    });

    console.log('🎉 Simulação de Pagamento Concluída com Sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

forcePayLatestOrder();
