import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(request) {
  try {
    const body = await request.json();
    const { pedidoId, items: rawItems, payer } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Mercado Pago não configurado. Adicione MERCADOPAGO_ACCESS_TOKEN no .env",
        },
        { status: 500 },
      );
    }

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    // --- SECURITY FIX: Fetch real prices from DB ---
    const sanitizedItems = [];

    for (const item of rawItems) {
      // We expect item.id to be the fotoId. Check if it has a license attached.
      // The frontend should send: { id: fotoId, title: "...", quantity: 1, licencaId: "..." (optional) }

      const foto = await prisma.foto.findUnique({
        where: { id: item.id },
        include: { colecao: true },
      });

      if (!foto) {
        console.error(`Attempt to purchase invalid item: ${item.id}`);
        continue; // or throw error
      }

      let price = new Prisma.Decimal(0);
      let title = foto.titulo;

      // If it needs a specific license
      if (item.licencaId) {
        const licencaRel = await prisma.fotoLicenca.findUnique({
          where: {
            fotoId_licencaId: {
              fotoId: foto.id,
              licencaId: item.licencaId,
            },
          },
          include: { licenca: true },
        });

        if (!licencaRel) {
          return NextResponse.json(
            { error: "Licença inválida para a foto" },
            { status: 400 },
          );
        }

        price = licencaRel.preco;
        title = `${foto.titulo} (${licencaRel.licenca.nome})`;
      } else {
        // Default price (from Collection if applicable, or logic for default single sale)
        // Based on schema: Colecao has precoFoto.
        if (foto.colecaoId && foto.colecao) {
          price = foto.colecao.precoFoto;
        } else {
          // Fallback or error if standalone photos have no price defined elsewhere
          // For now, assume collection price is the rule as per schema analysis
          return NextResponse.json(
            { error: "Preço não encontrado para a foto" },
            { status: 400 },
          );
        }
      }

      sanitizedItems.push({
        id: item.id,
        title: title,
        description: foto.descricao || "",
        picture_url: foto.previewUrl,
        category_id: "art",
        quantity: 1, // Photos usually unique digital goods
        currency_id: "BRL",
        unit_price: Number(price), // MP requires Number, but we sourced it securely
      });
    }

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item válido encontrado" },
        { status: 400 },
      );
    }

    // Construct Base URL cleanly (remove trailing slash)
    // Priority: 1. Env Var (NEXT_PUBLIC_APP_URL) -> 2. Vercel URL (VERCEL_URL) -> 3. Localhost
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl && process.env.VERCEL_URL) {
      // Vercel URL usually comes without https://
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }

    if (!baseUrl) {
      baseUrl = "http://localhost:3000";
    }

    if (baseUrl.endsWith("/")) {
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
      external_reference: pedidoId, // Critical for webhook correlation
      // Production-ready configuration: Enable auto-return and webhooks ONLY if not on localhost
      ...(baseUrl.includes("localhost")
        ? {}
        : {
            auto_return: "approved",
            notification_url: `${baseUrl}/api/webhooks/mercadopago`,
          }),
      statement_descriptor: "GTClicks",
    };

    console.log("🚀 Payload MP (Secure):", JSON.stringify(preference, null, 2));

    const response = await fetch(
      "https://api.mercadopago.com/checkout/preferences",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preference),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(
        "Mercado Pago API error:",
        JSON.stringify(errorData, null, 2),
      );
      return NextResponse.json(
        {
          error:
            "Erro Mercado Pago: " + (errorData.message || "Dados inválidos"),
          details: errorData,
        },
        { status: 400 },
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
      { status: 500 },
    );
  }
}
