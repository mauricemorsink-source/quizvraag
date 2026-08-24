"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";
import DraftRow from "@/components/DraftRow";

type Props = {
  drafts: Draft[];
  categories: string[];
  onAdd: (data: { text: string; category: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onConvert: (draft: Draft) => void;
};

export default function KladblokPanel({ drafts, categories, onAdd, onDelete, onConvert }: Props) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !category.trim()) {
      setError("Notitie en categorie zijn verplicht");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onAdd({ text: text.trim(), category: category.trim() });
      setText("");
      setCategory("");
    } catch {
      setError("Opslaan mislukt, probeer het opnieuw");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="rounded-lg border border-neutral-200 bg-white p-4">
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Notitie</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Idee, feitje of losse gedachte voor een quizvraag…"
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-neutral-700">Categorie</label>
          <input
            list="draft-category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
          <datalist id="draft-category-suggestions">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? "Bezig…" : "Kladje opslaan"}
        </button>
      </form>

      {drafts.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-400">
          Nog geen kladjes.
        </p>
      ) : (
        <ul className="space-y-2">
          {drafts.map((d) => (
            <DraftRow key={d.id} draft={d} onConvert={onConvert} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
