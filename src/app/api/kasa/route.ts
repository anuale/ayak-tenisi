import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { type, amount, description, paidBy } = await request.json();
  if (!type || !amount || !description) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const transaction = await db.transaction.create({
    data: { type, amount, description, paidBy: paidBy || null, createdBy: session.user.id },
  });

  return NextResponse.json(transaction, { status: 201 });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID gerekli" }, { status: 400 });

  await db.transaction.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
