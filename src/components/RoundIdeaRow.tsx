"use client";

import { useState } from "react";
import { ROUND_TYPE_LABELS, type RoundIdea, type RoundType } from "@/lib/types";
import RoundIdeaForm from "@/components/RoundIdeaForm";
import ConfirmDialog from "@/components/ConfirmDialog";

type RoundIdeaInput = {
  title: string;
  note: string;
  roundType: RoundType;
  imageUrl: string;
  answer: string;
  mediaUrl: string;
};

type Props = {
  idea: RoundIdea;
  onUpdate: (id: string, data: RoundIdeaInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function RoundIdeaRow({ idea, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  if (editing) {
    return (
      <li>
        <RoundIdeaForm
          initial={idea}
          submitLabel="Opslaan"
          onCancel={() => setEditing(false)}
          onSubmit={async (data) => {
            await onUpdate(idea.id, data);
            setEditing(false);
          }}
        />
      </li>
    );
  }

  return (
    <li className="animate-fade-in rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <span className="mb-1.5 inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-medium text-teal-700">
        {ROUND_TYPE_LABELS[idea.roundType]}
      </span>
      <p className="text-[0.95rem] font-medium leading-snug text-neutral-900">{idea.title}</p>

      {idea.imageUrl && (
        <div className="mt-2 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={idea.imageUrl}
            alt=""
            className="h-20 w-20 shrink-0 rounded-lg object-cover ring-1 ring-neutral-200"
          />
          {idea.answer && (
            <p className="text-sm text-neutral-600">
              <span className="font-medium text-neutral-700">Antwoord: </span>
              {idea.answer}
            </p>
          )}
        </div>
      )}

      {idea.mediaUrl && (
        <a
          href={idea.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-block break-all text-sm text-indigo-600 underline underline-offset-2 hover:text-indigo-800"
        >
          {idea.mediaUrl}
        </a>
      )}

      {idea.note && <p className="mt-1 whitespace-pre-wrap text-sm text-neutral-600">{idea.note}</p>}

      <div className="mt-3 flex flex-wrap gap-2 border-t border-neutral-100 pt-3">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="rounded-lg border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
        >
          Bewerken
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
        title="Idee verwijderen"
        message="Weet je zeker dat je dit idee wilt verwijderen? Dit kan niet ongedaan worden gemaakt."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async () => {
          setConfirmOpen(false);
          setDeleting(true);
          await onDelete(idea.id);
        }}
      />
    </li>
  );
}
