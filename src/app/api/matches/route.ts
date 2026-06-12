import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const body = await request.json();
  const { seasonId, teamType, teamAName, teamBName, playersA, playersB } = body;

  if (!seasonId || !teamType || !playersA?.length || !playersB?.length) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const match = await db.match.create({
    data: {
      seasonId,
      teamType,
      teamAName: teamAName || "Takım A",
      teamBName: teamBName || "Takım B",
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
