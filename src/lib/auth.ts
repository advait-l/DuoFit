import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  exp?: number;
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function signJwt(payload: Omit<JwtPayload, "exp">): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function getSession(req: NextRequest): Promise<JwtPayload | null> {
  const token = req.cookies.get("duofit_token")?.value;
  if (!token) return null;
  return verifyJwt(token);
}

export function setAuthCookie(res: NextResponse, token: string): void {
  res.cookies.set("duofit_token", token, {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearAuthCookie(res: NextResponse): void {
  res.cookies.set("duofit_token", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
}
