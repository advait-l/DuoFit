import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyJwt } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import BottomNav from "@/components/layout/BottomNav";
import { UserProvider } from "@/components/providers/UserContext";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (!token) redirect("/login");

  const session = await verifyJwt(token);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, name: true, email: true, inviteCode: true, partnerId: true },
  });
  if (!user) redirect("/login");

  let partner = null;
  if (user.partnerId) {
    partner = await prisma.user.findUnique({
      where: { id: user.partnerId },
      select: { id: true, name: true },
    });
  }

  return (
    <UserProvider value={{ me: user, partner }}>
      <div className="min-h-dvh pb-20">
        {children}
      </div>
      <BottomNav />
    </UserProvider>
  );
}
