import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDayStart, getDayEnd } from "@/lib/dates";

const VALID_TYPES = ["breakfast", "lunch", "dinner", "snack"];
const VALID_CATEGORIES = ["homecooked", "restaurant", "takeout", "fast-food", "skipped", ""];

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date");
  const baseDate = dateParam ? new Date(dateParam + "T00:00:00.000Z") : new Date();
  const start = getDayStart(baseDate);
  const end = getDayEnd(baseDate);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { partnerId: true },
  });

  const dateFilter = { gte: start, lte: end };

  const [mine, partnerMeals] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId: session.sub, logDate: dateFilter },
      orderBy: { createdAt: "asc" },
    }),
    user?.partnerId
      ? prisma.mealLog.findMany({
          where: { userId: user.partnerId, logDate: dateFilter },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  return NextResponse.json({ mine, partner: partnerMeals });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { mealType, category = "", notes, logDate: logDateParam } = await req.json();

  if (!mealType || !VALID_TYPES.includes(mealType)) {
    return NextResponse.json({ error: "Invalid meal type" }, { status: 400 });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const logDate = logDateParam
    ? new Date(logDateParam + "T00:00:00.000Z")
    : getDayStart(new Date());

  const meal = await prisma.mealLog.create({
    data: {
      userId: session.sub,
      mealType,
      category,
      notes: notes?.trim() || null,
      logDate,
    },
  });

  return NextResponse.json(meal, { status: 201 });
}
