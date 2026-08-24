import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Ongeldige aanvraag" }, { status: 400 });
  }

  const data: {
    question?: string;
    answer?: string;
    category?: string;
    notes?: string | null;
    used?: boolean;
    usedAt?: Date | null;
  } = {};

  if (typeof body.question === "string") data.question = body.question.trim();
  if (typeof body.answer === "string") data.answer = body.answer.trim();
  if (typeof body.category === "string") data.category = body.category.trim();
  if (typeof body.notes === "string") data.notes = body.notes.trim() || null;

  if (typeof body.used === "boolean") {
    data.used = body.used;
    data.usedAt = body.used ? new Date() : null;
  }

  try {
    const updated = await prisma.question.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Vraag niet gevonden" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.question.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Vraag niet gevonden" }, { status: 404 });
  }
}
