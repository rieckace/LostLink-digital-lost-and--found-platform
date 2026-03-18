type ScoreResult = {
  score: number; // 0-100
  reasons: string[];
  breakdown: {
    tags: number;
    location: number;
    timing: number;
    proof: number;
  };
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const tokenize = (text: string): string[] => {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 3);
};

const overlapRatio = (needles: Set<string>, haystack: Set<string>): number => {
  if (needles.size === 0) return 0;
  let matched = 0;
  for (const x of needles) if (haystack.has(x)) matched++;
  return matched / needles.size;
};

const daysBetween = (isoA: string, isoB: string): number | null => {
  const a = new Date(isoA);
  const b = new Date(isoB);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const diff = Math.abs(a.getTime() - b.getTime());
  return diff / (1000 * 60 * 60 * 24);
};

export function scoreClaim(input: {
  item: {
    title?: string;
    category?: string;
    location?: string;
    locationLabel?: string;
    dateISO?: string;
    tags?: string[];
  };
  proofText: string;
  claimCreatedAtISO?: string;
}): ScoreResult {
  const reasons: string[] = [];

  const itemTags = new Set((input.item.tags ?? []).map((t) => String(t).toLowerCase()));
  const proofTokens = new Set(tokenize(input.proofText));

  // 1) Tags match (35%)
  const tagScore = clamp01(overlapRatio(itemTags, proofTokens));
  if (tagScore > 0) {
    const matched = Array.from(itemTags).filter((t) => proofTokens.has(t)).slice(0, 6);
    if (matched.length) reasons.push(`Matched tags/keywords: ${matched.join(', ')}`);
  }

  // 2) Location match (25%)
  const locNeedles = [input.item.location, input.item.locationLabel]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase())
    .filter((s) => s.length >= 3);

  let locationScore = 0;
  for (const needle of locNeedles) {
    if (needle && input.proofText.toLowerCase().includes(needle)) {
      locationScore = 1;
      reasons.push(`Proof mentions location: ${needle}`);
      break;
    }
  }

  // 3) Timing match (15%)
  let timingScore = 0.3;
  const itemDateISO = input.item.dateISO;
  const claimDateISO = input.claimCreatedAtISO;
  if (itemDateISO && claimDateISO) {
    const d = daysBetween(itemDateISO, claimDateISO);
    if (d != null) {
      if (d <= 1) timingScore = 1;
      else if (d <= 3) timingScore = 0.85;
      else if (d <= 7) timingScore = 0.7;
      else if (d <= 30) timingScore = 0.45;
      else timingScore = 0.25;
      reasons.push(`Claim timing distance: ${d.toFixed(1)} day(s)`);
    }
  }

  // 4) Proof richness/consistency (25%)
  const titleTokens = new Set(tokenize(input.item.title ?? ''));
  const categoryTokens = new Set(tokenize(input.item.category ?? ''));
  const key = new Set([...titleTokens, ...categoryTokens, ...itemTags].filter(Boolean));
  const proofScore = clamp01(overlapRatio(key, proofTokens));
  if (proofScore > 0.15) reasons.push('Proof includes multiple item-specific keywords');

  const breakdown = {
    tags: Math.round(tagScore * 100),
    location: Math.round(locationScore * 100),
    timing: Math.round(timingScore * 100),
    proof: Math.round(proofScore * 100),
  };

  // Weighted final
  const final01 =
    tagScore * 0.35 +
    locationScore * 0.25 +
    timingScore * 0.15 +
    proofScore * 0.25;

  const score = Math.round(clamp01(final01) * 100);

  if (reasons.length === 0) {
    reasons.push('Low evidence match: proof does not strongly match item details');
  }

  return { score, reasons, breakdown };
}
