import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await db.tournament.findUnique({
    where: { id },
    include: {
      matches: {
        include: {
          sets: { orderBy: { setNumber: "asc" } },
          players: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!tournament) notFound();

  const teamANames = new Set<string>();
  const teamBNames = new Set<string>();
  const standings = new Map<string, { wins: number; losses: number; setsFor: number; setsAgainst: number }>();

  for (const m of tournament.matches) {
    const a = m.teamAName || "A";
    const b = m.teamBName || "B";
    teamANames.add(a);
    teamBNames.add(b);

    if (!standings.has(a)) standings.set(a, { wins: 0, losses: 0, setsFor: 0, setsAgainst: 0 });
    if (!standings.has(b)) standings.set(b, { wins: 0, losses: 0, setsFor: 0, setsAgainst: 0 });

    if (m.status === "FINISHED" && m.winner) {
      const sa = standings.get(a)!;
      const sb = standings.get(b)!;
      const aWins = m.sets.filter(s => s.teamAScore > s.teamBScore).length;
      const bWins = m.sets.filter(s => s.teamBScore > s.teamAScore).length;
      sa.setsFor += aWins;
      sa.setsAgainst += bWins;
      sb.setsFor += bWins;
      sb.setsAgainst += aWins;
      if (m.winner === "A") { sa.wins++; sb.losses++; }
      else { sb.wins++; sa.losses++; }
    }
  }

  const sortedStandings = Array.from(standings.entries())
    .sort((a, b) => b[1].wins - a[1].wins || (b[1].setsFor - b[1].setsAgainst) - (a[1].setsFor - a[1].setsAgainst));

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <header className="flex items-center gap-3 px-4 py-4 border-b border-border/50">
        <Link href="/tournament" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">{tournament.name}</h1>
          <p className="text-[10px] text-muted-foreground">{tournament.teamType === "TWO_VS_TWO" ? "1v1" : "3v3"} · {tournament.matches.length} maç</p>
        </div>
      </header>

      <main className="flex-1 px-4 pt-4 flex flex-col gap-4">
        {/* Standings */}
        {sortedStandings.length > 0 && (
          <div className="glass-surface border border-border/50 rounded-xl p-4">
            <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">Puan Durumu</p>
            <div className="space-y-2">
              {sortedStandings.map(([name, s], i) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                    <span className="text-sm text-foreground">{name}</span>
                  </div>
                  <span className="text-sm font-bold text-primary">{s.wins}G / {s.losses}M</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Matches */}
        <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">Maçlar</p>
        <div className="flex flex-col gap-2">
          {tournament.matches.map((m) => {
            const aWins = m.sets.filter(s => s.teamAScore > s.teamBScore).length;
            const bWins = m.sets.filter(s => s.teamBScore > s.teamAScore).length;
            const isFinished = m.status === "FINISHED";

            return (
              <Link
                key={m.id}
                href={isFinished ? `/match/${m.id}` : `/match/${m.id}/scoring`}
                className={`glass-surface border rounded-xl p-3 flex items-center justify-between active:scale-95 transition-transform ${
                  isFinished ? "border-border/50" : "border-primary/30 bg-primary/5"
                }`}
              >
                <span className="text-xs text-foreground flex-1 truncate">
                  {m.teamAName || "A"}
                </span>
                <div className="px-3 text-center">
                  {isFinished ? (
                    <span className={`font-heading font-bold ${m.winner === "A" ? "text-primary" : "text-team-b"}`}>
                      {aWins}-{bWins}
                    </span>
                  ) : (
                    <span className="text-[10px] text-primary font-bold">OYNANMADI</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground flex-1 text-right truncate">
                  {m.teamBName || "B"}
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
