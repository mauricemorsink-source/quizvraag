export type Question = {
  id: string;
  question: string;
  answer: string;
  categories: string[];
  notes: string | null;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Draft = {
  id: string;
  text: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};

export const ROUND_TYPES = ["MUZIEKRONDE", "PLAATJESRONDE", "INTRORONDE", "OVERIGE"] as const;
export type RoundType = (typeof ROUND_TYPES)[number];

export function isRoundType(value: unknown): value is RoundType {
  return typeof value === "string" && (ROUND_TYPES as readonly string[]).includes(value);
}

export const ROUND_TYPE_LABELS: Record<RoundType, string> = {
  MUZIEKRONDE: "Muziekronde",
  PLAATJESRONDE: "Plaatjesronde",
  INTRORONDE: "Introronde",
  OVERIGE: "Overige rondes",
};

export type RoundIdea = {
  id: string;
  title: string;
  note: string | null;
  roundType: RoundType;
  createdAt: string;
  updatedAt: string;
};
