import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Fetching orders...');
  const orders = await prisma.pedido.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      itens: {
        include: {
          foto: {
            select: {
              id: true,
              titulo: true,
              previewUrl: true,
            }
          }
        }
      }
    }
  });

  console.log('Orders found:', orders.length);
  if (orders.length > 0) {
    console.log(JSON.stringify(orders[0], null, 2));
    
    orders[0].itens.forEach((item, index) => {
        console.log(`Item ${index}:`);
        console.log('  Preview URL:', item.foto.previewUrl);
        console.log('  Price (Pago):', item.precoPago);
    });
  } else {
    console.log("No orders found.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
