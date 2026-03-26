import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { getWeekStart, getDayStart, getDayEnd, getTodayAbbrev, isItemForToday } from "@/lib/dates";
import { redirect } from "next/navigation";

async function getStreak(userId: string): Promise<number> {
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const start = getDayStart(d);
    const end = getDayEnd(d);
    const count = await prisma.checklistItem.count({
      where: { userId, done: true, completedAt: { gte: start, lte: end } },
    });
    if (count > 0) streak++;
    else if (i > 0) break;
    // if i === 0 (today) and count === 0, the day isn't over — don't break
  }
  return streak;
}

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (!token) redirect("/login");
  const session = await verifyJwt(token);
  if (!session) redirect("/login");

  const today = new Date();
  const weekStart = getWeekStart(today);
  const dayStart = getDayStart(today);
  const dayEnd = getDayEnd(today);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, partnerId: true },
  });
  if (!user) redirect("/login");

  const todayAbbrev = getTodayAbbrev(today);

  const [allMyChecklist, myMeals, myStreak, mySchedule] = await Promise.all([
    prisma.checklistItem.findMany({ where: { userId: user.id, weekStart } }),
    prisma.mealLog.findMany({ where: { userId: user.id, logDate: { gte: dayStart, lte: dayEnd } } }),
    getStreak(user.id),
    prisma.fitnessSchedule.findUnique({ where: { userId: user.id } }),
  ]);

  const myChecklist = allMyChecklist.filter((i) => isItemForToday(i.label, todayAbbrev));

  let partnerData = null;
  if (user.partnerId) {
    const partner = await prisma.user.findUnique({
      where: { id: user.partnerId },
      select: { id: true, name: true },
    });
    const [allPartnerChecklist, partnerMeals, partnerStreak] = await Promise.all([
      prisma.checklistItem.findMany({ where: { userId: user.partnerId, weekStart } }),
      prisma.mealLog.findMany({ where: { userId: user.partnerId, logDate: { gte: dayStart, lte: dayEnd } } }),
      getStreak(user.partnerId),
    ]);
    partnerData = {
      name: partner?.name ?? "Partner",
      checklist: allPartnerChecklist.filter((i) => isItemForToday(i.label, todayAbbrev)),
      meals: partnerMeals,
      streak: partnerStreak,
    };
  }

  return (
    <DashboardPage
      me={{
        name: user.name,
        checklist: myChecklist,
        meals: myMeals,
        streak: myStreak,
      }}
      partner={partnerData}
      hasSchedule={!!mySchedule}
      today={today.toISOString().split("T")[0]}
    />
  );
}
