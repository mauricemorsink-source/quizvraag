import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeCategories } from "@/lib/categories";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const items = Array.isArray(body?.items) ? body.items : [];

  const toCreate: { question: string; answer: string; categories: string[] }[] = [];
  for (const item of items) {
    const question = typeof item?.question === "string" ? item.question.trim() : "";
    const answer = typeof item?.answer === "string" ? item.answer.trim() : "";
    const categories = normalizeCategories(item?.categories);
    if (!question || !answer || categories.length === 0) continue;
    toCreate.push({ question, answer, categories });
  }

  if (toCreate.length === 0) {
    return NextResponse.json({ error: "Geen geldige vragen gevonden" }, { status: 400 });
  }

  const created = [];
  for (const item of toCreate) {
    created.push(await prisma.question.create({ data: item }));
  }

  return NextResponse.json({ created }, { status: 201 });
}
