"use client";

import { useState } from "react";
import type { Draft } from "@/lib/types";

type Props = {
  draft: Draft;
  onConvert: (draft: Draft) => void;
  onDelete: (id: string) => Promise<void>;
};

export default function DraftRow({ draft, onConvert, onDelete }: Props) {
  const [deleting, setDeleting] = useState(false);

  return (
    <li className="rounded-lg border border-neutral-200 bg-white p-4">
      <span className="mb-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
        {draft.category}
      </span>
      <p className="whitespace-pre-wrap text-sm text-neutral-900">{draft.text}</p>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => onConvert(draft)}
          className="rounded-md bg-neutral-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-neutral-700"
        >
          Omzetten naar vraag
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={async () => {
            if (!confirm("Dit kladje verwijderen?")) return;
            setDeleting(true);
            await onDelete(draft.id);
          }}
          className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
        >
          Verwijderen
        </button>
      </div>
    </li>
  );
}
