"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import QuestionRow from "@/components/QuestionRow";

type Props = {
  questions: Question[];
  categories: string[];
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

type UsedFilter = "all" | "used" | "unused";

const selectClass =
  "rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-sm text-neutral-700 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function QuestionList({ questions, categories, onUpdate, onDelete }: Props) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [usedFilter, setUsedFilter] = useState<UsedFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return questions.filter((q) => {
      if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
      if (usedFilter === "used" && !q.used) return false;
      if (usedFilter === "unused" && q.used) return false;
      if (term && !q.question.toLowerCase().includes(term) && !q.answer.toLowerCase().includes(term)) {
        return false;
      }
      return true;
    });
  }, [questions, categoryFilter, usedFilter, search]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={selectClass}>
          <option value="all">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select value={usedFilter} onChange={(e) => setUsedFilter(e.target.value as UsedFilter)} className={selectClass}>
          <option value="all">Alles</option>
          <option value="unused">Nog niet gebruikt</option>
          <option value="used">Al gebruikt</option>
        </select>

        <input
          type="search"
          placeholder="Zoeken…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[10rem] flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <p className="px-1 text-xs text-neutral-400">
        {filtered.length} van {questions.length} vragen
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-neutral-400">Geen vragen gevonden.</p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((q) => (
            <QuestionRow key={q.id} question={q} categories={categories} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
