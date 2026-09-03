"use client";

import { useMemo, useState } from "react";
import { ROUND_TYPES, ROUND_TYPE_LABELS, type RoundIdea, type RoundType } from "@/lib/types";
import RoundIdeaForm from "@/components/RoundIdeaForm";
import RoundIdeaRow from "@/components/RoundIdeaRow";

type RoundIdeaInput = {
  title: string;
  note: string;
  roundType: RoundType;
  imageUrl: string;
  answer: string;
  mediaUrl: string;
};

type Props = {
  ideas: RoundIdea[];
  onAdd: (data: RoundIdeaInput) => Promise<void>;
  onUpdate: (id: string, data: RoundIdeaInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

const selectClass =
  "rounded-lg border border-neutral-300 bg-white px-2.5 py-2 text-sm text-neutral-700 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function RoundIdeasPanel({ ideas, onAdd, onUpdate, onDelete }: Props) {
  const [typeFilter, setTypeFilter] = useState<RoundType | "all">("all");

  const filtered = useMemo(
    () => (typeFilter === "all" ? ideas : ideas.filter((i) => i.roundType === typeFilter)),
    [ideas, typeFilter]
  );

  return (
    <div className="space-y-4">
      <RoundIdeaForm submitLabel="Idee opslaan" onSubmit={onAdd} />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as RoundType | "all")} className={selectClass}>
          <option value="all">Alle rondetypes</option>
          {ROUND_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {ROUND_TYPE_LABELS[rt]}
            </option>
          ))}
        </select>
      </div>

      <p className="px-1 text-xs text-neutral-400">
        {filtered.length} van {ideas.length} idee{ideas.length === 1 ? "" : "ën"}
      </p>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-neutral-400">
            {ideas.length === 0 ? "Nog geen ideeën. Begin hierboven met een nieuw idee." : "Geen ideeën in dit rondetype."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {filtered.map((idea) => (
            <RoundIdeaRow key={idea.id} idea={idea} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
