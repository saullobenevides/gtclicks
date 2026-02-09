import { NextResponse } from "next/server";
import { isAsaasConfigured } from "@/lib/asaas";

/**
 * GET /api/asaas/checkout-available
 * Retorna se o checkout Asaas está configurado e disponível.
 */
export async function GET() {
  return NextResponse.json({
    available: isAsaasConfigured(),
  });
}
