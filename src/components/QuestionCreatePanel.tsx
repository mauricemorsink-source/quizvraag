"use client";

import type { Draft } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";

type Props = {
  categories: string[];
  conversionDraft: Draft | null;
  onCancelConversion: () => void;
  onSubmit: (data: { question: string; answer: string; categories: string[]; notes: string }) => Promise<void>;
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
        <div className="animate-fade-in flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <span>
            Kladje wordt omgezet — categorie <strong>{conversionDraft.category}</strong> is al ingevuld. Na
            opslaan wordt het kladje verwijderd.
          </span>
          <button
            type="button"
            onClick={onCancelConversion}
            className="ml-3 shrink-0 text-amber-600 underline underline-offset-2 hover:text-amber-900"
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
            ? { question: conversionDraft.text, answer: "", categories: [conversionDraft.category], notes: null }
            : undefined
        }
        submitLabel="Vraag opslaan"
        onSubmit={onSubmit}
      />
    </div>
  );
}
