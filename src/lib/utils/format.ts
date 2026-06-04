export function formatPrice(price: number): string {
  return price.toLocaleString('ko-KR') + '원';
}

export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
