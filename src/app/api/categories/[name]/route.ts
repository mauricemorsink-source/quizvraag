import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;

  const blockingQuestions = await prisma.question.count({
    where: { categories: { equals: [name] } },
  });
  const blockingDrafts = await prisma.draft.count({ where: { category: name } });

  if (blockingQuestions > 0 || blockingDrafts > 0) {
    return NextResponse.json(
      { error: "blocked", blockingQuestions, blockingDrafts },
      { status: 409 }
    );
  }

  const questions = await prisma.question.findMany({ where: { categories: { has: name } } });
  for (const q of questions) {
    const updated = q.categories.filter((c) => c !== name);
    await prisma.question.update({ where: { id: q.id }, data: { categories: updated } });
  }

  return NextResponse.json({ questionsUpdated: questions.length });
}
