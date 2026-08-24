"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";

type Props = {
  question: Question;
  categories: string[];
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function QuestionRow({ question, categories, onUpdate, onDelete }: Props) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (editing) {
    return (
      <li>
        <QuestionForm
          categories={categories}
          initial={question}
          submitLabel="Opslaan"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await onUpdate(question.id, data);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
              {question.category}
            </span>
            {question.used && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                Gebruikt
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-900">{question.question}</p>

          <button
            type="button"
            onClick={() => setShowAnswer((v) => !v)}
            className="mt-2 text-xs font-medium text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
          >
            {showAnswer ? "Verberg antwoord" : "Toon antwoord"}
          </button>
          {showAnswer && <p className="mt-1 text-sm text-neutral-600">{question.answer}</p>}
          {question.notes && <p className="mt-1 text-xs text-neutral-400">{question.notes}</p>}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <button
            type="button"
            onClick={() => onUpdate(question.id, { used: !question.used })}
            className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
          >
            {question.used ? "Markeer ongebruikt" : "Markeer gebruikt"}
          </button>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs text-neutral-600 transition hover:bg-neutral-100"
            >
              Bewerken
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={async () => {
                if (!confirm("Deze vraag verwijderen?")) return;
                setDeleting(true);
                await onDelete(question.id);
              }}
              className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </li>
  );
}
