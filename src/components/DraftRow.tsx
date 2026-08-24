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
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="mb-1 inline-block rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-600">
            {draft.category}
          </span>
          <p className="whitespace-pre-wrap text-sm text-neutral-900">{draft.text}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onConvert(draft)}
            className="rounded-md bg-neutral-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-neutral-700"
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
            className="rounded-md border border-red-200 px-2.5 py-1 text-xs text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </li>
  );
}
