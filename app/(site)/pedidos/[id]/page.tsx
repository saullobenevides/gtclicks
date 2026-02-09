import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PedidoDetailContent from "./PedidoDetailContent";
import PedidoDetailSkeleton from "./PedidoDetailSkeleton";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;
  return {
    title: `Pedido #${params.id.slice(-8).toUpperCase()}`,
  };
}

export default async function PedidoDetalhesPage(props: PageProps) {
  const params = await props.params;
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect(`/login?callbackUrl=/pedidos/${params.id}`);
  }

  return (
    <div className="container-wide px-4 py-12 md:py-20">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/pedidos"
          className="mb-8 inline-flex items-center text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para pedidos
        </Link>

        <Suspense fallback={<PedidoDetailSkeleton />}>
          <PedidoDetailContent
            orderId={params.id}
            userId={user.id}
            user={user}
          />
        </Suspense>
      </div>
    </div>
  );
}
