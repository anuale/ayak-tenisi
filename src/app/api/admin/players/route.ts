import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

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

  const { name, email, password } = await request.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json(
      { error: "İsim ve e-posta gerekli" },
      { status: 400 },
    );
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta zaten kayıtlı" },
      { status: 400 },
    );
  }

    const autoPassword = crypto.randomUUID().slice(0, 12) + "!A1";
    const hashedPassword = await bcrypt.hash(password || autoPassword, 12);

    const user = await db.user.create({
      data: { name, email, password: hashedPassword, role: "USER", emailVerified: new Date() },
    });

  return NextResponse.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    message: "Oyuncu eklendi.",
  });
}

const SUPER_ADMIN_EMAIL = "anuale@gmail.com";

export async function PATCH(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  if (admin.email !== SUPER_ADMIN_EMAIL) {
    return NextResponse.json({ error: "Sadece ana admin rol değiştirebilir" }, { status: 403 });
  }

  const { userId, role, approve } = await request.json();
  if (!userId) return NextResponse.json({ error: "Kullanıcı ID gerekli" }, { status: 400 });

  if (approve) {
    await db.user.update({
      where: { id: userId },
      data: { emailVerified: new Date(), verifyToken: null },
    });
    return NextResponse.json({ message: "Kullanıcı onaylandı." });
  }

  await db.user.update({ where: { id: userId }, data: { role } });

  return NextResponse.json({ message: "Rol güncellendi." });
}

export async function PUT(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { userId } = await request.json();
  if (!userId) return NextResponse.json({ error: "Kullanıcı ID gerekli" }, { status: 400 });

  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: { userId, token, expires },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL}/reset-password/${token}`;

  return NextResponse.json({ resetUrl, message: "Şifre sıfırlama linki oluşturuldu." });
}

export async function DELETE(request: Request) {
  const admin = await checkAdmin();
  if (!admin) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Kullanıcı ID gerekli" }, { status: 400 });

  await db.user.delete({ where: { id: userId } });

  return NextResponse.json({ message: "Oyuncu silindi." });
}
