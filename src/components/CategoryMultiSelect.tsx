"use client";

import { useState } from "react";

type Props = {
  categories: string[];
  value: string[];
  onChange: (value: string[]) => void;
};

const NEW_OPTION = "__new__";

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function CategoryMultiSelect({ categories, value, onChange }: Props) {
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState("");

  const available = categories.filter((c) => !value.includes(c));

  function addCategory(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
  }

  function removeCategory(cat: string) {
    onChange(value.filter((c) => c !== cat));
  }

  function commitNew() {
    addCategory(newValue);
    setNewValue("");
    setAddingNew(false);
  }

  return (
    <div>
      {value.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {value.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-1 pl-2.5 pr-1 text-xs font-medium text-indigo-700"
            >
              {c}
              <button
                type="button"
                onClick={() => removeCategory(c)}
                aria-label={`${c} verwijderen`}
                className="flex h-6 w-6 items-center justify-center rounded-full text-base leading-none text-indigo-400 transition hover:bg-indigo-100 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {addingNew ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitNew();
              }
            }}
            placeholder="Nieuwe categorie…"
            className={fieldClass}
          />
          <button
            type="button"
            onClick={commitNew}
            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            Toevoegen
          </button>
          <button
            type="button"
            onClick={() => {
              setAddingNew(false);
              setNewValue("");
            }}
            className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-50"
          >
            Annuleren
          </button>
        </div>
      ) : (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value === NEW_OPTION) {
              setAddingNew(true);
            } else if (e.target.value) {
              addCategory(e.target.value);
            }
          }}
          className={fieldClass}
        >
          <option value="">{available.length > 0 ? "Categorie toevoegen…" : "Alle categorieën toegevoegd"}</option>
          {available.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={NEW_OPTION}>+ Nieuwe categorie…</option>
        </select>
      )}
    </div>
  );
}
