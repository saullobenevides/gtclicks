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

    // Sanitize and validate items
    const sanitizedItems = (items || []).map(item => ({
      ...item,
      unit_price: Number(item.unit_price),
      quantity: Number(item.quantity)
    }));

    // Construct Base URL cleanly (remove trailing slash)
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    if (baseUrl.endsWith('/')) {
        baseUrl = baseUrl.slice(0, -1);
    }

    // Create preference
    const preference = {
      items: sanitizedItems,
      payer: payer || {},
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso?pedidoId=${pedidoId}`,
        failure: `${baseUrl}/pagamento/falha?pedidoId=${pedidoId}`,
        pending: `${baseUrl}/pagamento/pendente?pedidoId=${pedidoId}`,
      },
      // Production-ready configuration: Enable auto-return and webhooks ONLY if not on localhost
      ...(baseUrl.includes('localhost') 
        ? {} 
        : { 
            auto_return: "approved",
            notification_url: `${baseUrl}/api/webhooks/mercadopago` 
        }),
      statement_descriptor: "GTClicks",
    };

    console.log("🚀 Payload MP:", JSON.stringify(preference, null, 2));

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
      console.error("Mercado Pago API error:", JSON.stringify(errorData, null, 2));
      return NextResponse.json(
        { error: "Erro Mercado Pago: " + (errorData.message || "Dados inválidos"), details: errorData },
        { status: 400 } 
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
