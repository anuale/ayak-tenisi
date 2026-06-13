import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  const { token, password } = await request.json();

  if (!token || !password) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Şifre en az 6 karakter olmalı." }, { status: 400 });
  }

  const resetToken = await db.passwordResetToken.findUnique({ where: { token } });

  if (!resetToken || resetToken.used || resetToken.expires < new Date()) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş link." }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await db.$transaction([
    db.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    }),
    db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ message: "Şifreniz başarıyla değiştirildi." });
}
