"use client";

import { useMemo, useState } from "react";
import type { Question } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";
import QuestionRow from "@/components/QuestionRow";

type Props = {
  initialQuestions: Question[];
  initialCategories: string[];
};

type UsedFilter = "all" | "used" | "unused";

export default function QuestionList({ initialQuestions, initialCategories }: Props) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showAddForm, setShowAddForm] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [usedFilter, setUsedFilter] = useState<UsedFilter>("all");
  const [search, setSearch] = useState("");

  const categories = useMemo(
    () => Array.from(new Set([...initialCategories, ...questions.map((q) => q.category)])).sort(),
    [initialCategories, questions]
  );

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

  async function handleAdd(data: { question: string; answer: string; category: string; notes: string }) {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Opslaan mislukt");
    const created: Question = await res.json();
    setQuestions((prev) => [created, ...prev]);
    setShowAddForm(false);
  }

  async function handleUpdate(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Bijwerken mislukt");
    const updated: Question = await res.json();
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Verwijderen mislukt");
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm"
        >
          <option value="all">Alle categorieën</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={usedFilter}
          onChange={(e) => setUsedFilter(e.target.value as UsedFilter)}
          className="rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm"
        >
          <option value="all">Alles</option>
          <option value="unused">Nog niet gebruikt</option>
          <option value="used">Al gebruikt</option>
        </select>

        <input
          type="search"
          placeholder="Zoeken…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="min-w-[10rem] flex-1 rounded-md border border-neutral-300 px-2.5 py-1.5 text-sm"
        />

        <button
          type="button"
          onClick={() => setShowAddForm((v) => !v)}
          className="ml-auto rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          {showAddForm ? "Sluiten" : "+ Nieuwe vraag"}
        </button>
      </div>

      {showAddForm && (
        <QuestionForm
          categories={categories}
          submitLabel="Toevoegen"
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <p className="text-xs text-neutral-400">
        {filtered.length} van {questions.length} vragen
      </p>

      {filtered.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
          Geen vragen gevonden.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((q) => (
            <QuestionRow
              key={q.id}
              question={q}
              categories={categories}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
