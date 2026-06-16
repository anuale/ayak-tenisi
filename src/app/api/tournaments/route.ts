import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { name, seasonId, teamType, teamA, teamB } = await request.json();

  if (!name || !seasonId || !teamType || !teamA?.length || !teamB?.length) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  const tournament = await db.tournament.create({
    data: {
      name,
      seasonId,
      teamType,
      createdBy: session.user.id,
    },
  });

  for (let i = 0; i < teamA.length; i++) {
    for (let j = 0; j < teamB.length; j++) {
      const a = teamA[i];
      const b = teamB[j];
      if (!a || !b) continue;

      await db.match.create({
        data: {
          seasonId,
          teamType,
          teamAName: a.name,
          teamBName: b.name,
          tournamentId: tournament.id,
          createdBy: session.user.id,
          status: "LIVE",
          players: {
            create: [
              { userId: a.id, team: "A" as const },
              { userId: b.id, team: "B" as const },
            ],
          },
          sets: {
            create: { setNumber: 1, teamAScore: 0, teamBScore: 0 },
          },
        },
      });
    }
  }

  return NextResponse.json(tournament, { status: 201 });
}
