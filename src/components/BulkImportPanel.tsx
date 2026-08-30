"use client";

import { useState } from "react";
import type { Question } from "@/lib/types";

type ParsedRow = { question: string; answer: string; categories: string[] };

type Props = {
  categories: string[];
  onImport: (items: ParsedRow[]) => Promise<Question[]>;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

function parseBulkText(text: string, existingCategories: string[]): { rows: ParsedRow[]; skipped: number } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: ParsedRow[] = [];
  let skipped = 0;

  for (const line of lines) {
    const cols = line.split("\t").map((c) => c.trim());
    let categoryRaw: string;
    let question: string;
    let answer: string;

    if (cols.length >= 4) {
      // volgnummer, categorie, vraag, antwoord (extra kolommen genegeerd)
      [, categoryRaw, question, answer] = cols;
    } else if (cols.length === 3) {
      [categoryRaw, question, answer] = cols;
    } else {
      skipped++;
      continue;
    }

    if (!question || !answer || !categoryRaw) {
      skipped++;
      continue;
    }

    const categories = categoryRaw
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean)
      .map((c) => existingCategories.find((e) => e.toLowerCase() === c.toLowerCase()) ?? c);

    if (categories.length === 0) {
      skipped++;
      continue;
    }

    rows.push({ question, answer, categories });
  }

  return { rows, skipped };
}

export default function BulkImportPanel({ categories, onImport }: Props) {
  const [text, setText] = useState("");
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [skipped, setSkipped] = useState(0);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleParse() {
    setError(null);
    setResult(null);
    const { rows, skipped } = parseBulkText(text, categories);
    if (rows.length === 0) {
      setError("Geen geldige rijen gevonden. Verwacht per regel: categorie [tab] vraag [tab] antwoord.");
      setParsed(null);
      return;
    }
    setParsed(rows);
    setSkipped(skipped);
  }

  function removeRow(index: number) {
    setParsed((prev) => (prev ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleImport() {
    if (!parsed || parsed.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const created = await onImport(parsed);
      setResult(`${created.length} vragen toegevoegd.`);
      setParsed(null);
      setText("");
    } catch {
      setError("Importeren mislukt, probeer het opnieuw.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="animate-fade-in rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm text-neutral-600">
        Plak meerdere vragen tegelijk, één per regel. Verwacht formaat per regel (gescheiden door tabs, zoals
        gekopieerd uit een spreadsheet): <strong>categorie</strong> · <strong>vraag</strong> ·{" "}
        <strong>antwoord</strong> (een volgnummer vooraan mag ook, dat wordt genegeerd). Meerdere categorieën
        kun je scheiden met een komma.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        placeholder={"Sport\tWie werd wereldkampioen in 2026?\tSpanje"}
        className={`${fieldClass} font-mono text-xs`}
      />

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={handleParse}
          disabled={!text.trim()}
          className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
        >
          Vragen herkennen
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      {result && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{result}</p>}

      {parsed && (
        <div className="mt-4 border-t border-neutral-100 pt-4">
          <p className="mb-2 text-xs text-neutral-400">
            {parsed.length} vraag{parsed.length === 1 ? "" : "en"} herkend
            {skipped > 0 ? ` · ${skipped} regel${skipped === 1 ? "" : "s"} overgeslagen (niet herkend)` : ""}
          </p>
          <ul className="max-h-80 space-y-1.5 overflow-y-auto">
            {parsed.map((row, i) => (
              <li
                key={i}
                className="flex items-start justify-between gap-2 rounded-lg border border-neutral-100 bg-neutral-50 px-3 py-2 text-xs"
              >
                <div className="min-w-0">
                  <span className="mr-1.5 rounded-full bg-indigo-100 px-1.5 py-0.5 font-medium text-indigo-700">
                    {row.categories.join(", ")}
                  </span>
                  <span className="text-neutral-700">{row.question}</span>
                  <span className="text-neutral-400"> — {row.answer}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  aria-label="Rij verwijderen"
                  className="shrink-0 text-neutral-400 hover:text-red-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handleImport}
            disabled={importing || parsed.length === 0}
            className="mt-3 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            {importing ? "Bezig…" : `${parsed.length} vragen toevoegen`}
          </button>
        </div>
      )}
    </div>
  );
}
