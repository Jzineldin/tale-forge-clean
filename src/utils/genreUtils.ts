export const GENRE_NORMALIZATION_MAP: Record<string, string> = {
  // Canonical IDs
  'fantasy-magic': 'fantasy-magic',
  'adventure-exploration': 'adventure-exploration',
  'mystery-detective': 'mystery-detective',
  'science-space': 'science-space',
  'educational-stories': 'educational-stories',
  'values-lessons': 'values-lessons',
  'bedtime-stories': 'bedtime-stories',
  'silly-humor': 'silly-humor',

  // Legacy or alt slugs → canonical
  'fantasy-and-magic': 'fantasy-magic',
  'adventure-and-exploration': 'adventure-exploration',
  'mystery-and-detective': 'mystery-detective',
  'science-fiction-and-space': 'science-space',
  'values-and-life-lessons': 'values-lessons',
  'silly-and-humorous': 'silly-humor',
  'fantasy': 'fantasy-magic',
  'sci-fi': 'science-space',
};

export function normalizeGenre(input?: string | null): string {
  if (!input) return 'fantasy-magic';
  const key = input.toLowerCase();
  return GENRE_NORMALIZATION_MAP[key] || key;
}
