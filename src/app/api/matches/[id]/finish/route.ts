import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { setScores, winner, playerPoints } = body;

  const match = await db.match.findUnique({ where: { id } });
  if (!match || match.status !== "LIVE") {
    return NextResponse.json({ error: "Maç bulunamadı" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    await tx.set.deleteMany({ where: { matchId: id } });

    for (const setScore of setScores) {
      await tx.set.create({
        data: {
          matchId: id,
          setNumber: setScore.setNumber || setScore.setNumber,
          teamAScore: setScore.teamA,
          teamBScore: setScore.teamB,
        },
      });
    }

    if (playerPoints && Array.isArray(playerPoints)) {
      await tx.pointStat.deleteMany({ where: { matchId: id } });
      for (const pp of playerPoints) {
        if (pp.pointsWon > 0) {
          await tx.pointStat.create({
            data: {
              matchId: id,
              userId: pp.userId,
              setNumber: pp.setNumber,
              pointsWon: pp.pointsWon,
              pointsLost: pp.pointsLost || 0,
              team: pp.team,
            },
          });
        }
      }
    }

    await tx.match.update({
      where: { id },
      data: {
        status: "FINISHED",
        winner,
        finishedAt: new Date(),
      },
    });
  });

  return NextResponse.json({ success: true });
}
