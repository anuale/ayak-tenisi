import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ScoreEntry } from "./score-entry";

export const dynamic = "force-dynamic";

export default async function ScoringPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const match = await db.match.findUnique({
    where: { id },
    include: {
      players: { include: { user: { select: { id: true, name: true } } } },
      sets: { orderBy: { setNumber: "asc" } },
    },
  });

  if (!match || match.status !== "LIVE") notFound();

  const teamA = match.teamAName || match.players.filter(p => p.team === "A").map(p => p.user.name).join(", ");
  const teamB = match.teamBName || match.players.filter(p => p.team === "B").map(p => p.user.name).join(", ");

  return <ScoreEntry match={match} teamAName={teamA} teamBName={teamB} />;
}
