import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyJwt } from "@/lib/auth";

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get("duofit_token")?.value;
  if (token) {
    const session = await verifyJwt(token);
    if (session) redirect("/dashboard");
  }
  redirect("/login");
}
