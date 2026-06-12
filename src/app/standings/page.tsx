import { db } from "@/lib/db";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";

export const dynamic = "force-dynamic";

export default async function StandingsPage() {
  const activeSeason = await db.season.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" />

      <main className="flex-1 px-6 pt-6 flex flex-col gap-6">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Puan Tablosu
        </h2>

        {activeSeason ? (
          <p className="text-sm text-primary font-mono">
            {activeSeason.name}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aktif sezon bulunamadı.
          </p>
        )}

        <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
          <p className="text-sm">Henüz tamamlanmış maç yok.</p>
          <p className="text-xs mt-2 opacity-70">
            Maçlar tamamlandıkça puan tablosu burada görünecek.
          </p>
        </div>
      </main>

      <BottomNavBar />
    </div>
  );
}
