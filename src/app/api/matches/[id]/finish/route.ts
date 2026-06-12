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
  const { setScores, winner } = body;

  const match = await db.match.findUnique({ where: { id } });
  if (!match || match.status !== "LIVE") {
    return NextResponse.json({ error: "Maç bulunamadı" }, { status: 404 });
  }

  await db.$transaction(async (tx) => {
    const existingSets = await tx.set.findMany({ where: { matchId: id } });
    const existingSetNumbers = new Set(existingSets.map((s) => s.setNumber));

    for (const setScore of setScores) {
      if (existingSetNumbers.has(setScore.setNumber)) {
        await tx.set.updateMany({
          where: { matchId: id, setNumber: setScore.setNumber },
          data: {
            teamAScore: setScore.teamA,
            teamBScore: setScore.teamB,
          },
        });
      } else {
        await tx.set.create({
          data: {
            matchId: id,
            setNumber: setScore.setNumber,
            teamAScore: setScore.teamA,
            teamBScore: setScore.teamB,
          },
        });
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
