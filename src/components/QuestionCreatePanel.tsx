"use client";

import type { Draft } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";

type Props = {
  categories: string[];
  conversionDraft: Draft | null;
  onCancelConversion: () => void;
  onSubmit: (data: { question: string; answer: string; category: string; notes: string }) => Promise<void>;
};

export default function QuestionCreatePanel({
  categories,
  conversionDraft,
  onCancelConversion,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-4">
      {conversionDraft && (
        <div className="flex items-center justify-between rounded-lg border border-neutral-300 bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
          <span>
            Kladje wordt omgezet — categorie <strong>{conversionDraft.category}</strong> is al ingevuld. Na
            opslaan wordt het kladje verwijderd.
          </span>
          <button
            type="button"
            onClick={onCancelConversion}
            className="ml-3 shrink-0 text-neutral-400 underline underline-offset-2 hover:text-neutral-700"
          >
            Loskoppelen
          </button>
        </div>
      )}

      <QuestionForm
        key={conversionDraft?.id ?? "new"}
        categories={categories}
        initial={
          conversionDraft
            ? { question: conversionDraft.text, answer: "", category: conversionDraft.category, notes: null }
            : undefined
        }
        submitLabel="Vraag opslaan"
        onSubmit={onSubmit}
      />
    </div>
  );
}
