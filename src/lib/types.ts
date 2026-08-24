export type Question = {
  id: string;
  question: string;
  answer: string;
  category: string;
  notes: string | null;
  used: boolean;
  usedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
