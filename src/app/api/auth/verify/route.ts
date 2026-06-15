import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Geçersiz bağlantı." }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { verifyToken: token } });

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=gecersiz-link", request.url));
  }

  await db.user.update({
    where: { id: user.id },
    data: { emailVerified: new Date(), verifyToken: null },
  });

  return NextResponse.redirect(new URL("/login?verified=true", request.url));
}
