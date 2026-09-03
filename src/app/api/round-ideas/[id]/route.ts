import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isRoundType, type RoundType } from "@/lib/types";

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
    title?: string;
    note?: string | null;
    roundType?: RoundType;
    imageUrl?: string | null;
    answer?: string | null;
    mediaUrl?: string | null;
  } = {};
  if (typeof body.title === "string") data.title = body.title.trim();
  if (typeof body.note === "string") data.note = body.note.trim() || null;
  if (isRoundType(body.roundType)) {
    data.roundType = body.roundType;
  }
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl.trim() || null;
  if (typeof body.answer === "string") data.answer = body.answer.trim() || null;
  if (typeof body.mediaUrl === "string") data.mediaUrl = body.mediaUrl.trim() || null;

  try {
    const updated = await prisma.roundIdea.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Idee niet gevonden" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.roundIdea.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Idee niet gevonden" }, { status: 404 });
  }
}
