import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRoundType } from "@/lib/types";

export async function GET() {
  const ideas = await prisma.roundIdea.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(ideas);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  const roundType = body?.roundType;

  if (!title || !isRoundType(roundType)) {
    return NextResponse.json({ error: "Titel en rondetype zijn verplicht" }, { status: 400 });
  }

  const created = await prisma.roundIdea.create({
    data: { title, note: note || null, roundType },
  });
  return NextResponse.json(created, { status: 201 });
}
