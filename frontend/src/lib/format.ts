export function formatDateShort(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

export function clamp01(n: number) {
  return Math.min(1, Math.max(0, n))
}

export function percent(n: number) {
  return `${Math.round(clamp01(n) * 100)}%`
}
