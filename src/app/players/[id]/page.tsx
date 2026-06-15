import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await db.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });

  if (!user) notFound();

  const matchPlayers = await db.matchPlayer.findMany({
    where: { userId: id },
    include: {
      match: {
        include: {
          sets: { orderBy: { setNumber: "asc" } },
          players: { include: { user: { select: { name: true } } } },
        },
      },
    },
    orderBy: { match: { finishedAt: "desc" } },
    take: 20,
  });

  let played = 0, won = 0, lost = 0, setsFor = 0, setsAgainst = 0;
  const recentForm: Array<"W" | "L"> = [];
  const recentMatches: Array<{
    id: string;
    date: Date | null;
    teamA: string;
    teamB: string;
    setsA: number;
    setsB: number;
    won: boolean;
  }> = [];

  for (const mp of matchPlayers) {
    const m = mp.match;
    if (m.status !== "FINISHED" || !m.winner) continue;

    played++;
    const teamSets = m.sets.filter(s =>
      mp.team === "A" ? s.teamAScore > s.teamBScore : s.teamBScore > s.teamAScore
    ).length;
    const oppSets = m.sets.filter(s =>
      mp.team === "A" ? s.teamBScore > s.teamAScore : s.teamAScore > s.teamBScore
    ).length;

    setsFor += teamSets;
    setsAgainst += oppSets;

    const isWin = m.winner === mp.team;
    if (isWin) won++;
    else lost++;

    if (recentForm.length < 5) recentForm.push(isWin ? "W" : "L");

    if (recentMatches.length < 10) {
      recentMatches.push({
        id: m.id,
        date: m.playedAt || m.finishedAt,
        teamA: m.teamAName || m.players.filter(p => p.team === "A").map(p => p.user.name).join(", "),
        teamB: m.teamBName || m.players.filter(p => p.team === "B").map(p => p.user.name).join(", "),
        setsA: m.sets.filter(s => s.teamAScore > s.teamBScore).length,
        setsB: m.sets.filter(s => s.teamBScore > s.teamAScore).length,
        won: isWin,
      });
    }
  }

  const winRate = played > 0 ? Math.round((won / played) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
        <Link
          href="/standings"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-foreground">
          Oyuncu Profili
        </h1>
      </header>

      <main className="flex-1 px-4 pt-6 flex flex-col gap-5">
        {/* Hero */}
        <div className="glass-surface border border-border/50 rounded-xl p-6 text-center">
          <div className="relative inline-flex items-center justify-center mb-3">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-high" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="#4edea3" strokeWidth="3"
                strokeDasharray={`${(winRate / 100) * 88} 88`}
                strokeLinecap="round" className="drop-shadow-[0_0_8px_rgba(78,222,163,0.5)]" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-heading text-lg font-bold text-primary">
              {winRate}%
            </span>
          </div>
          <p className="text-lg font-bold text-foreground">{user.name}</p>
          <p className="text-xs text-muted-foreground mt-1">Galibiyet Oranı</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass-surface border border-border/50 rounded-xl p-4 text-center">
            <span className="font-heading text-xl font-bold text-foreground">{played}</span>
            <p className="text-[10px] text-muted-foreground">Maç</p>
          </div>
          <div className="glass-surface border border-border/50 rounded-xl p-4 text-center">
            <span className="font-heading text-xl font-bold text-primary">{won}</span>
            <p className="text-[10px] text-muted-foreground">Galibiyet</p>
          </div>
          <div className="glass-surface border border-border/50 rounded-xl p-4 text-center">
            <span className="font-heading text-xl font-bold text-muted-foreground">{lost}</span>
            <p className="text-[10px] text-muted-foreground">Mağlubiyet</p>
          </div>
          <div className="glass-surface border border-border/50 rounded-xl p-4 text-center">
            <span className={`font-heading text-xl font-bold ${setsFor >= setsAgainst ? "text-primary" : "text-destructive"}`}>
              +{setsFor - setsAgainst}
            </span>
            <p className="text-[10px] text-muted-foreground">Set Averajı</p>
          </div>
        </div>

        {/* Form Guide */}
        {recentForm.length > 0 && (
          <div className="glass-surface border border-border/50 rounded-xl p-4">
            <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Son 5 Maç
            </p>
            <div className="flex gap-2">
              {recentForm.map((f, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    f === "W"
                      ? "bg-primary/20 text-primary"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {f}
                </span>
              ))}
              {Array.from({ length: 5 - recentForm.length }).map((_, i) => (
                <span
                  key={`empty-${i}`}
                  className="w-8 h-8 rounded-full bg-surface-high border border-border/30"
                />
              ))}
            </div>
          </div>
        )}

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <div>
            <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Son Maçlar
            </p>
            <div className="flex flex-col gap-2">
              {recentMatches.map((m) => (
                <Link
                  key={m.id}
                  href={`/match/${m.id}`}
                  className="glass-surface border border-border/50 rounded-xl p-3 flex items-center justify-between active:scale-95 transition-transform"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-foreground truncate">{m.teamA}</p>
                    {m.date && (
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(m.date).toLocaleDateString("tr-TR")}
                      </p>
                    )}
                  </div>
                  <div className="px-3 text-center flex-shrink-0">
                    <span className={`font-heading font-bold ${m.won ? "text-primary" : "text-muted-foreground"}`}>
                      {m.setsA}
                    </span>
                    <span className="text-muted-foreground text-xs mx-1">-</span>
                    <span className={`font-heading font-bold ${!m.won ? "text-team-b" : "text-muted-foreground"}`}>
                      {m.setsB}
                    </span>
                  </div>
                  <div className="flex-1 text-right min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{m.teamB}</p>
                    <p className={`text-[10px] font-bold ${m.won ? "text-primary" : "text-destructive"}`}>
                      {m.won ? "G" : "M"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
