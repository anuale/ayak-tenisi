import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });
  if (user?.role !== "ADMIN") return null;
  return user;
}

export async function POST(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Sezon adı gerekli" }, { status: 400 });
  }

  const season = await db.season.create({
    data: { name, startDate: new Date(), isActive: false, createdBy: admin.id },
  });

  return NextResponse.json({ season, message: "Sezon oluşturuldu." });
}

export async function PATCH(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { id, name, isActive } = await request.json();
  if (!id) return NextResponse.json({ error: "Sezon ID gerekli" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name;
  if (isActive !== undefined) {
    data.isActive = isActive;
    if (isActive) {
      await db.season.updateMany({
        where: { id: { not: id }, isActive: true },
        data: { isActive: false },
      });
    }
  }

  const season = await db.season.update({ where: { id }, data });

  return NextResponse.json({ season, message: "Sezon güncellendi." });
}

export async function DELETE(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Sezon ID gerekli" }, { status: 400 });

  await db.match.deleteMany({ where: { seasonId: id } });
  await db.season.delete({ where: { id } });

  return NextResponse.json({ message: "Sezon silindi." });
}
