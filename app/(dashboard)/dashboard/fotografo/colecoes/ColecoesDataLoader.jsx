import { getColecoesPaginated } from "./_data-access/colecoes";
import ColecoesContent from "./_components/ColecoesContent";

export default async function ColecoesDataLoader({
  fotografoId,
  page,
  searchParams,
}) {
  const status = searchParams?.status ?? "";
  const q = searchParams?.q ?? "";
  const sort = searchParams?.sort ?? "createdAt";
  const order = searchParams?.order ?? "desc";

  const { colecoes, totalPages } = await getColecoesPaginated(fotografoId, {
    page,
    limit: 10,
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
