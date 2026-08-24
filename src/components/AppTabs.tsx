"use client";

import { useMemo, useState } from "react";
import type { Question, Draft } from "@/lib/types";
import KladblokPanel from "@/components/KladblokPanel";
import QuestionCreatePanel from "@/components/QuestionCreatePanel";
import QuestionList from "@/components/QuestionList";

type Props = {
  initialQuestions: Question[];
  initialDrafts: Draft[];
};

type Tab = "kladblok" | "nieuwe-vraag" | "overzicht";

const TABS: { id: Tab; label: string }[] = [
  { id: "kladblok", label: "Kladblok" },
  { id: "nieuwe-vraag", label: "Quizvraag maken" },
  { id: "overzicht", label: "Overzicht" },
];

export default function AppTabs({ initialQuestions, initialDrafts }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overzicht");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [conversionDraft, setConversionDraft] = useState<Draft | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set([...questions.map((q) => q.category), ...drafts.map((d) => d.category)])
      ).sort(),
    [questions, drafts]
  );

  // --- Vragen ---

  async function addQuestion(data: { question: string; answer: string; category: string; notes: string }) {
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Opslaan mislukt");
    const created: Question = await res.json();
    setQuestions((prev) => [created, ...prev]);

    if (conversionDraft) {
      const draftId = conversionDraft.id;
      setConversionDraft(null);
      await deleteDraft(draftId);
    }
  }

  async function updateQuestion(id: string, data: Record<string, unknown>) {
    const res = await fetch(`/api/questions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Bijwerken mislukt");
    const updated: Question = await res.json();
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)));
  }

  async function deleteQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Verwijderen mislukt");
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }

  // --- Kladjes ---

  async function addDraft(data: { text: string; category: string }) {
    const res = await fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Opslaan mislukt");
    const created: Draft = await res.json();
    setDrafts((prev) => [created, ...prev]);
  }

  async function deleteDraft(id: string) {
    const res = await fetch(`/api/drafts/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Verwijderen mislukt");
    setDrafts((prev) => prev.filter((d) => d.id !== id));
  }

  function convertDraft(draft: Draft) {
    setConversionDraft(draft);
    setActiveTab("nieuwe-vraag");
  }

  return (
    <div>
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px shrink-0 whitespace-nowrap border-b-2 px-2.5 py-2.5 text-sm font-medium transition ${
              activeTab === tab.id
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-400 hover:text-neutral-600"
            }`}
          >
            {tab.label}
            {tab.id === "kladblok" && drafts.length > 0 && (
              <span className="ml-1.5 rounded-full bg-neutral-100 px-1.5 py-0.5 text-xs text-neutral-500">
                {drafts.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === "kladblok" && (
        <KladblokPanel
          drafts={drafts}
          categories={categories}
          onAdd={addDraft}
          onDelete={deleteDraft}
          onConvert={convertDraft}
        />
      )}

      {activeTab === "nieuwe-vraag" && (
        <QuestionCreatePanel
          categories={categories}
          conversionDraft={conversionDraft}
          onCancelConversion={() => setConversionDraft(null)}
          onSubmit={addQuestion}
        />
      )}

      {activeTab === "overzicht" && (
        <QuestionList
          questions={questions}
          categories={categories}
          onUpdate={updateQuestion}
          onDelete={deleteQuestion}
        />
      )}
    </div>
  );
}
