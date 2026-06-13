import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { currentPassword, newPassword } = await request.json();

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: "Mevcut ve yeni şifre gerekli" }, { status: 400 });
  }

  if (newPassword.length < 6) {
    return NextResponse.json({ error: "Yeni şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user || !user.password) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Mevcut şifre yanlış." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { password: hashedPassword } });

  return NextResponse.json({ message: "Şifreniz başarıyla değiştirildi." });
}
