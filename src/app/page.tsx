import Link from "next/link";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import {
  Play,
  CalendarDays,
  Users,
  Flame,
} from "lucide-react";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  const recentMatches = await db.match.findMany({
    where: { status: "FINISHED" },
    include: {
      players: { include: { user: { select: { name: true } } } },
      sets: { orderBy: { setNumber: "asc" } },
    },
    orderBy: { finishedAt: "desc" },
    take: 5,
  });

  const activePlayersCount = await db.user.count();

  const weekMatches = await db.match.count({
    where: {
      status: "FINISHED",
      finishedAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
  });

  const finishedMatches = await db.match.findMany({
    where: { status: "FINISHED" },
    include: {
      players: { include: { user: { select: { id: true, name: true } } } },
      sets: true,
    },
  });

  const playerWinCount = new Map<string, { name: string; wins: number }>();
  for (const m of finishedMatches) {
    const winningTeam = m.winner;
    for (const mp of m.players) {
      if (!playerWinCount.has(mp.userId)) {
        playerWinCount.set(mp.userId, { name: mp.user.name, wins: 0 });
      }
      if (mp.team === winningTeam) {
        playerWinCount.get(mp.userId)!.wins++;
      }
    }
  }
  const topPlayers = Array.from(playerWinCount.values())
    .sort((a, b) => b.wins - a.wins);
  const maxWins = topPlayers[0]?.wins || 0;
  const topScorers = topPlayers.filter(p => p.wins === maxWins && maxWins > 0).map(p => p.name);
  const topScorerNames = topScorers.length > 0 ? topScorers : ["--"];
  const topScorerWins = maxWins;

  const teamWinCount = new Map<string, number>();
  for (const m of finishedMatches) {
    const winnerName = m.winner === "A" ? (m.teamAName || "Takım A") : (m.teamBName || "Takım B");
    teamWinCount.set(winnerName, (teamWinCount.get(winnerName) || 0) + 1);
  }
  const topTeamNames = Array.from(teamWinCount.entries())
    .sort((a, b) => b[1] - a[1]);
  const topTeamWins = topTeamNames[0]?.[1] || 0;
  const topTeams = topTeamNames.filter(t => t[1] === topTeamWins && topTeamWins > 0).map(t => t[0]);

  const activeSeason = await db.season.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto relative">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />

      <main className="flex-1 overflow-y-auto px-6 pt-6 pb-24 flex flex-col gap-8">
        {/* Welcome */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Hoş geldin,{" "}
            <span className="text-foreground font-medium">
              {session?.user?.name || "Oyuncu"}
            </span>
          </p>
          {(session?.user as any)?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-[10px] font-mono font-bold text-primary/70 hover:text-primary transition-colors uppercase tracking-widest"
            >
              Admin
            </Link>
          )}
        </div>

        {/* Season Badge */}
        {activeSeason && (
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 shadow-[0_0_15px_rgba(78,222,163,0.15)] text-primary">
              <CalendarDays className="w-4 h-4" />
              <span className="text-xs font-mono font-bold uppercase tracking-widest">
                {activeSeason.name}
              </span>
            </div>
          </div>
        )}

        {/* Hero CTA */}
        <section className="flex justify-center">
          <Link
            href="/match/new"
            className="w-full h-[100px] rounded-full bg-primary text-primary-foreground active:scale-95 active:opacity-80 transition-all duration-200 flex items-center justify-center gap-3 shadow-[0_0_30px_rgba(78,222,163,0.3)] animate-[pulse-emerald_2s_infinite]"
          >
            <Play className="w-8 h-8" fill="currentColor" />
            <span className="font-heading text-2xl font-extrabold tracking-tight">
              YENİ MAÇ BAŞLAT
            </span>
          </Link>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="glass-surface border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
            <CalendarDays className="w-5 h-5 text-team-b" />
            <span className="font-heading text-xl font-bold text-foreground">
              {weekMatches}
            </span>
            <span className="text-[10px] text-muted-foreground text-center opacity-70">
              BU HAFTA
            </span>
          </div>
          <div className="glass-surface border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-heading text-xl font-bold text-foreground">
              {activePlayersCount}
            </span>
            <span className="text-[10px] text-muted-foreground text-center opacity-70">
              OYUNCU
            </span>
          </div>
          <div className="glass-surface border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-team-b" />
            <div className="flex flex-col items-center gap-0.5 max-w-full">
              {topScorerNames.map((name, i) => (
                <span key={i} className="text-[11px] font-bold text-foreground leading-tight truncate max-w-full">
                  {name}{topScorerWins > 0 ? ` (${topScorerWins}G)` : ""}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-muted-foreground text-center opacity-70">
              GOL KRALI
            </span>
          </div>
          <div className="glass-surface border border-border/50 rounded-xl p-3 flex flex-col items-center justify-center gap-1">
            <Flame className="w-5 h-5 text-primary" />
            <div className="flex flex-col items-center gap-0.5 max-w-full">
              {topTeams.length > 0 ? topTeams.map((name, i) => (
                <span key={i} className="text-[11px] font-bold text-primary leading-tight truncate max-w-full">
                  {name}{topTeamWins > 0 ? ` (${topTeamWins}G)` : ""}
                </span>
              )) : (
                <span className="text-[11px] font-bold text-muted-foreground">--</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground text-center opacity-70">
              EN İYİ TAKIM
            </span>
          </div>
        </section>

        {/* Recent Matches */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Son Karşılaşmalar
            </h2>
            <Link
              href="/history"
              className="text-xs font-mono font-bold text-primary hover:opacity-80 transition-opacity"
            >
              TÜMÜNÜ GÖR
            </Link>
          </div>

          {recentMatches.length === 0 ? (
            <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
              <p className="text-sm">Henüz hiç maç oynanmadı.</p>
              <Link
                href="/match/new"
                className="text-primary text-sm font-medium mt-2 inline-block hover:underline"
              >
                İlk maçı başlat →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {recentMatches.map((match) => {
                const teamA = match.teamAName || match.players
                  .filter((p) => p.team === "A")
                  .map((p) => p.user.name)
                  .join(", ");
                const teamB = match.teamBName || match.players
                  .filter((p) => p.team === "B")
                  .map((p) => p.user.name)
                  .join(", ");
                const setsA = match.sets.filter(
                  (s) =>
                    s.teamAScore > s.teamBScore ||
                    (s.teamAScore >= 10 && s.teamAScore >= s.teamBScore + 1)
                ).length;
                const setsB = match.sets.filter(
                  (s) =>
                    s.teamBScore > s.teamAScore ||
                    (s.teamBScore >= 10 && s.teamBScore >= s.teamAScore + 1)
                ).length;
                const winner = match.winner;
                const isTeamAWinner = winner === "A";

                const matchDate = match.playedAt
                  ? new Date(match.playedAt).toLocaleDateString("tr-TR")
                  : match.finishedAt
                    ? getTimeAgo(match.finishedAt)
                    : "";

                return (
                  <Link
                    key={match.id}
                    href={`/match/${match.id}`}
                    className="glass-surface border border-border/50 rounded-xl p-4 flex items-center justify-between active:scale-95 transition-transform relative overflow-hidden"
                  >
                    <div
                      className={`absolute top-0 bottom-0 w-1 ${
                        isTeamAWinner ? "left-0 bg-primary" : "right-0 bg-team-b"
                      }`}
                    />
                    <div className="flex-1 flex flex-col items-end">
                      <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                        {teamA || "Takım A"}
                      </span>
                      {isTeamAWinner && (
                        <span className="text-[10px] text-primary mt-1">
                          KAZANAN
                        </span>
                      )}
                    </div>
                    <div className="px-6 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-heading text-xl font-bold ${
                            isTeamAWinner ? "text-primary" : "text-muted-foreground opacity-70"
                          }`}
                        >
                          {setsA}
                        </span>
                        <span className="text-sm text-muted-foreground">-</span>
                        <span
                          className={`font-heading text-xl font-bold ${
                            !isTeamAWinner ? "text-team-b" : "text-muted-foreground opacity-70"
                          }`}
                        >
                          {setsB}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 opacity-50">
                        {matchDate}
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col items-start">
                      <span className="text-sm font-medium text-muted-foreground truncate max-w-[120px]">
                        {teamB || "Takım B"}
                      </span>
                      {!isTeamAWinner && (
                        <span className="text-[10px] text-team-b mt-1">
                          KAZANAN
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <BottomNavBar />
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "BUGÜN";
  if (diffDays === 1) return "DÜN";
  return `${diffDays} GÜN ÖNCE`;
}
