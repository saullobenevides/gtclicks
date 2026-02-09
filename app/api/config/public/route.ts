import { NextResponse } from "next/server";
import { getConfigNumber, CONFIG_KEYS } from "@/lib/config";

/**
 * GET /api/config/public
 * Returns public configuration values safe for frontend display.
 */
export async function GET() {
  try {
    const taxaPlataforma = await getConfigNumber(CONFIG_KEYS.TAXA_PLATAFORMA);
    const comissaoFotografo = 100 - taxaPlataforma;

    return NextResponse.json({
      taxaPlataforma,
      comissaoFotografo,
    });
  } catch (error) {
    console.error("Error fetching public config:", error);
    return NextResponse.json({
      taxaPlataforma: 15,
      comissaoFotografo: 85,
    });
  }
}
