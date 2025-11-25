import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const licenses = await prisma.licenca.findMany({
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json({ data: licenses });
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      { error: "Failed to fetch licenses" },
      { status: 500 }
    );
  }
}
