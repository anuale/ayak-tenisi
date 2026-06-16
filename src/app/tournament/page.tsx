import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import Link from "next/link";
import { Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TournamentListPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const activeSeason = await db.season.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  const tournaments = await db.tournament.findMany({
    where: activeSeason ? { seasonId: activeSeason.id } : {},
    include: {
      matches: {
        where: { status: "FINISHED" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />

      <main className="flex-1 px-4 pt-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-foreground">Turnuvalar</h2>
          {activeSeason && (
            <Link
              href="/tournament/new"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-xs font-bold active:scale-95 transition-transform"
            >
              Yeni Turnuva
            </Link>
          )}
        </div>

        {tournaments.length === 0 && (
          <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Henüz turnuva yok.</p>
            <p className="text-xs mt-2 opacity-70">Turnuva oluşturup tüm eşleşmeleri otomatik üretebilirsin.</p>
          </div>
        )}

        {tournaments.map((t) => (
          <Link
            key={t.id}
            href={`/tournament/${t.id}`}
            className="glass-surface border border-border/50 rounded-xl p-4 flex items-center justify-between active:scale-95 transition-transform"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{t.name}</p>
              <p className="text-[10px] text-muted-foreground">
                {t.teamType === "TWO_VS_TWO" ? "2v2" : "3v3"} · {new Date(t.createdAt).toLocaleDateString("tr-TR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{t.matches.length} maç</span>
              <span className="text-primary">→</span>
            </div>
          </Link>
        ))}
      </main>

      <BottomNavBar />
    </div>
  );
}
