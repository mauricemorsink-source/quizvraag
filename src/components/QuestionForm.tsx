"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

type Props = {
  categories: string[];
  initial?: Pick<Question, "question" | "answer" | "category" | "notes">;
  submitLabel: string;
  onSubmit: (data: { question: string; answer: string; category: string; notes: string }) => Promise<void>;
  onCancel?: () => void;
};

export default function QuestionForm({ categories, initial, submitLabel, onSubmit, onCancel }: Props) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !category.trim()) {
      setError("Vraag, antwoord en categorie zijn verplicht");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ question: question.trim(), answer: answer.trim(), category: category.trim(), notes: notes.trim() });
      if (!initial) {
        setQuestion("");
        setAnswer("");
        setCategory("");
        setNotes("");
      }
    } catch {
      setError("Opslaan mislukt, probeer het opnieuw");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-neutral-700">Vraag</label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-neutral-700">Antwoord</label>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          rows={2}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <div className="mb-3">
        <label className="mb-1 block text-sm font-medium text-neutral-700">Categorie</label>
        <input
          list="category-suggestions"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <datalist id="category-suggestions">
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-sm font-medium text-neutral-700">Notities (optioneel)</label>
        <input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Bezig…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm text-neutral-600 transition hover:bg-neutral-100"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}
