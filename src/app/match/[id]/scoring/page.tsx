import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { LiveScoring } from "./live-scoring";

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
      points: true,
    },
  });

  if (!match || match.status !== "LIVE") notFound();

  return <LiveScoring match={match} />;
}
