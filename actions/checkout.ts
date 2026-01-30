"use server";

import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getAuthenticatedUser } from "@/lib/auth";

// Initialize Mercado Pago client
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const client = new MercadoPagoConfig({
  accessToken: accessToken || "",
});

export async function getPaymentDetails(orderId: string) {
  const user = await getAuthenticatedUser();
  if (!user) return { error: "Não autorizado" };

  try {
    const order = await prisma.pedido.findUnique({
      where: { id: orderId },
      select: { id: true, paymentId: true, userId: true, status: true },
    });

    if (!order) return { error: "Pedido não encontrado" };
    if (order.userId !== user.id) return { error: "Sem permissão" };
    if (!order.paymentId)
      return { error: "Pagamento não iniciado para este pedido" };

    // Fetch payment from Mercado Pago
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: order.paymentId });

    // Extract Pix data
    let pixData = null;
    let boletoData = null;

    if (paymentData.payment_method_id === "pix") {
      const poi = paymentData.point_of_interaction;
      if (poi?.transaction_data) {
        pixData = {
          qrCode: poi.transaction_data.qr_code,
          qrCodeBase64: poi.transaction_data.qr_code_base64,
          ticketUrl: poi.transaction_data.ticket_url,
          expiration: paymentData.date_of_expiration,
        };
      }
    } else if (paymentData.payment_type_id === "ticket") {
      // Handle Boletos (bolbradesco, pec, etc)
      boletoData = {
        ticketUrl:
          paymentData.transaction_details?.external_resource_url ||
          paymentData.point_of_interaction?.transaction_data?.ticket_url,
        barcode: (paymentData as any).barcode?.content,
        expiration: paymentData.date_of_expiration,
      };
    }

    return {
      success: true,
      status: paymentData.status,
      paymentMethodId: paymentData.payment_method_id,
      paymentTypeId: paymentData.payment_type_id,
      pix: pixData,
      boleto: boletoData,
    };
  } catch (error: any) {
    console.error("[getPaymentDetails] Error:", error);
    return { error: "Erro ao buscar detalhes do pagamento" };
  }
}
