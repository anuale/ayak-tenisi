import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";

export const dynamic = "force-dynamic";

interface PlayerStats {
  userId: string;
  name: string;
  played: number;
  won: number;
  lost: number;
  setsFor: number;
  setsAgainst: number;
  points: number;
}

export default async function StandingsPage() {
  const session = await auth();
  const activeSeason = await db.season.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  const matches = activeSeason
    ? await db.match.findMany({
        where: { seasonId: activeSeason.id, status: "FINISHED" },
        include: {
          players: { include: { user: { select: { id: true, name: true } } } },
          sets: { orderBy: { setNumber: "asc" } },
        },
      })
    : [];

  const playerMap = new Map<string, PlayerStats>();

  for (const match of matches) {
    for (const mp of match.players) {
      if (!playerMap.has(mp.userId)) {
        playerMap.set(mp.userId, {
          userId: mp.userId,
          name: mp.user.name,
          played: 0,
          won: 0,
          lost: 0,
          setsFor: 0,
          setsAgainst: 0,
          points: 0,
        });
      }
    }

    const teamAPlayers = match.players.filter((p) => p.team === "A");
    const teamBPlayers = match.players.filter((p) => p.team === "B");

    const teamAWins = match.sets.filter(
      (s) => s.teamAScore > s.teamBScore,
    ).length;
    const teamBWins = match.sets.filter(
      (s) => s.teamBScore > s.teamAScore,
    ).length;
    const aWon = match.winner === "A";
    const bWon = match.winner === "B";

    for (const p of teamAPlayers) {
      const stats = playerMap.get(p.userId)!;
      stats.played++;
      stats.setsFor += teamAWins;
      stats.setsAgainst += teamBWins;
      if (aWon) { stats.won++; stats.points += 3; }
      else stats.lost++;
    }

    for (const p of teamBPlayers) {
      const stats = playerMap.get(p.userId)!;
      stats.played++;
      stats.setsFor += teamBWins;
      stats.setsAgainst += teamAWins;
      if (bWon) { stats.won++; stats.points += 3; }
      else stats.lost++;
    }
  }

  const players = Array.from(playerMap.values()).sort(
    (a, b) => b.points - a.points || b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst),
  );

  return (
    <div className="flex flex-col min-h-screen max-w-lg md:max-w-4xl mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />

      <main className="flex-1 px-6 pt-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-foreground">
            Puan Tablosu
          </h2>
          {activeSeason && (
            <span className="text-xs font-mono font-bold text-primary">
              {activeSeason.name}
            </span>
          )}
        </div>

        {players.length === 0 ? (
          <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">Henüz tamamlanmış maç yok.</p>
            <p className="text-xs mt-2 opacity-70">
              Maçlar tamamlandıkça puan tablosu burada görünecek.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden md:grid grid-cols-[40px_1fr_40px_40px_40px_40px_50px] gap-2 px-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
              <span>#</span>
              <span>Oyuncu</span>
              <span className="text-center">O</span>
              <span className="text-center">G</span>
              <span className="text-center">M</span>
              <span className="text-center">AV</span>
              <span className="text-center">P</span>
            </div>

            {players.map((p, i) => {
              const medalColor =
                i === 0
                  ? "border-l-[#FFD700] bg-[#FFD700]/5"
                  : i === 1
                    ? "border-l-[#C0C0C0] bg-[#C0C0C0]/5"
                    : i === 2
                      ? "border-l-[#CD7F32] bg-[#CD7F32]/5"
                      : "border-l-border/50";

              return (
                <div
                  key={p.userId}
                  className={`glass-surface border border-border/50 rounded-xl p-4 border-l-4 ${medalColor}`}
                >
                  <div className="flex md:hidden items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono font-bold text-muted-foreground w-5">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-foreground">
                        {p.name}
                      </span>
                    </div>
                    <span className="font-heading text-lg font-bold text-primary">
                      {p.points}
                      <span className="text-[10px] text-muted-foreground font-normal ml-1">
                        P
                      </span>
                    </span>
                  </div>
                  <div className="hidden md:grid grid-cols-[40px_1fr_40px_40px_40px_40px_50px] gap-2 items-center">
                    <span className="text-sm font-mono font-bold text-muted-foreground">
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {p.name}
                    </span>
                    <span className="text-sm text-center text-foreground">
                      {p.played}
                    </span>
                    <span className="text-sm text-center text-primary">
                      {p.won}
                    </span>
                    <span className="text-sm text-center text-muted-foreground">
                      {p.lost}
                    </span>
                    <span
                      className={`text-sm text-center font-mono ${
                        p.setsFor - p.setsAgainst >= 0
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {p.setsFor - p.setsAgainst >= 0 ? "+" : ""}
                      {p.setsFor - p.setsAgainst}
                    </span>
                    <span className="font-heading text-lg font-bold text-primary text-center">
                      {p.points}
                    </span>
                  </div>
                  <div className="md:hidden flex gap-2 mt-2 text-[10px] text-muted-foreground">
                    <span>
                      O:{p.played} G:{p.won} M:{p.lost}
                    </span>
                    <span
                      className={
                        p.setsFor - p.setsAgainst >= 0
                          ? "text-primary"
                          : "text-destructive"
                      }
                    >
                      AV:{p.setsFor - p.setsAgainst >= 0 ? "+" : ""}
                      {p.setsFor - p.setsAgainst}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
