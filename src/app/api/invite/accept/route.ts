import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Invite code required" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      const inviter = await tx.user.findUnique({
        where: { inviteCode: code.toUpperCase() },
        select: { id: true, partnerId: true },
      });
      if (!inviter) throw new Error("Invalid invite code");
      if (inviter.id === session.sub) throw new Error("Cannot pair with yourself");
      if (inviter.partnerId) throw new Error("This user is already paired");

      const me = await tx.user.findUnique({
        where: { id: session.sub },
        select: { partnerId: true },
      });
      if (me?.partnerId) throw new Error("You are already paired with a partner");

      await tx.user.update({ where: { id: session.sub }, data: { partnerId: inviter.id } });
      await tx.user.update({ where: { id: inviter.id }, data: { partnerId: session.sub } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to accept invite";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
