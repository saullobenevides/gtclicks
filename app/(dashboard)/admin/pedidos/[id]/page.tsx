import { notFound } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin/permissions";
import AdminPedidoDetailClient from "./AdminPedidoDetailClient";

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const pedido = await prisma.pedido.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      itens: {
        include: {
          foto: {
            select: {
              id: true,
              titulo: true,
              previewUrl: true,
              width: true,
              height: true,
              tamanhoBytes: true,
            },
          },
          licenca: { select: { nome: true } },
        },
      },
    },
  });

  if (!pedido) notFound();

  const serialized = {
    ...pedido,
    total: Number(pedido.total),
    createdAt: pedido.createdAt.toISOString(),
    itens: pedido.itens.map((i) => ({
      ...i,
      precoPago: Number(i.precoPago),
    })),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/pedidos"
            className="text-sm text-zinc-400 hover:text-white mb-2 inline-block"
          >
            ← Voltar aos pedidos
          </Link>
          <h1 className="text-3xl font-bold text-white">
            Pedido #{pedido.id.slice(-8).toUpperCase()}
          </h1>
          <p className="text-zinc-400 mt-1">
            {new Date(pedido.createdAt).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>

      <AdminPedidoDetailClient pedido={serialized} />
    </div>
  );
}
