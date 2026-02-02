import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/pedidos/[id]/pagamento
 * Retorna detalhes do pagamento (Pix, boleto, status) para pedidos pendentes.
 */
export async function GET(request, context) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id: pedidoId } = await context.params;

    const pedido = await prisma.pedido.findUnique({
      where: { id: pedidoId },
      select: { id: true, paymentId: true, userId: true, status: true },
    });

    if (!pedido) {
      return NextResponse.json(
        { error: "Pedido não encontrado" },
        { status: 404 }
      );
    }

    if (pedido.userId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    if (!pedido.paymentId) {
      return NextResponse.json({
        hasPayment: false,
        status: pedido.status,
        message: "Pagamento ainda não foi iniciado",
      });
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return NextResponse.json(
        { error: "Configuração de pagamento indisponível" },
        { status: 500 }
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);
    const paymentData = await payment.get({ id: pedido.paymentId });

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
      boletoData = {
        ticketUrl:
          paymentData.transaction_details?.external_resource_url ||
          paymentData.point_of_interaction?.transaction_data?.ticket_url,
        barcode: paymentData.barcode?.content,
        expiration: paymentData.date_of_expiration,
      };
    }

    return NextResponse.json({
      hasPayment: true,
      status: paymentData.status,
      paymentMethodId: paymentData.payment_method_id,
      paymentTypeId: paymentData.payment_type_id,
      pix: pixData,
      boleto: boletoData,
    });
  } catch (error) {
    console.error("[pagamento] Error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar detalhes do pagamento" },
      { status: 500 }
    );
  }
}
