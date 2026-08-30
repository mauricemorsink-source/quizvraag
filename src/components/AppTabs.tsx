"use client";

import { useMemo, useState } from "react";
import type { Question, Draft, RoundIdea, RoundType } from "@/lib/types";
import KladblokPanel from "@/components/KladblokPanel";
import QuestionCreatePanel from "@/components/QuestionCreatePanel";
import QuestionList from "@/components/QuestionList";
import RoundIdeasPanel from "@/components/RoundIdeasPanel";
import CategoriesPanel, { type CategoryStat } from "@/components/CategoriesPanel";

type Props = {
  initialQuestions: Question[];
  initialDrafts: Draft[];
  initialRoundIdeas: RoundIdea[];
};

type Tab = "kladblok" | "nieuwe-vraag" | "overzicht" | "rondes" | "categorieen";

const TABS: { id: Tab; label: string }[] = [
  { id: "kladblok", label: "Kladblok" },
  { id: "nieuwe-vraag", label: "Quizvraag maken" },
  { id: "overzicht", label: "Overzicht" },
  { id: "rondes", label: "Rondes" },
  { id: "categorieen", label: "Categorieën" },
];

export default function AppTabs({ initialQuestions, initialDrafts, initialRoundIdeas }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overzicht");
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [drafts, setDrafts] = useState<Draft[]>(initialDrafts);
  const [roundIdeas, setRoundIdeas] = useState<RoundIdea[]>(initialRoundIdeas);
  const [conversionDraft, setConversionDraft] = useState<Draft | null>(null);

  const categories = useMemo(
    () =>
      Array.from(
        new Set([...questions.flatMap((q) => q.categories), ...drafts.map((d) => d.category)])
      ).sort(),
    [questions, drafts]
  );

  const categoryStats = useMemo<CategoryStat[]>(() => {
    return categories.map((name) => ({
      name,
      questionCount: questions.filter((q) => q.categories.includes(name)).length,
      draftCount: drafts.filter((d) => d.category === name).length,
    }));
  }, [categories, questions, drafts]);

  // --- Vragen ---

  async function addQuestion(data: { question: string; answer: string; categories: string[]; notes: string }) {
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

  async function bulkAddQuestions(items: { question: string; answer: string; categories: string[] }[]) {
    const res = await fetch("/api/questions/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) throw new Error("Importeren mislukt");
    const { created }: { created: Question[] } = await res.json();
    setQuestions((prev) => [...created, ...prev]);
    return created;
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

  // --- Ronde-ideeën ---

  async function addRoundIdea(data: { title: string; note: string; roundType: RoundType }) {
    const res = await fetch("/api/round-ideas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Opslaan mislukt");
    const created: RoundIdea = await res.json();
    setRoundIdeas((prev) => [created, ...prev]);
  }

  async function updateRoundIdea(id: string, data: { title: string; note: string; roundType: RoundType }) {
    const res = await fetch(`/api/round-ideas/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Bijwerken mislukt");
    const updated: RoundIdea = await res.json();
    setRoundIdeas((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  async function deleteRoundIdea(id: string) {
    const res = await fetch(`/api/round-ideas/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Verwijderen mislukt");
    setRoundIdeas((prev) => prev.filter((i) => i.id !== id));
  }

  // --- Categorieën ---

  async function renameCategory(from: string, to: string) {
    const res = await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to }),
    });
    if (!res.ok) throw new Error("Hernoemen mislukt");
    setQuestions((prev) =>
      prev.map((q) =>
        q.categories.includes(from)
          ? { ...q, categories: Array.from(new Set(q.categories.map((c) => (c === from ? to : c)))) }
          : q
      )
    );
    setDrafts((prev) => prev.map((d) => (d.category === from ? { ...d, category: to } : d)));
  }

  async function deleteCategory(name: string) {
    const res = await fetch(`/api/categories/${encodeURIComponent(name)}`, { method: "DELETE" });
    if (res.status === 409) {
      const body = await res.json();
      return { blocked: true, blockingQuestions: body.blockingQuestions, blockingDrafts: body.blockingDrafts };
    }
    if (!res.ok) throw new Error("Verwijderen mislukt");
    setQuestions((prev) =>
      prev.map((q) =>
        q.categories.includes(name) ? { ...q, categories: q.categories.filter((c) => c !== name) } : q
      )
    );
    return {};
  }

  return (
    <div>
      <div className="no-scrollbar mb-5 flex gap-1 overflow-x-auto rounded-xl border border-neutral-200 bg-white p-1 shadow-sm">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800"
            }`}
          >
            {tab.label}
            {tab.id === "kladblok" && drafts.length > 0 && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-xs ${
                  activeTab === tab.id ? "bg-white/20 text-white" : "bg-amber-100 text-amber-700"
                }`}
              >
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
          onBulkImport={bulkAddQuestions}
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

      {activeTab === "rondes" && (
        <RoundIdeasPanel
          ideas={roundIdeas}
          onAdd={addRoundIdea}
          onUpdate={updateRoundIdea}
          onDelete={deleteRoundIdea}
        />
      )}

      {activeTab === "categorieen" && (
        <CategoriesPanel stats={categoryStats} onRename={renameCategory} onDelete={deleteCategory} />
      )}
    </div>
  );
}
