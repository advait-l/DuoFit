import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseDays, serializeDays } from "@/lib/schedule";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const schedule = await prisma.fitnessSchedule.findUnique({
    where: { userId: session.sub },
  });

  if (!schedule) return NextResponse.json(null);

  return NextResponse.json({
    workoutDays: parseDays(schedule.workoutDays),
    runDays: parseDays(schedule.runDays),
    dailySteps: schedule.dailySteps,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { workoutDays, runDays, dailySteps } = await req.json();

  const schedule = await prisma.fitnessSchedule.upsert({
    where: { userId: session.sub },
    create: {
      userId: session.sub,
      workoutDays: serializeDays(workoutDays ?? []),
      runDays: serializeDays(runDays ?? []),
      dailySteps: dailySteps ? Number(dailySteps) : null,
    },
    update: {
      workoutDays: serializeDays(workoutDays ?? []),
      runDays: serializeDays(runDays ?? []),
      dailySteps: dailySteps ? Number(dailySteps) : null,
    },
  });

  return NextResponse.json({
    workoutDays: parseDays(schedule.workoutDays),
    runDays: parseDays(schedule.runDays),
    dailySteps: schedule.dailySteps,
  });
}
