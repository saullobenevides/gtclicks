import { redirect } from "next/navigation";
import { stackServerApp } from "@/stack/server";
import {
  getFotografoByUserId,
  getColecoesPaginated,
} from "./_data-access/colecoes";
import ColecoesContent from "./_components/ColecoesContent";

export const dynamic = "force-dynamic";

/**
 * Server Component – Minhas Coleções (Manual v3.0).
 * Valida sessão, busca dados via DAL e passa para _components/content.
 */
export default async function MinhasColecoesPage(props) {
  const searchParams = await props.searchParams;
  const page = searchParams?.page ? Number(searchParams.page) : 1;
  const limit = 10;

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

  const status = searchParams?.status ?? "";
  const q = searchParams?.q ?? "";
  const sort = searchParams?.sort ?? "createdAt";
  const order = searchParams?.order ?? "desc";

  const { colecoes, totalPages } = await getColecoesPaginated(fotografo.id, {
    page,
    limit,
    status: status || undefined,
    q: q || undefined,
    sort,
    order,
  });

  return (
    <ColecoesContent
      colecoes={colecoes}
      totalPages={totalPages}
      currentPage={page}
      searchParams={searchParams}
    />
  );
}
