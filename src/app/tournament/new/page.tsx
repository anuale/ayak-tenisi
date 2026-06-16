import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { NewTournamentForm } from "./new-tournament-form";

export const dynamic = "force-dynamic";

export default async function NewTournamentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const activeSeason = await db.season.findFirst({
    where: { isActive: true },
    orderBy: { startDate: "desc" },
  });

  if (!activeSeason) {
    return (
      <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto items-center justify-center px-6 text-center">
        <h2 className="text-xl font-bold text-foreground mb-4">Aktif Sezon Bulunamadı</h2>
        <p className="text-muted-foreground text-sm">Turnuva başlatmak için önce bir sezon oluşturmalısınız.</p>
      </div>
    );
  }

  const users = await db.user.findMany({
    where: { emailVerified: { not: null } },
    orderBy: { name: "asc" },
  });

  return (
    <NewTournamentForm
      users={users.map(u => ({ id: u.id, name: u.name }))}
      seasonId={activeSeason.id}
    />
  );
}
