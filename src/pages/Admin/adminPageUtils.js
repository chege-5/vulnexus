export function formatTimestamp(value) {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleString();
}

export function messageFrom(error, fallback) {
  return error?.message || fallback;
}

export function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0;
}
