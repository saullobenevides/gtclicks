import { NextResponse } from "next/server";
import { stackServerApp } from "@/stack/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const user = await stackServerApp.getUser();

  if (!user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const metadata = user.serverMetadata as { role?: string } | undefined;
  if (metadata?.role === "ADMIN") {
    return NextResponse.json({ url: "/admin/saques" });
  }

  const fotografo = await prisma.fotografo.findUnique({
    where: { userId: user.id },
    select: { id: true, username: true },
  });

  if (fotografo) {
    return NextResponse.json({
      url: "/dashboard/fotografo",
      username: fotografo.username,
    });
  }

  return NextResponse.json({ url: null });
}
