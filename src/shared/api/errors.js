export function getApiError(error) {
  const details = error?.response?.data?.details;

  if (Array.isArray(details) && details.length > 0) {
    return details.map(formatDetail).join("\n");
  }

  return (
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message ??
    "Request failed"
  );
}

function formatDetail(detail) {
  if (typeof detail === "string") {
    return detail;
  }

  if (detail?.message) {
    return detail.message;
  }

  return String(detail);
}
