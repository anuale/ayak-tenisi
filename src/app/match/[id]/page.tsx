import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
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
      season: { select: { name: true } },
    },
  });

  if (!match) notFound();

  const teamA = match.players
    .filter((p) => p.team === "A")
    .map((p) => p.user.name)
    .join(", ");
  const teamB = match.players
    .filter((p) => p.team === "B")
    .map((p) => p.user.name)
    .join(", ");

  return (
    <div className="flex flex-col min-h-screen max-w-lg md:max-w-4xl mx-auto pb-24">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-foreground">
          MAÇ DETAYI
        </h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-6 flex flex-col gap-6">
        <div className="text-center">
          <span className="text-xs text-muted-foreground">{match.season.name}</span>
          <p className="text-sm text-muted-foreground">
            {match.finishedAt
              ? new Date(match.finishedAt).toLocaleDateString("tr-TR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Devam ediyor"}
          </p>
        </div>

        <div className="glass-surface border border-border/50 rounded-xl p-6 text-center">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{teamA}</p>
            </div>
            <div className="text-2xl font-bold">
              <span className={match.winner === "A" ? "text-primary" : "text-muted-foreground"}>
                {match.sets.filter((s) => s.teamAScore > s.teamBScore).length}
              </span>
              <span className="text-muted-foreground opacity-30 mx-2">-</span>
              <span className={match.winner === "B" ? "text-team-b" : "text-muted-foreground"}>
                {match.sets.filter((s) => s.teamBScore > s.teamAScore).length}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{teamB}</p>
            </div>
          </div>

          {match.winner && (
            <p className="text-xs text-primary font-mono font-bold mt-3 uppercase tracking-widest">
              {match.winner === "A" ? teamA : teamB} KAZANDI
            </p>
          )}
        </div>

        <div className="glass-surface border border-border/50 rounded-xl p-4">
          <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Set Skorları
          </h3>
          <div className="space-y-2">
            {match.sets.map((set) => (
              <div
                key={set.setNumber}
                className="flex items-center justify-between px-4 py-2 rounded-lg bg-surface/50"
              >
                <span className="text-xs text-muted-foreground">
                  Set {set.setNumber}
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {set.teamAScore} - {set.teamBScore}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-surface border border-border/50 rounded-xl p-4">
          <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-4">
            Takım Kadroları
          </h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-[10px] font-mono font-bold text-primary uppercase tracking-widest mb-2">
                TAKIM A
              </p>
              {match.players
                .filter((p) => p.team === "A")
                .map((p) => (
                  <p key={p.id} className="text-sm text-foreground">
                    {p.user.name}
                  </p>
                ))}
            </div>
            <div className="flex-1 text-right">
              <p className="text-[10px] font-mono font-bold text-team-b uppercase tracking-widest mb-2">
                TAKIM B
              </p>
              {match.players
                .filter((p) => p.team === "B")
                .map((p) => (
                  <p key={p.id} className="text-sm text-foreground">
                    {p.user.name}
                  </p>
                ))}
            </div>
          </div>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
