import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

const MAX_SIZE = 8 * 1024 * 1024;

const BLOCKED_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function isBlockedHost(hostname: string): boolean {
  if (BLOCKED_HOSTNAMES.has(hostname)) return true;
  // Private / link-local IP ranges — best-effort guard, not a full SSRF filter.
  return /^(10\.|172\.(1[6-9]|2\d|3[01])\.|192\.168\.|169\.254\.)/.test(hostname);
}

async function fetchImageFromUrl(rawUrl: string): Promise<{ file: File } | { error: string; status: number }> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { error: "Ongeldige URL", status: 400 };
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { error: "Alleen http(s)-URLs zijn toegestaan", status: 400 };
  }
  if (isBlockedHost(parsed.hostname)) {
    return { error: "Deze URL is niet toegestaan", status: 400 };
  }

  let res: Response;
  try {
    res = await fetch(parsed.toString(), { signal: AbortSignal.timeout(10_000) });
  } catch {
    return { error: "Ophalen van de afbeelding is mislukt", status: 502 };
  }
  if (!res.ok) {
    return { error: "Ophalen van de afbeelding is mislukt", status: 502 };
  }
  const contentType = res.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) {
    return { error: "Die URL wijst niet naar een afbeelding", status: 400 };
  }
  const buffer = await res.arrayBuffer();
  if (buffer.byteLength > MAX_SIZE) {
    return { error: "Afbeelding is te groot (max 8MB)", status: 400 };
  }

  const nameFromUrl = parsed.pathname.split("/").filter(Boolean).pop() || "afbeelding";
  return { file: new File([buffer], nameFromUrl, { type: contentType }) };
}

export async function POST(req: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Afbeeldingen uploaden is niet geconfigureerd: BLOB_READ_WRITE_TOKEN ontbreekt." },
      { status: 501 }
    );
  }

  const contentType = req.headers.get("content-type") ?? "";
  let file: File;

  if (contentType.includes("application/json")) {
    const body = await req.json().catch(() => null);
    const url = typeof body?.url === "string" ? body.url.trim() : "";
    if (!url) {
      return NextResponse.json({ error: "Geen URL ontvangen" }, { status: 400 });
    }
    const result = await fetchImageFromUrl(url);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    file = result.file;
  } else {
    const form = await req.formData().catch(() => null);
    const uploaded = form?.get("file");
    if (!(uploaded instanceof File)) {
      return NextResponse.json({ error: "Geen bestand ontvangen" }, { status: 400 });
    }
    file = uploaded;
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Alleen afbeeldingen zijn toegestaan" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Afbeelding is te groot (max 8MB)" }, { status: 400 });
  }

  const blob = await put(`round-ideas/${Date.now()}-${file.name}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
