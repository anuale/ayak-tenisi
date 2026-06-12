import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NewMatchForm } from "./new-match-form";

export const dynamic = "force-dynamic";

export default async function NewMatchPage() {
  const session = await auth();
  const users = await db.user.findMany({
    where: {},
    orderBy: { name: "asc" },
  });

  const activeSeason = await db.season.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  if (!activeSeason) {
    return (
      <div className="flex flex-col min-h-screen max-w-lg md:max-w-4xl mx-auto items-center justify-center px-6 text-center">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Aktif Sezon Bulunamadı
        </h2>
        <p className="text-muted-foreground text-sm">
          Yeni maç başlatmak için önce admin panelinden bir sezon oluşturmalısınız.
        </p>
      </div>
    );
  }

  return (
    <NewMatchForm
      users={users.map((u) => ({ id: u.id, name: u.name }))}
      seasonId={activeSeason.id}
    />
  );
}
