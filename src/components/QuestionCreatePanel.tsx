"use client";

import { useState } from "react";
import type { Draft, Question } from "@/lib/types";
import QuestionForm from "@/components/QuestionForm";
import BulkImportPanel from "@/components/BulkImportPanel";

type Props = {
  categories: string[];
  conversionDraft: Draft | null;
  onCancelConversion: () => void;
  onSubmit: (data: { question: string; answer: string; categories: string[]; notes: string }) => Promise<void>;
  onBulkImport: (items: { question: string; answer: string; categories: string[] }[]) => Promise<Question[]>;
};

export default function QuestionCreatePanel({
  categories,
  conversionDraft,
  onCancelConversion,
  onSubmit,
  onBulkImport,
}: Props) {
  const [mode, setMode] = useState<"single" | "bulk">("single");

  return (
    <div className="space-y-4">
      {conversionDraft && (
        <div className="animate-fade-in flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm">
          <span>
            Kladje wordt omgezet
            {conversionDraft.category ? (
              <>
                {" "}
                — categorie <strong>{conversionDraft.category}</strong> is al ingevuld
              </>
            ) : null}
            . Na opslaan wordt het kladje verwijderd.
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

      {!conversionDraft && (
        <div className="flex gap-1 text-sm">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              mode === "single" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            Eén vraag
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={`rounded-lg px-3 py-1.5 font-medium transition ${
              mode === "bulk" ? "bg-neutral-900 text-white" : "text-neutral-500 hover:bg-neutral-100"
            }`}
          >
            Meerdere plakken
          </button>
        </div>
      )}

      {mode === "single" || conversionDraft ? (
        <QuestionForm
          key={conversionDraft?.id ?? "new"}
          categories={categories}
          initial={
            conversionDraft
              ? {
                  question: conversionDraft.text,
                  answer: "",
                  categories: conversionDraft.category ? [conversionDraft.category] : [],
                  notes: null,
                }
              : undefined
          }
          submitLabel="Vraag opslaan"
          onSubmit={onSubmit}
          aiAssist={!!conversionDraft}
        />
      ) : (
        <BulkImportPanel categories={categories} onImport={onBulkImport} />
      )}
    </div>
  );
}
