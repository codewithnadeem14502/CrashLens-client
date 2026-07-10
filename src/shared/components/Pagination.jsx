export function Pagination({
  page = 1,
  totalPages = 1,
  total,
  limit,
  disabled = false,
  onPageChange,
}) {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), safeTotalPages);
  const safeTotal = Math.max(Number(total) || 0, 0);
  const pageSize = Math.max(Number(limit) || safeTotal || 1, 1);
  const start = safeTotal === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = safeTotal === 0 ? 0 : Math.min(currentPage * pageSize, safeTotal);

  const goToPage = (nextPage) => {
    if (
      disabled ||
      nextPage === currentPage ||
      nextPage < 1 ||
      nextPage > safeTotalPages
    ) {
      return;
    }

    onPageChange?.(nextPage);
  };

  return (
    <nav className="pagination-controls" aria-label="Pagination">
      <span className="pagination-total">{start}-{end} of {safeTotal}</span>
      <button
        className="pagination-arrow"
        type="button"
        disabled={disabled || currentPage <= 1}
        aria-label="Previous page"
        onClick={() => goToPage(currentPage - 1)}
      >
        {"<"}
      </button>
      <button
        className="pagination-arrow"
        type="button"
        disabled={disabled || currentPage >= safeTotalPages}
        aria-label="Next page"
        onClick={() => goToPage(currentPage + 1)}
      >
        {">"}
      </button>
    </nav>
  );
}
