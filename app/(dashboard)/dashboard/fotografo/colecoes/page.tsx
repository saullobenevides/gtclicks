import { Suspense } from "react";
import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import { getFotografoByUserId } from "./_data-access/colecoes";
import ColecoesDataLoader from "./ColecoesDataLoader";
import ColecoesSkeleton from "./ColecoesSkeleton";

export const dynamic = "force-dynamic";

interface MinhasColecoesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function MinhasColecoesPage(
  props: MinhasColecoesPageProps
) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? Number(searchParams.page) : 1;

  let user;
  try {
    user = await stackServerApp.getUser();
  } catch (error) {
    console.error("Error fetching user:", error);
  }

  if (!user) {
    redirect("/login?callbackUrl=/dashboard/fotografo/colecoes");
  }

  const fotografo = await getFotografoByUserId(user.id);

  if (!fotografo) {
    redirect("/dashboard/fotografo");
  }

  return (
    <Suspense fallback={<ColecoesSkeleton />}>
      <ColecoesDataLoader
        fotografoId={fotografo.id}
        page={page}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
