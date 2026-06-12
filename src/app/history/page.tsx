import { db } from "@/lib/db";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const matches = await db.match.findMany({
    where: { status: "FINISHED" },
    include: {
      players: { include: { user: { select: { name: true } } } },
      sets: { orderBy: { setNumber: "asc" } },
    },
    orderBy: { finishedAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" />

      <main className="flex-1 px-6 pt-6 flex flex-col gap-4">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Maç Geçmişi
        </h2>

        {matches.length === 0 ? (
          <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
            <p className="text-sm">Henüz hiç maç oynanmadı.</p>
          </div>
        ) : (
          matches.map((match) => {
            const teamA = match.players
              .filter((p) => p.team === "A")
              .map((p) => p.user.name)
              .join(", ");
            const teamB = match.players
              .filter((p) => p.team === "B")
              .map((p) => p.user.name)
              .join(", ");
            const setsA = match.sets.filter(
              (s) => s.teamAScore > s.teamBScore,
            ).length;
            const setsB = match.sets.filter(
              (s) => s.teamBScore > s.teamAScore,
            ).length;

            return (
              <Link
                key={match.id}
                href={`/match/${match.id}`}
                className="glass-surface border border-border/50 rounded-xl p-4 flex items-center justify-between active:scale-95 transition-transform"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground truncate">
                    {teamA || "Takım A"}
                  </p>
                </div>
                <div className="px-4 text-center">
                  <span
                    className={`font-heading text-lg font-bold ${
                      match.winner === "A"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {setsA}
                  </span>
                  <span className="text-muted-foreground mx-1">-</span>
                  <span
                    className={`font-heading text-lg font-bold ${
                      match.winner === "B"
                        ? "text-team-b"
                        : "text-muted-foreground"
                    }`}
                  >
                    {setsB}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-muted-foreground truncate">
                    {teamB || "Takım B"}
                  </p>
                </div>
              </Link>
            );
          })
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
