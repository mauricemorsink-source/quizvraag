"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import CategoryMultiSelect from "@/components/CategoryMultiSelect";

type Props = {
  categories: string[];
  initial?: Pick<Question, "question" | "answer" | "categories" | "notes">;
  submitLabel: string;
  onSubmit: (data: { question: string; answer: string; categories: string[]; notes: string }) => Promise<void>;
  onCancel?: () => void;
  aiAssist?: boolean;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function QuestionForm({ categories, initial, submitLabel, onSubmit, onCancel, aiAssist }: Props) {
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initial?.categories ?? []);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  async function handleGenerate() {
    if (!question.trim()) {
      setError("Vul eerst een kladje/tekst in het vraagveld in om te genereren");
      return;
    }
    setError(null);
    setAiNotice(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: question.trim(), category: selectedCategories[0] ?? "" }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "AI-suggestie genereren mislukt");
        return;
      }
      setQuestion(body.question);
      setAnswer(body.answer);
      if (body.notes) setNotes(body.notes);
      setAiNotice(
        body.confidence === "laag"
          ? "AI-suggestie ingevuld — lage betrouwbaarheid, controleer de feiten goed voordat je opslaat."
          : "AI-suggestie ingevuld — controleer vraag en antwoord voordat je opslaat."
      );
    } catch {
      setError("AI-suggestie genereren mislukt, probeer het opnieuw");
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || selectedCategories.length === 0) {
      setError("Vraag, antwoord en minstens één categorie zijn verplicht");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        question: question.trim(),
        answer: answer.trim(),
        categories: selectedCategories,
        notes: notes.trim(),
      });
      if (!initial) {
        setQuestion("");
        setAnswer("");
        setSelectedCategories([]);
        setNotes("");
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
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <label className="block text-sm font-medium text-neutral-700">
            {aiAssist ? "Kladje / vraag" : "Vraag"}
          </label>
          {aiAssist && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !question.trim()}
              className="shrink-0 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:opacity-50"
            >
              {generating ? "Bezig…" : "✨ Genereer met AI"}
            </button>
          )}
        </div>
        <textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={2} className={fieldClass} />
      </div>

      {aiNotice && (
        <p className="mb-3.5 rounded-lg bg-indigo-50 px-3 py-2 text-xs text-indigo-700">{aiNotice}</p>
      )}

      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Antwoord</label>
        <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} rows={2} className={fieldClass} />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Categorieën</label>
        <CategoryMultiSelect categories={categories} value={selectedCategories} onChange={setSelectedCategories} />
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
