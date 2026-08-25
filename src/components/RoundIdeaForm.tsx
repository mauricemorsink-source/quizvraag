"use client";

import { useState } from "react";
import { ROUND_TYPES, ROUND_TYPE_LABELS, type RoundIdea, type RoundType } from "@/lib/types";

type Props = {
  initial?: Pick<RoundIdea, "title" | "note" | "roundType">;
  submitLabel: string;
  onSubmit: (data: { title: string; note: string; roundType: RoundType }) => Promise<void>;
  onCancel?: () => void;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function RoundIdeaForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [roundType, setRoundType] = useState<RoundType>(initial?.roundType ?? "MUZIEKRONDE");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Titel is verplicht");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({ title: title.trim(), note: note.trim(), roundType });
      if (!initial) {
        setTitle("");
        setNote("");
        setRoundType("MUZIEKRONDE");
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
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Titel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bijv. Jaren 90-hits, Vlaggen raden…"
          className={fieldClass}
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Notitie (optioneel)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Uitwerking, bronnen, aantekeningen…"
          className={fieldClass}
        />
      </div>

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Rondetype</label>
        <select value={roundType} onChange={(e) => setRoundType(e.target.value as RoundType)} className={fieldClass}>
          {ROUND_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {ROUND_TYPE_LABELS[rt]}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
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
