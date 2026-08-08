import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { KasaPanel } from "./kasa-panel";

export const dynamic = "force-dynamic";

export default async function KasaPage() {
  const session = await auth();
  const transactions = await db.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { name: true } }, paidUser: { select: { name: true } } },
    take: 100,
  });

  const users = await db.user.findMany({
    where: { emailVerified: { not: null } },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const income = transactions.filter(t => t.type === "GELİR").reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter(t => t.type === "GİDER").reduce((s, t) => s + t.amount, 0);
  const balance = income - expense;

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />
      <KasaPanel
        transactions={JSON.parse(JSON.stringify(transactions))}
        users={JSON.parse(JSON.stringify(users))}
        balance={balance}
        income={income}
        expense={expense}
      />
      <BottomNavBar />
    </div>
  );
}
