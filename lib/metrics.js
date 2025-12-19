import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function getCollectionMetrics(collectionId) {
  // 1. Fetch Collection with Photos and Views
  const collection = await prisma.colecao.findUnique({
    where: { id: collectionId },
    include: {
      fotos: {
          select: { id: true, views: true, titulo: true, previewUrl: true, numeroSequencial: true }
      }
    }
  });

  if (!collection) return null;

  // 2. Fetch Sales Data (Pedidols that are PAGO)
  const itemsSold = await prisma.itemPedido.findMany({
    where: {
      foto: { colecaoId: collectionId },
      pedido: { status: 'PAGO' }
    },
    include: {
      pedido: { select: { userId: true, createdAt: true } },
      foto: { select: { id: true } }
    }
  });

  // --- Calculations ---

  // Financials
  const grossRevenue = itemsSold.reduce((acc, item) => acc + Number(item.precoPago), 0);
  const netRevenue = grossRevenue * 0.80; // 80% to photographer

  // Volume
  const totalItemsSold = itemsSold.length;
  const uniquePhotosSold = new Set(itemsSold.map(i => i.fotoId)).size;
  const distinctBuyers = new Set(itemsSold.map(i => i.pedidoId)).size; // Using pedidoId as proxy for transaction count if userId is shared

  // KPIs
  const ticketAverage = distinctBuyers > 0 ? (grossRevenue / distinctBuyers) : 0;
  const conversionRate = collection.views > 0 ? (distinctBuyers / collection.views * 100) : 0;

  // --- Rankings ---
  
  // Sales Ranking
  const salesMap = {};
  itemsSold.forEach(item => {
      salesMap[item.fotoId] = (salesMap[item.fotoId] || 0) + 1;
  });

  // Merge with Views for "Window Shoppers" analysis
  const photoPerformance = collection.fotos.map(foto => {
      const sales = salesMap[foto.id] || 0;
      return {
          id: foto.id,
          title: foto.titulo,
          thumb: foto.previewUrl,
          number: foto.numeroSequencial,
          views: foto.views,
          sales: sales,
          // "Window Shopper Score": High Views, Low Sales
          conversion: foto.views > 0 ? (sales / foto.views) : 0
      };
  });

  // Sorts
  const bestSellers = [...photoPerformance].sort((a, b) => b.sales - a.sales).slice(0, 5);
  const windowShoppers = [...photoPerformance]
      .filter(p => p.sales === 0 && p.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);
    
  return {
    overview: {
        views: collection.views,
        grossRevenue,
        netRevenue,
        totalSold: totalItemsSold,
        uniqueBuyers: distinctBuyers,
        ticketAverage,
        conversionRate: conversionRate.toFixed(1)
    },
    rankings: {
        bestSellers,
        windowShoppers
    }
  };
}
