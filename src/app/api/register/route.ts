import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import zxcvbn from "zxcvbn";
import crypto from "crypto";
import { Resend } from "resend";
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
    const verifyToken = crypto.randomUUID();

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "USER",
        verifyToken,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/api/auth/verify?token=${verifyToken}`;

    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Ayak Tenisi Skor <noreply@alnuai.com>",
          to: email,
          subject: "E-posta Adresinizi Doğrulayın",
          html: `<h2>Ayak Tenisi Skor'a Hoş Geldiniz!</h2><p>Hesabınızı aktifleştirmek için aşağıdaki bağlantıya tıklayın:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p><p>Bu bağlantı 24 saat geçerlidir.</p>`,
        });
      } catch {
        // Email sending failed, still allow registration
      }
    }

    return NextResponse.json(
      { message: "Hesabınız oluşturuldu. Lütfen e-posta adresinizi doğrulayın." },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Sunucu hatası." },
      { status: 500 },
    );
  }
}
