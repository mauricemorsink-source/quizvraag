import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const from = typeof body?.from === "string" ? body.from.trim() : "";
  const to = typeof body?.to === "string" ? body.to.trim() : "";

  if (!from || !to) {
    return NextResponse.json({ error: "Beide namen zijn verplicht" }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ questionsUpdated: 0, draftsUpdated: 0 });
  }

  const questions = await prisma.question.findMany({ where: { categories: { has: from } } });
  for (const q of questions) {
    const updated = Array.from(new Set(q.categories.map((c) => (c === from ? to : c))));
    await prisma.question.update({ where: { id: q.id }, data: { categories: updated } });
  }

  const draftsResult = await prisma.draft.updateMany({ where: { category: from }, data: { category: to } });

  return NextResponse.json({ questionsUpdated: questions.length, draftsUpdated: draftsResult.count });
}
