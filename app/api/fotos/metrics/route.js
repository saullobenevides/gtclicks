import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request) {
  const { searchParams } = new URL(request.url);
  const fotoId = searchParams.get("id");
  const action = searchParams.get("action"); // "view" or "like"

  if (!fotoId || !action) {
    return NextResponse.json(
      { error: "id and action are required" },
      { status: 400 }
    );
  }

  try {
    if (action === "view") {
      await prisma.foto.update({
        where: { id: fotoId },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    } else if (action === "like") {
      await prisma.foto.update({
        where: { id: fotoId },
        data: {
          likes: {
            increment: 1,
          },
        },
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking metric:", error);
    return NextResponse.json(
      { error: "Failed to track metric" },
      { status: 500 }
    );
  }
}
