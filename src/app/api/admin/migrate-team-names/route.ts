import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "ADMIN") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });

  const matches = await db.match.findMany({
    include: {
      players: { include: { user: { select: { name: true } } } },
    },
  });

  let updated = 0;
  for (const m of matches) {
    const teamA = m.teamAName;
    const teamB = m.teamBName;
    const isDefaultA = !teamA || teamA === "Takım A";
    const isDefaultB = !teamB || teamB === "Takım B";

    if (!isDefaultA && !isDefaultB) continue;

    const playersA = m.players.filter(p => p.team === "A").map(p => p.user.name).join(", ");
    const playersB = m.players.filter(p => p.team === "B").map(p => p.user.name).join(", ");

    const data: Record<string, string> = {};
    if (isDefaultA && playersA) data.teamAName = playersA;
    if (isDefaultB && playersB) data.teamBName = playersB;

    if (Object.keys(data).length > 0) {
      await db.match.update({ where: { id: m.id }, data });
      updated++;
    }
  }

  return NextResponse.json({ message: `${updated} maçın takım ismi güncellendi.` });
}
