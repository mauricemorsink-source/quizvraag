"use client";

import { useRef, useState } from "react";
import { ROUND_TYPES, ROUND_TYPE_LABELS, type RoundIdea, type RoundType } from "@/lib/types";

type Props = {
  initial?: Pick<RoundIdea, "title" | "note" | "roundType" | "imageUrl" | "answer" | "mediaUrl">;
  submitLabel: string;
  onSubmit: (data: {
    title: string;
    note: string;
    roundType: RoundType;
    imageUrl: string;
    answer: string;
    mediaUrl: string;
  }) => Promise<void>;
  onCancel?: () => void;
};

const fieldClass =
  "w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100";

export default function RoundIdeaForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [note, setNote] = useState(initial?.note ?? "");
  const [roundType, setRoundType] = useState<RoundType>(initial?.roundType ?? "MUZIEKRONDE");
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [answer, setAnswer] = useState(initial?.answer ?? "");
  const [mediaUrl, setMediaUrl] = useState(initial?.mediaUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/round-image", { method: "POST", body: formData });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "Upload mislukt");
        return;
      }
      setImageUrl(body.url);
    } catch {
      setError("Upload mislukt, probeer het opnieuw");
    } finally {
      setUploading(false);
    }
  }

  async function uploadFromUrl(url: string) {
    setError(null);
    setUploading(true);
    try {
      const res = await fetch("/api/upload/round-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const body = await res.json();
      if (!res.ok) {
        setError(body?.error ?? "Ophalen van afbeelding mislukt");
        return;
      }
      setImageUrl(body.url);
    } catch {
      setError("Ophalen van afbeelding mislukt, probeer het opnieuw");
    } finally {
      setUploading(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragActive(false);

    const droppedFile = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
    if (droppedFile) {
      await uploadFile(droppedFile);
      return;
    }

    // Slepen vanaf een andere pagina levert meestal geen bestand, maar een URL
    // (text/uri-list of een stukje HTML met een <img src>).
    const uriList = e.dataTransfer.getData("text/uri-list");
    const html = e.dataTransfer.getData("text/html");
    const plain = e.dataTransfer.getData("text/plain");
    const fromHtml = html.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];
    const candidate = [uriList, fromHtml, plain]
      .map((v) => v?.split("\n").find((l) => l.trim() && !l.trim().startsWith("#"))?.trim())
      .find(Boolean);

    if (candidate) {
      await uploadFromUrl(candidate);
      return;
    }

    setError("Geen afbeelding herkend in wat je hebt gesleept");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Titel is verplicht");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await onSubmit({
        title: title.trim(),
        note: note.trim(),
        roundType,
        imageUrl: imageUrl.trim(),
        answer: answer.trim(),
        mediaUrl: mediaUrl.trim(),
      });
      if (!initial) {
        setTitle("");
        setNote("");
        setRoundType("MUZIEKRONDE");
        setImageUrl("");
        setAnswer("");
        setMediaUrl("");
      }
    } catch {
      setError("Opslaan mislukt, probeer het opnieuw");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="animate-fade-in rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Titel</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Bijv. Jaren 90-hits, Vlaggen raden…"
          className={fieldClass}
        />
      </div>

      <div className="mb-3.5">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Rondetype</label>
        <select value={roundType} onChange={(e) => setRoundType(e.target.value as RoundType)} className={fieldClass}>
          {ROUND_TYPES.map((rt) => (
            <option key={rt} value={rt}>
              {ROUND_TYPE_LABELS[rt]}
            </option>
          ))}
        </select>
      </div>

      {roundType === "PLAATJESRONDE" && (
        <div className="animate-fade-in mb-3.5 space-y-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Afbeelding</label>
            {imageUrl ? (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="h-16 w-16 rounded-lg object-cover ring-1 ring-neutral-200" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="text-xs font-medium text-red-600 underline underline-offset-2 hover:text-red-800"
                >
                  Verwijderen
                </button>
              </div>
            ) : (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`rounded-lg border-2 border-dashed p-4 text-center transition ${
                  dragActive ? "border-indigo-400 bg-indigo-50" : "border-neutral-300 bg-white"
                }`}
              >
                <p className="mb-2 text-xs text-neutral-500">
                  Sleep een afbeelding hierheen (ook vanaf een andere pagina), of kies een bestand:
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-neutral-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-teal-700"
                />
              </div>
            )}
            {uploading && <p className="mt-1 text-xs text-neutral-400">Bezig met ophalen…</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-700">Antwoord</label>
            <input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Wat is het juiste antwoord bij de afbeelding?"
              className={fieldClass}
            />
          </div>
        </div>
      )}

      {roundType === "MUZIEKRONDE" && (
        <div className="animate-fade-in mb-3.5">
          <label className="mb-1.5 block text-sm font-medium text-neutral-700">Link naar fragment (optioneel)</label>
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Spotify- of YouTube-link…"
            className={fieldClass}
          />
        </div>
      )}

      <div className="mb-4">
        <label className="mb-1.5 block text-sm font-medium text-neutral-700">Notitie (optioneel)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Uitwerking, bronnen, aantekeningen…"
          className={fieldClass}
        />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
        >
          {saving ? "Bezig…" : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-50"
          >
            Annuleren
          </button>
        )}
      </div>
    </form>
  );
}
