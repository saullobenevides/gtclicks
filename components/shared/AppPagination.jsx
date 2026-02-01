import {
  Pagination,
  PaginationButton,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/**
 * Paginação unificada: URL (Server) ou client-side (onClick).
 *
 * Modo URL (padrão): baseUrl + searchParams → usa Link/href.
 * Modo client: onPageChange(page) → usa button onClick (ex.: CollectionSearchClient).
 */
export default function AppPagination({
  currentPage,
  totalPages,
  baseUrl,
  searchParams = {},
  onPageChange,
  className,
  "aria-label": ariaLabel,
}) {
  if (totalPages <= 1) return null;

  const isClientMode = typeof onPageChange === "function";

  const createPageURL = (pageNumber) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  const handlePageClick = (page) => {
    onPageChange?.(page);
    typeof window !== "undefined" &&
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const PageLink = isClientMode ? PaginationButton : PaginationLink;
  const pageLinkProps = (page) =>
    isClientMode
      ? { onClick: () => handlePageClick(page) }
      : { href: createPageURL(page) };

  const renderPageLinks = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PageLink {...pageLinkProps(1)}>1</PageLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PageLink {...pageLinkProps(i)} isActive={currentPage === i}>
            {i}
          </PageLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PageLink {...pageLinkProps(totalPages)}>{totalPages}</PageLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <Pagination className={className ?? "mt-8"} aria-label={ariaLabel}>
      <PaginationContent>
        {currentPage > 1 && (
          <PaginationItem>
            {isClientMode ? (
              <PaginationPrevious
                as="button"
                onClick={() => handlePageClick(currentPage - 1)}
              />
            ) : (
              <PaginationPrevious href={createPageURL(currentPage - 1)} />
            )}
          </PaginationItem>
        )}

        {renderPageLinks()}

        {currentPage < totalPages && (
          <PaginationItem>
            {isClientMode ? (
              <PaginationNext
                as="button"
                onClick={() => handlePageClick(currentPage + 1)}
              />
            ) : (
              <PaginationNext href={createPageURL(currentPage + 1)} />
            )}
          </PaginationItem>
        )}
      </PaginationContent>
    </Pagination>
  );
}
