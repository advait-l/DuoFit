import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getDayStart, getDayEnd } from "@/lib/dates";
import MealLogPage from "@/components/meal-log/MealLogPage";
import { redirect } from "next/navigation";

export default async function MealLog() {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (!token) redirect("/login");
  const session = await verifyJwt(token);
  if (!session) redirect("/login");

  const today = new Date();
  const dayStart = getDayStart(today);
  const dayEnd = getDayEnd(today);

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, partnerId: true },
  });
  if (!user) redirect("/login");

  const dateFilter = { gte: dayStart, lte: dayEnd };

  const [mine, partnerMeals] = await Promise.all([
    prisma.mealLog.findMany({
      where: { userId: user.id, logDate: dateFilter },
      orderBy: { createdAt: "asc" },
    }),
    user.partnerId
      ? prisma.mealLog.findMany({
          where: { userId: user.partnerId, logDate: dateFilter },
          orderBy: { createdAt: "asc" },
        })
      : Promise.resolve([]),
  ]);

  let partnerName: string | null = null;
  if (user.partnerId) {
    const p = await prisma.user.findUnique({ where: { id: user.partnerId }, select: { name: true } });
    partnerName = p?.name ?? null;
  }

  return (
    <MealLogPage
      initialMine={mine}
      initialPartner={partnerMeals}
      partnerName={partnerName}
      today={today.toISOString().split("T")[0]}
    />
  );
}
