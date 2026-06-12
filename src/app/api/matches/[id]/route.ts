import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  });

  const { id } = await params;
  const match = await db.match.findUnique({ where: { id } });

  if (!match) {
    return NextResponse.json({ error: "Maç bulunamadı" }, { status: 404 });
  }

  if (match.createdBy !== user?.id && user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const body = await request.json();
  const { teamAName, teamBName, setScores, winner } = body;

  await db.$transaction(async (tx) => {
    const data: Record<string, unknown> = {};
    if (teamAName !== undefined) data.teamAName = teamAName;
    if (teamBName !== undefined) data.teamBName = teamBName;
    if (winner !== undefined) data.winner = winner;

    if (Object.keys(data).length > 0) {
      await tx.match.update({ where: { id }, data });
    }

    if (setScores) {
      await tx.set.deleteMany({ where: { matchId: id } });
      for (const setScore of setScores) {
        await tx.set.create({
          data: {
            matchId: id,
            setNumber: setScore.setNumber || setScore.setNumber,
            teamAScore: setScore.teamA ?? setScore.teamAScore,
            teamBScore: setScore.teamB ?? setScore.teamBScore,
          },
        });
      }
    }
  });

  return NextResponse.json({ success: true, message: "Maç güncellendi." });
}
