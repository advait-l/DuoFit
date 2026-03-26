import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLabelsForWeek, parseDays } from "@/lib/schedule";
import { getWeekStart } from "@/lib/dates";

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { weekStart: weekParam } = await req.json();
  const weekStart = weekParam ? new Date(weekParam) : getWeekStart();

  const schedule = await prisma.fitnessSchedule.findUnique({
    where: { userId: session.sub },
  });
  if (!schedule) return NextResponse.json({ error: "No schedule set" }, { status: 400 });

  const labels = generateLabelsForWeek({
    workoutDays: parseDays(schedule.workoutDays),
    runDays: parseDays(schedule.runDays),
    dailySteps: schedule.dailySteps,
  });

  if (labels.length > 0) {
    await prisma.checklistItem.createMany({
      data: labels.map((label) => ({ userId: session.sub, label, weekStart })),
    });
  }

  const items = await prisma.checklistItem.findMany({
    where: { userId: session.sub, weekStart },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ items });
}
