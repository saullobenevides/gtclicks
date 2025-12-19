import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  try {
    const { entityId, type } = await request.json();

    if (!entityId || !['foto', 'colecao'].includes(type)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    if (type === 'foto') {
      await prisma.foto.update({
        where: { id: entityId },
        data: { views: { increment: 1 } }
      });
    } else if (type === 'colecao') {
      await prisma.colecao.update({
        where: { id: entityId },
        data: { views: { increment: 1 } }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics Error:", error);
    // Fail silently in production so we don't block UI for a stat
    return NextResponse.json({ error: "Failed to track" }, { status: 200 }); 
  }
}
