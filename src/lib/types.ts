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

export type Draft = {
  id: string;
  text: string;
  category: string;
  createdAt: string;
  updatedAt: string;
};
