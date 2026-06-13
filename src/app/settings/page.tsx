import { auth, signOut } from "@/lib/auth";
import { TopAppBar } from "@/components/layout/top-app-bar";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";
import { LogOut } from "lucide-react";
import { ChangePasswordForm } from "./change-password-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-24">
      <TopAppBar title="AYAK TENİSİ SKOR" isAdmin={(session?.user as any)?.role === "ADMIN"} />

      <main className="flex-1 px-6 pt-6 flex flex-col gap-6">
        <h2 className="font-heading text-xl font-bold text-foreground">
          Profil
        </h2>

        <div className="glass-surface border border-border/50 rounded-xl p-6">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-muted-foreground">İsim</p>
              <p className="text-foreground font-medium">
                {session?.user?.name || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">E-posta</p>
              <p className="text-foreground font-medium">
                {session?.user?.email || "-"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="text-foreground font-medium">
                {(session?.user as any)?.role === "ADMIN" ? "Admin" : "Oyuncu"}
              </p>
            </div>
          </div>
        </div>

        <ChangePasswordForm />

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="w-full h-12 rounded-full border border-destructive text-destructive font-medium flex items-center justify-center gap-2 active:scale-95 transition-transform">
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </form>
      </main>

      <BottomNavBar />
    </div>
  );
}
