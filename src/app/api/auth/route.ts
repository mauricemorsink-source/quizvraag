import { NextRequest, NextResponse } from "next/server";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth";
import { checkPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password || !checkPassword(password)) {
    return NextResponse.json({ error: "Onjuist wachtwoord" }, { status: 401 });
  }

  await setSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
