import { timingSafeEqual } from "crypto";

// Losstaand van lib/auth.ts: gebruikt Node's `crypto` en mag daarom nooit
// door de (Edge) middleware worden meegebundeld — alleen de API-route
// (Node.js runtime) importeert dit bestand.
export function checkPassword(input: string): boolean {
  const expected = process.env.APP_PASSWORD ?? "";
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
