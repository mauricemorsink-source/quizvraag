"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";
import ConfirmDialog from "@/components/ConfirmDialog";

type Props = {
  draft: Draft;
  onConvert: (draft: Draft) => void;
  onDelete: (id: string) => Promise<void>;
};

export default function DraftRow({ draft, onConvert, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <li className="animate-fade-in rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <span className="mb-1.5 inline-block rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
        {draft.category}
      </span>
      <p className="whitespace-pre-wrap text-[0.95rem] leading-snug text-neutral-900">{draft.text}</p>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => onConvert(draft)}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
        >
          Omzetten naar vraag
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
        title="Kladje verwijderen"
        message="Weet je zeker dat je dit kladje wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          setDeleting(true);
          await onDelete(draft.id);
        }}
      />
    </li>
  );
}
