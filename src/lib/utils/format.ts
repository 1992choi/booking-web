export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

function parseDate(isoString: string): Date {
  // Java LocalDateTime serializes without timezone (e.g. "2024-01-15T10:30:00"),
  // and every backend service runs with serverTimezone=Asia/Seoul, so the value
  // is already Korea local wall-clock time. Normalize the separator and append
  // the KST offset (not "Z"/UTC) so all browsers parse it as the correct instant.
  const normalized = isoString.replace(' ', 'T').replace(/(\d{2}:\d{2}:\d{2})(\.\d+)?$/, '$1+09:00');
  return new Date(normalized);
}

export function formatTime(isoString: string): string {
  const d = parseDate(isoString);
  // Always render in Korea time, regardless of the viewer's browser timezone,
  // since reservation times are fixed to the shop's local (KST) business hours.
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
}

export function formatDate(isoString: string): string {
  const d = parseDate(isoString);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' });
}

export function formatDateTime(isoString: string): string {
  const d = parseDate(isoString);
  if (isNaN(d.getTime())) return isoString;
  return d.toLocaleDateString('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
