import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const used = searchParams.get("used");
  const q = searchParams.get("q");

  const questions = await prisma.question.findMany({
    where: {
      ...(category ? { category } : {}),
      ...(used === "true" ? { used: true } : {}),
      ...(used === "false" ? { used: false } : {}),
      ...(q
        ? {
            OR: [
              { question: { contains: q, mode: "insensitive" } },
              { answer: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(questions);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const answer = typeof body?.answer === "string" ? body.answer.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";
  const notes = typeof body?.notes === "string" ? body.notes.trim() : "";

  if (!question || !answer || !category) {
    return NextResponse.json(
      { error: "Vraag, antwoord en categorie zijn verplicht" },
      { status: 400 }
    );
  }

  const created = await prisma.question.create({
    data: { question, answer, category, notes: notes || null },
  });

  return NextResponse.json(created, { status: 201 });
}
