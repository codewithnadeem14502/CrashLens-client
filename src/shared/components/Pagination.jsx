export function Pagination({
  page = 1,
  totalPages = 1,
  total,
  disabled = false,
  onPageChange,
}) {
  const safeTotalPages = Math.max(Number(totalPages) || 1, 1);
  const currentPage = Math.min(Math.max(Number(page) || 1, 1), safeTotalPages);
  const pages = buildPageRange(currentPage, safeTotalPages);

  if (safeTotalPages <= 1) return null;

  const goToPage = (nextPage) => {
    if (disabled || nextPage === currentPage || nextPage < 1 || nextPage > safeTotalPages) {
      return;
    }

    onPageChange?.(nextPage);
  };

  return (
    <nav className="pagination-controls" aria-label="Pagination">
      {typeof total === "number" ? (
        <span className="pagination-total">{total} total</span>
      ) : null}
      <button
        className="secondary-button"
        type="button"
        disabled={disabled || currentPage <= 1}
        onClick={() => goToPage(currentPage - 1)}
      >
        Prev
      </button>
      <div className="pagination-pages">
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span className="pagination-ellipsis" key={`ellipsis-${index}`}>
              ...
            </span>
          ) : (
            <button
              className={`page-button ${item === currentPage ? "active" : ""}`}
              type="button"
              key={item}
              disabled={disabled}
              aria-current={item === currentPage ? "page" : undefined}
              onClick={() => goToPage(item)}
            >
              {item}
            </button>
          ),
        )}
      </div>
      <button
        className="secondary-button"
        type="button"
        disabled={disabled || currentPage >= safeTotalPages}
        onClick={() => goToPage(currentPage + 1)}
      >
        Next
      </button>
    </nav>
  );
}

function buildPageRange(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(currentPage - 1, 2);
  const end = Math.min(currentPage + 1, totalPages - 1);

  if (start > 2) {
    pages.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}
