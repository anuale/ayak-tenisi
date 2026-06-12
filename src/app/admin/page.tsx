import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { AdminPanel } from "./admin-panel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: session.user.email! },
  });
  if (user?.role !== "ADMIN") redirect("/");

  const seasons = await db.season.findMany({
    orderBy: { startDate: "desc" },
  });

  const users = await db.user.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <AdminPanel
      currentUserEmail={session.user.email!}
      seasons={JSON.parse(JSON.stringify(seasons))}
      users={JSON.parse(JSON.stringify(users))}
    />
  );
}
