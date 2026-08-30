export function normalizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const cleaned: string[] = [];
  for (const item of input) {
    if (typeof item === "string") {
      const trimmed = item.trim();
      if (trimmed) cleaned.push(trimmed);
    }
  }
  return Array.from(new Set(cleaned));
}
