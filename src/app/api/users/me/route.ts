import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, inviteCode: true, partnerId: true },
  });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let partner = null;
  if (user.partnerId) {
    partner = await prisma.user.findUnique({
      where: { id: user.partnerId },
      select: { id: true, name: true },
    });
  }

  return NextResponse.json({ me: user, partner });
}
