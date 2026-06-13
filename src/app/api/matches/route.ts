import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const all = searchParams.get("all");

  const matches = await db.match.findMany({
    where: all ? undefined : { status: "FINISHED" },
    include: {
      players: { include: { user: { select: { name: true } } } },
      sets: { orderBy: { setNumber: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: all ? 100 : 20,
  });

  return NextResponse.json({ matches });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const { seasonId, teamType, teamAName, teamBName, playedAt, playersA, playersB } = body;

  if (!seasonId || !teamType || !playersA?.length || !playersB?.length) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const match = await db.match.create({
    data: {
      seasonId,
      teamType,
      teamAName: teamAName || "Takım A",
      teamBName: teamBName || "Takım B",
      playedAt: playedAt ? new Date(playedAt) : undefined,
      createdBy: session.user.id,
      status: "LIVE",
      players: {
        create: [
          ...playersA.map((userId: string) => ({
            userId,
            team: "A" as const,
          })),
          ...playersB.map((userId: string) => ({
            userId,
            team: "B" as const,
          })),
        ],
      },
      sets: {
        create: {
          setNumber: 1,
          teamAScore: 0,
          teamBScore: 0,
        },
      },
    },
  });

  return NextResponse.json(match, { status: 201 });
}
