import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { StandingsTabs } from "./standings-tabs";

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

interface TeamStats {
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
  const teamMap = new Map<string, TeamStats>();

  for (const match of matches) {
    const teamA = match.teamAName || "Takım A";
    const teamB = match.teamBName || "Takım B";

    for (const teamName of [teamA, teamB]) {
      if (!teamMap.has(teamName)) {
        teamMap.set(teamName, {
          name: teamName,
          played: 0,
          won: 0,
          lost: 0,
          setsFor: 0,
          setsAgainst: 0,
          points: 0,
        });
      }
    }

    const teamAStats = teamMap.get(teamA)!;
    const teamBStats = teamMap.get(teamB)!;
    teamAStats.played++;
    teamBStats.played++;

    const teamAWins = match.sets.filter((s) => s.teamAScore > s.teamBScore).length;
    const teamBWins = match.sets.filter((s) => s.teamBScore > s.teamAScore).length;

    teamAStats.setsFor += teamAWins;
    teamAStats.setsAgainst += teamBWins;
    teamBStats.setsFor += teamBWins;
    teamBStats.setsAgainst += teamAWins;

    if (match.winner === "A") {
      teamAStats.won++;
      teamAStats.points += 3;
      teamBStats.lost++;
    } else {
      teamBStats.won++;
      teamBStats.points += 3;
      teamAStats.lost++;
    }

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

  const teams = Array.from(teamMap.values()).sort(
    (a, b) => b.points - a.points || b.setsFor - b.setsAgainst - (a.setsFor - a.setsAgainst),
  );

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />

      <main className="flex-1 px-6 pt-6 flex flex-col gap-4">
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

        <StandingsTabs
          teams={teams}
          players={players}
          activeSeason={!!activeSeason}
        />
      </main>

      <BottomNavBar />
    </div>
  );
}
