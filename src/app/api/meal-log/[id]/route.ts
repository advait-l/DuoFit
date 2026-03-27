import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const meal = await prisma.mealLog.findUnique({ where: { id } });
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meal.userId !== session.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { category, notes, imageUrl } = await req.json();
  const updated = await prisma.mealLog.update({
    where: { id },
    data: {
      ...(category !== undefined && { category }),
      ...(notes !== undefined && { notes: notes?.trim() || null }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const meal = await prisma.mealLog.findUnique({ where: { id } });
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meal.userId !== session.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.mealLog.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
