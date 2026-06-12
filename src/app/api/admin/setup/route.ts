import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  return POST();
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const user = await db.user.update({
    where: { email: session.user.email },
    data: { role: "ADMIN" },
  });

  const existingSeason = await db.season.findFirst({
    where: { isActive: true },
  });

  if (!existingSeason) {
    await db.season.create({
      data: {
        name: "Yaz Sezonu '26",
        startDate: new Date(),
        isActive: true,
        createdBy: user.id,
      },
    });
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role },
    message: "Admin yetkisi verildi ve sezon oluşturuldu.",
  });
}
