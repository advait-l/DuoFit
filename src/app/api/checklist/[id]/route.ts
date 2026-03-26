import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.checklistItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.userId !== session.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { done, label } = await req.json();
  const updated = await prisma.checklistItem.update({
    where: { id },
    data: {
      ...(done !== undefined && { done }),
      ...(label !== undefined && { label: label.trim() }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await prisma.checklistItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.userId !== session.sub) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.checklistItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
