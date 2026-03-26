import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Card from "@/components/ui/Card";

async function getPoints(userId: string): Promise<number> {
  const completed = await prisma.checklistItem.count({
    where: { userId, done: true },
  });
  return completed * 10;
}

export default async function Rewards() {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (!token) redirect("/login");
  const session = await verifyJwt(token);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, partnerId: true },
  });
  if (!user) redirect("/login");

  const myPoints = await getPoints(user.id);
  let partnerPoints = 0;
  let partnerName: string | null = null;

  if (user.partnerId) {
    const partner = await prisma.user.findUnique({
      where: { id: user.partnerId },
      select: { name: true },
    });
    partnerName = partner?.name ?? null;
    partnerPoints = await getPoints(user.partnerId);
  }

  const totalPoints = myPoints + partnerPoints;

  return (
    <div className="max-w-lg mx-auto px-4 pt-8 pb-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Rewards</h1>

      {/* Points breakdown */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="text-center">
          <div className="text-3xl font-bold text-indigo-600">{myPoints}</div>
          <div className="text-xs text-gray-500 mt-1">Your points</div>
        </Card>
        {partnerName && (
          <Card className="text-center">
            <div className="text-3xl font-bold text-amber-500">{partnerPoints}</div>
            <div className="text-xs text-gray-500 mt-1">{partnerName}&apos;s points</div>
          </Card>
        )}
      </div>

      {/* Couple points */}
      <Card className="text-center mb-4">
        <p className="text-xs text-gray-400 mb-1">Couple total</p>
        <div className="text-4xl font-bold text-gray-900">{totalPoints}</div>
        <p className="text-xs text-gray-400 mt-1">10 pts per completed task</p>
      </Card>

      {/* Grand Prize vault */}
      <Card>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="font-semibold text-gray-800">Grand Prize Vault</p>
            <p className="text-xs text-gray-400">Coming in Phase 2</p>
          </div>
        </div>
        <div className="space-y-2">
          {[
            { label: "Weekend getaway", pts: 1000 },
            { label: "Nice dinner out", pts: 500 },
            { label: "Movie night", pts: 200 },
          ].map(({ label, pts }) => (
            <div key={label} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
              <span className="text-sm text-gray-700">{label}</span>
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-gray-500">{pts} pts</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    totalPoints >= pts
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {totalPoints >= pts ? "Unlocked" : "Locked"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
