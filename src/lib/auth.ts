import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "quizvraag_session";

const authSecretValue = process.env.AUTH_SECRET;
if (process.env.NODE_ENV === "production") {
  if (!authSecretValue) throw new Error("AUTH_SECRET environment variable is not set");
  if (authSecretValue.length < 32) throw new Error("AUTH_SECRET must be at least 32 characters");
}
const SECRET = new TextEncoder().encode(authSecretValue ?? "quizvraag-dev-secret-not-for-production-use");

// --- JWT ---

async function signToken(): Promise<string> {
  return new SignJWT({ ok: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("90d")
    .sign(SECRET);
}

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

// --- Cookie helpers (server components / route handlers) ---

export async function setSessionCookie(): Promise<void> {
  const token = await signToken();
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}

// --- Middleware helper (werkt met NextRequest) ---

export async function isAuthenticatedRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifyToken(token);
}
