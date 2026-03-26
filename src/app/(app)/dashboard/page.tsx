import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DashboardPage from "@/components/dashboard/DashboardPage";
import { getWeekStart, getDayStart, getDayEnd, getTodayAbbrev, isItemForToday } from "@/lib/dates";
import { redirect } from "next/navigation";

async function getStreak(userId: string): Promise<number> {
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(today.getUTCDate() - 30);

  // Fetch done items: prefer logDate, fall back to completedAt for older items
  const doneItems = await prisma.checklistItem.findMany({
    where: {
      userId,
      done: true,
      OR: [
        { logDate: { gte: getDayStart(thirtyDaysAgo) } },
        { logDate: null, completedAt: { gte: getDayStart(thirtyDaysAgo) } },
      ],
    },
    select: { logDate: true, completedAt: true },
  });

  // Use logDate if set, otherwise fall back to completedAt
  const doneDays = new Set(
    doneItems
      .map((i) => (i.logDate ?? i.completedAt)?.toISOString().split("T")[0])
      .filter((d): d is string => !!d)
  );

  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().split("T")[0];
    if (doneDays.has(key)) {
      streak++;
    } else if (i > 0) {
      break; // only break on past days; today might not be done yet
    }
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

  const myChecklist = allMyChecklist.filter((i) => isItemForToday(i.label, todayAbbrev, i.logDate));

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
      checklist: allPartnerChecklist.filter((i) => isItemForToday(i.label, todayAbbrev, i.logDate)),
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
