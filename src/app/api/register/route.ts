import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import zxcvbn from "zxcvbn";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Tüm alanlar zorunludur." },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalı." },
        { status: 400 },
      );
    }

    const strength = zxcvbn(password);
    if (strength.score < 3) {
      return NextResponse.json(
        { error: `Şifre çok zayıf. ${strength.feedback.warning || "Daha karmaşık bir şifre seçin."}` },
        { status: 400 },
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı." },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
      },
    });

    return NextResponse.json(
      { user: { id: user.id, name: user.name, email: user.email } },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 },
    );
  }
}
