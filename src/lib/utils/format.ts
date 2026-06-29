export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function parseDate(isoString: string): Date {
  // Java LocalDateTime serializes without timezone (e.g. "2024-01-15T10:30:00")
  // Normalize space separator and append Z so all browsers parse correctly
  const normalized = isoString.replace(' ', 'T').replace(/(\d{2}:\d{2}:\d{2})(\.\d+)?$/, '$1Z');
  return new Date(normalized);
}

export function formatTime(isoString: string): string {
  const d = parseDate(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(isoString: string): string {
  const d = parseDate(isoString);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
