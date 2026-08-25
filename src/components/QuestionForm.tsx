"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import CategorySelect from "@/components/CategorySelect";

type Props = {
  categories: string[];
  initial?: Pick<Question, "question" | "answer" | "category" | "notes">;
  submitLabel: string;
  onSubmit: (data: { question: string; answer: string; category: string; notes: string }) => Promise<void>;
  onCancel?: () => void;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function QuestionForm({ categories, initial, submitLabel, onSubmit, onCancel }: Props) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

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
        setFormKey((k) => k + 1);
      }
    } catch {
      setError("Opslaan mislukt, probeer het opnieuw");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Vraag</label>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} className={fieldClass} />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Antwoord</label>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} className={fieldClass} />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Categorie</label>
        <CategorySelect key={formKey} categories={categories} value={category} onChange={setCategory} />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Notities (optioneel)</label>
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className={fieldClass} />
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Bezig…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}
