import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getAuthenticatedUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { error: "Autenticação necessária para finalizar compra" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as {
      pedidoId?: string;
      items?: Array<{ id: string; licencaId?: string }>;
      payer?: Record<string, unknown>;
    };
    const { pedidoId, items: rawItems, payer } = body;

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Mercado Pago não configurado. Adicione MERCADOPAGO_ACCESS_TOKEN no .env",
        },
        { status: 500 }
      );
    }

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
    }

    const sanitizedItems: Array<{
      id: string;
      title: string;
      description: string;
      picture_url: string;
      category_id: string;
      quantity: number;
      currency_id: string;
      unit_price: number;
    }> = [];

    for (const item of rawItems) {
      const foto = await prisma.foto.findUnique({
        where: { id: item.id },
        include: { colecao: true },
      });

      if (!foto) {
        console.error(`Attempt to purchase invalid item: ${item.id}`);
        continue;
      }

      let price: Prisma.Decimal;
      let title = foto.titulo;

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
            { status: 400 }
          );
        }

        price = licencaRel.preco;
        title = `${foto.titulo} (${licencaRel.licenca.nome})`;
      } else {
        if (foto.colecaoId && foto.colecao) {
          price = foto.colecao.precoFoto;
        } else {
          return NextResponse.json(
            { error: "Preço não encontrado para a foto" },
            { status: 400 }
          );
        }
      }

      sanitizedItems.push({
        id: item.id,
        title,
        description: foto.descricao ?? "",
        picture_url: foto.previewUrl,
        category_id: "art",
        quantity: 1,
        currency_id: "BRL",
        unit_price: Number(price),
      });
    }

    if (sanitizedItems.length === 0) {
      return NextResponse.json(
        { error: "Nenhum item válido encontrado" },
        { status: 400 }
      );
    }

    let baseUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }

    if (!baseUrl) {
      baseUrl = "http://localhost:3000";
    }

    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.slice(0, -1);
    }

    if (pedidoId) {
      const pedido = await prisma.pedido.findUnique({
        where: { id: pedidoId },
        select: { userId: true },
      });
      if (pedido && pedido.userId !== user.id) {
        return NextResponse.json(
          { error: "Pedido não pertence ao usuário" },
          { status: 403 }
        );
      }
    }

    const preference = {
      items: sanitizedItems,
      payer: payer ?? {},
      back_urls: {
        success: `${baseUrl}/pagamento/sucesso?pedidoId=${pedidoId}`,
        failure: `${baseUrl}/pagamento/falha?pedidoId=${pedidoId}`,
        pending: `${baseUrl}/pagamento/pendente?pedidoId=${pedidoId}`,
      },
      external_reference: pedidoId,
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
      }
    );

    if (!response.ok) {
      const errorData = (await response.json()) as { message?: string };
      console.error(
        "Mercado Pago API error:",
        JSON.stringify(errorData, null, 2)
      );
      return NextResponse.json(
        {
          error:
            "Erro Mercado Pago: " + (errorData.message ?? "Dados inválidos"),
          details: errorData,
        },
        { status: 400 }
      );
    }

    const data = (await response.json()) as { id: string; init_point: string };

    return NextResponse.json({
      id: data.id,
      init_point: data.init_point,
    });
  } catch (error) {
    console.error("Error creating Mercado Pago preference:", error);
    return NextResponse.json(
      {
        error: "Erro ao processar pagamento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
