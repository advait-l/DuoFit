import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/dates";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const weekParam = searchParams.get("weekStart");
  const weekStart = weekParam ? new Date(weekParam) : getWeekStart();

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { partnerId: true },
  });

  const [mine, partnerItems] = await Promise.all([
    prisma.checklistItem.findMany({
      where: { userId: session.sub, weekStart },
      orderBy: { createdAt: "asc" },
    }),
    user?.partnerId
      ? prisma.checklistItem.findMany({
          where: { userId: user.partnerId, weekStart },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({ mine, partner: partnerItems });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { label, weekStart: weekParam } = await req.json();
  if (!label?.trim()) return NextResponse.json({ error: "Label is required" }, { status: 400 });

  const weekStart = weekParam ? new Date(weekParam) : getWeekStart();

  const item = await prisma.checklistItem.create({
    data: { userId: session.sub, label: label.trim(), weekStart },
  });

  return NextResponse.json(item, { status: 201 });
}
