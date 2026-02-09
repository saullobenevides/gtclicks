import { Suspense } from "react";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import PedidosContent from "./PedidosContent";
import PedidosListSkeleton from "./PedidosListSkeleton";

export const metadata = {
  title: "Meus Pedidos",
  description: "Acompanhe seus pedidos e downloads",
};

type PageProps = {
  searchParams: Promise<{ page?: string } | undefined>;
};

export default async function PedidosPage(props: PageProps) {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login?callbackUrl=/pedidos");
  }

  const searchParams = await props.searchParams;
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;

  return (
    <div className="container-wide px-4 py-12 md:py-20">
      <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="heading-display font-display text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-2">
            Meus Pedidos
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas compras e baixe suas fotos.
          </p>
        </div>
      </div>

      <Suspense fallback={<PedidosListSkeleton />}>
        <PedidosContent
          userId={user.id}
          searchParams={searchParams}
          page={page}
        />
      </Suspense>
    </div>
  );
}
