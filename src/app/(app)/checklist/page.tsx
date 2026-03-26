import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeekStart } from "@/lib/dates";
import { generateLabelsForWeek, parseDays } from "@/lib/schedule";
import ChecklistPage from "@/components/checklist/ChecklistPage";
import { redirect } from "next/navigation";

export default async function Checklist() {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (!token) redirect("/login");
  const session = await verifyJwt(token);
  if (!session) redirect("/login");

  const weekStart = getWeekStart();

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, partnerId: true },
  });
  if (!user) redirect("/login");

  const [existingMine, partnerItems, schedule] = await Promise.all([
    prisma.checklistItem.findMany({
      where: { userId: user.id, weekStart },
      orderBy: { createdAt: "asc" },
    }),
    user.partnerId
      ? prisma.checklistItem.findMany({
          where: { userId: user.partnerId, weekStart },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
    prisma.fitnessSchedule.findUnique({ where: { userId: user.id } }),
  ]);

  // Auto-generate items from schedule if this week is empty
  let mine = existingMine;
  if (existingMine.length === 0 && schedule) {
    const labels = generateLabelsForWeek({
      workoutDays: parseDays(schedule.workoutDays),
      runDays: parseDays(schedule.runDays),
      dailySteps: schedule.dailySteps,
    });

    if (labels.length > 0) {
      await prisma.checklistItem.createMany({
        data: labels.map((label) => ({ userId: user.id, label, weekStart })),
      });
      mine = await prisma.checklistItem.findMany({
        where: { userId: user.id, weekStart },
        orderBy: { createdAt: "asc" },
      });
    }
  }

  let partnerName: string | null = null;
  if (user.partnerId) {
    const p = await prisma.user.findUnique({ where: { id: user.partnerId }, select: { name: true } });
    partnerName = p?.name ?? null;
  }

  return (
    <ChecklistPage
      initialMine={mine}
      initialPartner={partnerItems}
      partnerName={partnerName}
      weekStart={weekStart.toISOString()}
      hasSchedule={!!schedule}
    />
  );
}
