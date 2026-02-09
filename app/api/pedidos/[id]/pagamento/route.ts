import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/pedidos/[id]/pagamento
 * Retorna detalhes do pagamento (Pix, boleto, status) para pedidos pendentes.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
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

    const paymentId = String(pedido.paymentId);
    // ID em formato UUID = Asaas (checkout). Não consultamos MP.
    const isAsaasId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      paymentId
    );
    if (isAsaasId) {
      return NextResponse.json({
        hasPayment: true,
        status: "CONFIRMED",
        message: "Pago via Asaas. Use o botão abaixo para acessar o pedido.",
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
    const paymentData = await payment.get({ id: paymentId });

    let pixData: {
      qrCode?: string;
      qrCodeBase64?: string;
      ticketUrl?: string;
      expiration?: string;
    } | null = null;
    let boletoData: {
      ticketUrl?: string;
      barcode?: string;
      expiration?: string;
    } | null = null;

    const poi = paymentData.point_of_interaction as
      | Record<string, unknown>
      | undefined;
    const txData = poi?.transaction_data as Record<string, unknown> | undefined;

    if (paymentData.payment_method_id === "pix" && txData) {
      pixData = {
        qrCode: txData.qr_code as string,
        qrCodeBase64: txData.qr_code_base64 as string,
        ticketUrl: txData.ticket_url as string,
        expiration: paymentData.date_of_expiration,
      };
    } else if (paymentData.payment_type_id === "ticket") {
      const txDetails = paymentData.transaction_details as
        | Record<string, unknown>
        | undefined;
      const barcodeData = paymentData as unknown as {
        barcode?: { content?: string };
      };
      boletoData = {
        ticketUrl:
          (txDetails?.external_resource_url as string) ||
          (txData?.ticket_url as string),
        barcode: barcodeData.barcode?.content,
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
