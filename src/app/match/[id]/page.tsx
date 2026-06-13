import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { MatchEditor } from "./match-editor";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
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

  const user = session?.user?.email
    ? await db.user.findUnique({ where: { email: session.user.email } })
    : null;
  const canEdit = user?.role === "ADMIN";

  const teamA = match.teamAName || "Takım A";
  const teamB = match.teamBName || "Takım B";

  const teamAWins = match.sets.filter((s) => s.teamAScore > s.teamBScore).length;
  const teamBWins = match.sets.filter((s) => s.teamBScore > s.teamAScore).length;

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/history"
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
              <p className="text-sm font-bold text-foreground">{teamA}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {match.players.filter(p => p.team === "A").map(p => p.user.name).join(", ")}
              </p>
            </div>
            <div className="text-3xl font-heading font-bold">
              <span className={match.winner === "A" ? "text-primary" : "text-muted-foreground opacity-50"}>
                {teamAWins}
              </span>
              <span className="text-muted-foreground opacity-30 mx-2">-</span>
              <span className={match.winner === "B" ? "text-team-b" : "text-muted-foreground opacity-50"}>
                {teamBWins}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-foreground">{teamB}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {match.players.filter(p => p.team === "B").map(p => p.user.name).join(", ")}
              </p>
            </div>
          </div>

          {match.winner && (
            <p className="text-sm text-primary font-mono font-bold mt-4 uppercase tracking-widest">
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
                className={`flex items-center justify-between px-4 py-3 rounded-lg ${
                  set.teamAScore > set.teamBScore
                    ? "bg-primary/5 border border-primary/10"
                    : "bg-team-b/5 border border-team-b/10"
                }`}
              >
                <span className="text-xs text-muted-foreground">
                  Set {set.setNumber}
                </span>
                <span className="text-lg font-heading font-bold text-foreground">
                  {set.teamAScore} - {set.teamBScore}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {set.teamAScore > set.teamBScore ? teamA : teamB}
                </span>
              </div>
            ))}
          </div>
        </div>

        {match.lastEditedAt && (
          <p className="text-[10px] text-muted-foreground text-center">
            Son düzenleme: {new Date(match.lastEditedAt).toLocaleString("tr-TR")} — {match.lastEditedBy || "bilinmiyor"}
          </p>
        )}

        {canEdit && (
          <div className="mt-auto">
            <MatchEditor
              matchId={match.id}
              teamAName={teamA}
              teamBName={teamB}
              sets={JSON.parse(JSON.stringify(match.sets))}
              winner={match.winner}
            />
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
