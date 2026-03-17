import type { LostFoundItem } from './types'

const STOP = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'in',
  'is',
  'it',
  'near',
  'of',
  'on',
  'or',
  'that',
  'the',
  'this',
  'to',
  'was',
  'were',
  'with',
])

function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3 && !STOP.has(t))
}

export function suggestTagsFromText(text: string, max = 6) {
  const tokens = tokenize(text)
  const counts = new Map<string, number>()
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1)

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t)
    .slice(0, max)
}

export function getMatchInsights(item: LostFoundItem) {
  const score = item.matchScore ?? 0
  const matchingTags = item.matchingTags ?? []

  const reasons: string[] = []
  if (matchingTags.length) {
    reasons.push(`Matching tags: ${matchingTags.slice(0, 3).join(', ')}`)
  }
  if (item.location) {
    reasons.push(`Location: ${item.location}`)
  }
  if (item.category) {
    reasons.push(`Category: ${item.category}`)
  }

  if (score >= 0.8) reasons.unshift('Strong match based on details and tags')
  else if (score >= 0.6) reasons.unshift('Good match — verify with proof details')
  else reasons.unshift('Possible match — check tags and description carefully')

  return { score, matchingTags, reasons }
}
