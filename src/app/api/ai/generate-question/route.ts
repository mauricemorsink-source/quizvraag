import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { prisma } from "@/lib/prisma";

// Kortlopende limiet per IP: voorkomt dat één client de API in korte tijd leegtrekt.
// Dit is in-memory (per serverfunctie-instantie) — bedoeld als eerste, snelle drempel,
// niet als sluitende garantie op serverless. De dagelijkse cap hieronder is de harde grens.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_PER_WINDOW = 5;
const recentRequestsByIp = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (recentRequestsByIp.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  recentRequestsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_PER_WINDOW;
}

const DAILY_LIMIT = Number(process.env.AI_DAILY_LIMIT) || 200;

async function isOverDailyLimit(): Promise<boolean> {
  const day = new Date().toISOString().slice(0, 10);
  const existing = await prisma.aiUsage.findUnique({ where: { day } });
  if (existing && existing.count >= DAILY_LIMIT) return true;

  await prisma.aiUsage.upsert({
    where: { day },
    create: { day, count: 1 },
    update: { count: { increment: 1 } },
  });
  return false;
}

const SuggestionSchema = z.object({
  question: z.string().describe("De pubquizvraag, in het Nederlands."),
  answer: z.string().describe("Het correcte antwoord, kort en to-the-point."),
  notes: z
    .string()
    .describe(
      "Leeg als het kladje voldoende concreet was. Anders: wat er precies gecontroleerd moet worden voordat de vraag gebruikt wordt."
    ),
  confidence: z
    .enum(["hoog", "laag"])
    .describe("'laag' als het kladje te vaag/onvolledig was om zeker te zijn van de feiten."),
});

const SYSTEM_PROMPT = `Je helpt bij het maken van vragen voor een Nederlandse pubquiz, op basis van een los kladje (een ruwe notitie, aantekening of los feitje) van de gebruiker.

Regels, zonder uitzondering:
- Baseer de vraag en het antwoord UITSLUITEND op wat expliciet in het kladje staat of daar onmiskenbaar uit volgt. Verzin nooit aanvullende feiten, jaartallen, namen, getallen of details die niet in het kladje staan.
- Als het kladje te vaag of onvolledig is om er een eenduidige, controleerbare pubquizvraag van te maken, doe dan de beste redelijke poging maar zet "confidence" op "laag" en leg in "notes" kort uit wat er precies gecontroleerd moet worden.
- Als het kladje wel voldoende concreet is, zet "confidence" op "hoog" en laat "notes" leeg ("").
- De vraag moet één duidelijk, ondubbelzinnig antwoord hebben — geen vraag met meerdere mogelijke goede antwoorden.
- Het antwoord moet kort en to-the-point zijn (geen hele zin, tenzij dat nodig is voor de duidelijkheid).
- Schrijf in natuurlijk Nederlands, in de toon van een gezellige pubquiz — niet formeel of stijf.
- Geef uitsluitend het gevraagde object terug, zonder extra uitleg erbuiten.`;

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI-functie is niet geconfigureerd: ANTHROPIC_API_KEY ontbreekt in .env." },
      { status: 501 }
    );
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Te veel verzoeken, probeer over een minuutje opnieuw." },
      { status: 429 }
    );
  }
  if (await isOverDailyLimit()) {
    return NextResponse.json(
      { error: "Dagelijkse limiet voor AI-suggesties is bereikt, probeer morgen opnieuw." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";

  if (!text) {
    return NextResponse.json({ error: "Kladjetekst is verplicht" }, { status: 400 });
  }

  const client = new Anthropic(
    process.env.ANTHROPIC_WORKSPACE_ID
      ? { defaultHeaders: { "anthropic-workspace-id": process.env.ANTHROPIC_WORKSPACE_ID } }
      : undefined
  );
  const userMessage = category ? `Categorie: ${category}\n\nKladje:\n${text}` : `Kladje:\n${text}`;

  try {
    const response = await client.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
      output_config: { format: zodOutputFormat(SuggestionSchema) },
    });

    if (!response.parsed_output) {
      return NextResponse.json({ error: "AI-suggestie kon niet worden verwerkt" }, { status: 502 });
    }

    return NextResponse.json(response.parsed_output);
  } catch (err) {
    console.error("AI generate-question mislukt", err);
    if (err instanceof Anthropic.APIError && /workspace/i.test(err.message)) {
      return NextResponse.json(
        {
          error:
            "AI-functie is niet volledig geconfigureerd: deze API key vereist een ANTHROPIC_WORKSPACE_ID in .env (te vinden in de Anthropic Console bij je workspace-instellingen).",
        },
        { status: 501 }
      );
    }
    return NextResponse.json({ error: "AI-suggestie genereren mislukt, probeer het opnieuw" }, { status: 502 });
  }
}
