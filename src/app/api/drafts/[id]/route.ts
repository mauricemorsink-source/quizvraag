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

  const data: { text?: string; category?: string } = {};
  if (typeof body.text === "string") data.text = body.text.trim();
  if (typeof body.category === "string") data.category = body.category.trim();

  try {
    const updated = await prisma.draft.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Kladje niet gevonden" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.draft.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Kladje niet gevonden" }, { status: 404 });
  }
}
