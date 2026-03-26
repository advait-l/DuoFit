import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signJwt, setAuthCookie } from "@/lib/auth";
import { generateInviteCode } from "@/lib/invite";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const inviteCode = generateInviteCode();

    const user = await prisma.user.create({
      data: { name, email, passwordHash, inviteCode },
    });

    const token = await signJwt({ sub: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      inviteCode: user.inviteCode,
      partnerId: user.partnerId,
    });
    setAuthCookie(res, token);
    return res;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
