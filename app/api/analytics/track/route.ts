import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { entityId, type } = (await request.json()) as {
      entityId?: string;
      type?: string;
    };

    if (!entityId || !["foto", "colecao"].includes(type || "")) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (type === "foto") {
      const foto = await prisma.foto.findFirst({
        where: { id: entityId, status: "PUBLICADA" },
      });
      if (foto) {
        await prisma.foto.update({
          where: { id: entityId },
          data: { views: { increment: 1 } },
        });
      }
    } else if (type === "colecao") {
      const colecao = await prisma.colecao.findFirst({
        where: { id: entityId, status: "PUBLICADA" },
      });
      if (colecao) {
        await prisma.colecao.update({
          where: { id: entityId },
          data: { views: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics Error:", error);
    return NextResponse.json({ error: "Failed to track" }, { status: 200 });
  }
}
