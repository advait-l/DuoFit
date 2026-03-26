import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const config = {
  matcher: ["/dashboard/:path*", "/checklist/:path*", "/meal-log/:path*", "/rewards/:path*"],
};

export async function proxy(request: NextRequest) {
  const session = await getSession(request);
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const headers = new Headers(request.headers);
  headers.set("x-user-id", session.sub);
  return NextResponse.next({ request: { headers } });
}
