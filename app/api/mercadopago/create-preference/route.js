import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { pedidoId, items, payer } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Mercado Pago não configurado. Adicione MERCADOPAGO_ACCESS_TOKEN no .env" },
        { status: 500 }
      );
    }

    // Create preference
    const preference = {
      items: items || [],
      payer: payer || {},
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pagamento/sucesso?pedidoId=${pedidoId}`,
        failure: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pagamento/falha?pedidoId=${pedidoId}`,
        pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pagamento/pendente?pedidoId=${pedidoId}`,
      },
      auto_return: "approved",
      external_reference: pedidoId,
      notification_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      statement_descriptor: "GTClicks",
    };

    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(preference),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Mercado Pago API error:", errorData);
      return NextResponse.json(
        { error: "Erro ao criar preferência de pagamento", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
    });
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json(
      { error: "Erro ao processar pagamento", details: error.message },
      { status: 500 }
    );
  }
}
