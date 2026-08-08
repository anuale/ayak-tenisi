import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await auth();
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
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />

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
            const teamA = match.teamAName || match.players
              .filter((p) => p.team === "A")
              .map((p) => p.user.name)
              .join(", ");
            const teamB = match.teamBName || match.players
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
                className="glass-surface border border-border/50 rounded-xl p-3 flex items-center justify-between active:scale-95 transition-transform gap-1"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground leading-tight">
                    {teamA || "Takım A"}
                  </p>
                  {match.playedAt && (
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {new Date(match.playedAt).toLocaleDateString("tr-TR")}
                    </p>
                  )}
                </div>
                <div className="px-2 text-center flex-shrink-0">
                  <span
                    className={`font-heading text-sm font-bold ${
                      match.winner === "A"
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    {setsA}
                  </span>
                  <span className="text-muted-foreground mx-0.5 text-xs">-</span>
                  <span
                    className={`font-heading text-sm font-bold ${
                      match.winner === "B"
                        ? "text-team-b"
                        : "text-muted-foreground"
                    }`}
                  >
                    {setsB}
                  </span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <p className="text-[11px] text-muted-foreground leading-tight">
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
