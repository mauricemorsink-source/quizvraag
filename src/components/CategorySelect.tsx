"use client";

import { useState } from "react";

type Props = {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
};

const NEW_OPTION = "__new__";

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function CategorySelect({ categories, value, onChange }: Props) {
  const [addingNew, setAddingNew] = useState(value !== "" && !categories.includes(value));

  if (addingNew) {
    return (
      <div className="flex gap-2">
        <input
          autoFocus
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nieuwe categorie…"
          className={fieldClass}
        />
        {categories.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setAddingNew(false);
              onChange("");
            }}
            className="shrink-0 rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-500 transition hover:bg-neutral-50"
          >
            Lijst
          </button>
        )}
      </div>
    );
  }

  return (
    <select
      value={categories.includes(value) ? value : ""}
      onChange={(e) => {
        if (e.target.value === NEW_OPTION) {
          setAddingNew(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
      className={fieldClass}
    >
      <option value="" disabled>
        Kies een categorie…
      </option>
      {categories.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
      <option value={NEW_OPTION}>+ Nieuwe categorie…</option>
    </select>
  );
}
