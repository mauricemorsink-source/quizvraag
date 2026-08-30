"use client";

import { useState } from "react";
import ConfirmDialog from "@/components/ConfirmDialog";

export type CategoryStat = { name: string; questionCount: number; draftCount: number };

type Props = {
  stats: CategoryStat[];
  onRename: (from: string, to: string) => Promise<void>;
  onDelete: (name: string) => Promise<{ blocked?: boolean; blockingQuestions?: number; blockingDrafts?: number }>;
};

function CategoryRow({ stat, onRename, onDelete }: { stat: CategoryStat } & Omit<Props, "stats">) {
  const [renaming, setRenaming] = useState(false);
  const [newName, setNewName] = useState(stat.name);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function commitRename() {
    if (!newName.trim() || newName.trim() === stat.name) {
      setRenaming(false);
      setNewName(stat.name);
      return;
    }
    setSaving(true);
    try {
      await onRename(stat.name, newName.trim());
      setRenaming(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setConfirmOpen(false);
    setBlockedMessage(null);
    setDeleting(true);
    try {
      const result = await onDelete(stat.name);
      if (result.blocked) {
        const parts = [];
        if (result.blockingQuestions) parts.push(`${result.blockingQuestions} vraag/vragen (enige categorie)`);
        if (result.blockingDrafts) parts.push(`${result.blockingDrafts} kladje(s)`);
        setBlockedMessage(
          `Kan niet verwijderd worden: ${parts.join(" en ")} gebruiken deze categorie. Pas die eerst aan.`
        );
      }
    } finally {
      setDeleting(false);
    }
  }

  if (renaming) {
    return (
      <li className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && commitRename()}
          className="flex-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="button"
          onClick={commitRename}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Bezig…" : "Opslaan"}
        </button>
        <button
          type="button"
          onClick={() => {
            setRenaming(false);
            setNewName(stat.name);
          }}
          className="rounded-lg border border-neutral-200 px-3 py-1.5 text-sm text-neutral-500 hover:bg-neutral-50"
        >
          Annuleren
        </button>
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="font-medium text-neutral-900">{stat.name}</span>
          <span className="ml-2 text-xs text-neutral-400">
            {stat.questionCount} {stat.questionCount === 1 ? "vraag" : "vragen"}
            {stat.draftCount > 0 ? ` · ${stat.draftCount} kladje(s)` : ""}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setRenaming(true)}
            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Hernoemen / samenvoegen
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Verwijderen
          </button>
        </div>
      </div>
      {blockedMessage && <p className="mt-2 text-xs text-red-600">{blockedMessage}</p>}

      <ConfirmDialog
        open={confirmOpen}
        title="Categorie verwijderen"
        message={`Weet je zeker dat je "${stat.name}" wilt verwijderen? Dit haalt de categorie weg bij alle vragen die 'm gebruiken (naast andere categorieën).`}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
      />
    </li>
  );
}

export default function CategoriesPanel({ stats, onRename, onDelete }: Props) {
  return (
    <div className="space-y-3">
      <p className="rounded-xl border border-neutral-200 bg-white p-3 text-sm text-neutral-500 shadow-sm">
        Categorieën hernoemen (of samenvoegen door de naam van een bestaande categorie in te vullen) of
        verwijderen. Verwijderen kan alleen als geen enkele vraag deze categorie als enige heeft.
      </p>
      {stats.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-neutral-400">Nog geen categorieën.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {stats.map((stat) => (
            <CategoryRow key={stat.name} stat={stat} onRename={onRename} onDelete={onDelete} />
          ))}
        </ul>
      )}
    </div>
  );
}
