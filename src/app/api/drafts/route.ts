import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const drafts = await prisma.draft.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(drafts);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  const category = typeof body?.category === "string" ? body.category.trim() : "";

  if (!text || !category) {
    return NextResponse.json({ error: "Notitie en categorie zijn verplicht" }, { status: 400 });
  }

  const created = await prisma.draft.create({ data: { text, category } });
  return NextResponse.json(created, { status: 201 });
}
