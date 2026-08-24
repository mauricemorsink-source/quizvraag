"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";
import ConfirmDialog from "@/components/ConfirmDialog";

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
  const [confirmOpen, setConfirmOpen] = useState(false);

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
    <li className="animate-fade-in rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
          {question.category}
        </span>
        {question.used && (
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            Gebruikt
          </span>
        )}
      </div>
      <p className="text-[0.95rem] leading-snug text-neutral-900">{question.question}</p>

      <button
        type="button"
        onClick={() => setShowAnswer((v) => !v)}
        className="mt-2 text-xs font-medium text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
      >
        {showAnswer ? "Verberg antwoord" : "Toon antwoord"}
      </button>
      {showAnswer && (
        <p className="mt-1.5 rounded-lg bg-neutral-50 px-3 py-2 text-sm text-neutral-700">{question.answer}</p>
      )}
      {question.notes && <p className="mt-1.5 text-xs text-neutral-400">{question.notes}</p>}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => onUpdate(question.id, { used: !question.used })}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            question.used
              ? "border border-neutral-200 text-neutral-500 hover:bg-neutral-50"
              : "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          }`}
        >
          {question.used ? "Markeer ongebruikt" : "Markeer gebruikt"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
        >
          Bewerken
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => setConfirmOpen(true)}
          className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          Verwijderen
        </button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Vraag verwijderen"
        message="Weet je zeker dat je deze vraag wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          setDeleting(true);
          await onDelete(question.id);
        }}
      />
    </li>
  );
}
