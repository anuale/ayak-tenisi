"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play } from "lucide-react";
import Link from "next/link";

interface UserOption { id: string; name: string; }

export function NewTournamentForm({
  users,
  seasonId,
}: {
  users: UserOption[];
  seasonId: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [teamType, setTeamType] = useState<"TWO_VS_TWO" | "THREE_VS_THREE">("TWO_VS_TWO");
  const [teamA, setTeamA] = useState<string[]>([]);
  const [teamB, setTeamB] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  function togglePlayer(userId: string, side: "A" | "B") {
    if (side === "A") {
      setTeamA(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
      setTeamB(prev => prev.filter(id => id !== userId));
    } else {
      setTeamB(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
      setTeamA(prev => prev.filter(id => id !== userId));
    }
  }

  async function handleCreate() {
    setError("");
    if (!name.trim()) { setError("Turnuva adı girin."); return; }
    if (teamA.length === 0 || teamB.length === 0) { setError("Her iki tarafta en az 1 oyuncu seçin."); return; }

    setIsLoading(true);
    const res = await fetch("/api/tournaments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        seasonId,
        teamType,
        teamA: teamA.map(id => ({ id, name: users.find(u => u.id === id)?.name || "" })),
        teamB: teamB.map(id => ({ id, name: users.find(u => u.id === id)?.name || "" })),
      }),
    });

    if (res.ok) {
      const t = await res.json();
      router.push(`/tournament/${t.id}`);
    } else {
      const data = await res.json();
      setError(data.error || "Hata oluştu.");
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-28">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/tournament" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-foreground">Yeni Turnuva</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-4 flex flex-col gap-4">
        <input
          className="bg-surface-high border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
          placeholder="Turnuva adı (örn: Yaz Kupası 2026)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Format:</span>
          <span className="text-xs font-bold text-primary">1v1</span>
          <span className="text-xs text-muted-foreground">(her takım 1 kişi)</span>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <p className="text-xs font-mono font-bold text-primary uppercase tracking-widest mb-2">A Grubu</p>
            <div className="flex flex-col gap-1">
              {users.map(u => (
                <button key={u.id}
                  onClick={() => togglePlayer(u.id, "A")}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    teamA.includes(u.id) ? "bg-primary/20 text-primary border border-primary/30" : "bg-surface/50 text-muted-foreground border border-border/20"
                  }`}>
                  {u.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center pt-6">
            <span className="text-muted-foreground text-sm">VS</span>
          </div>

          <div className="flex-1">
            <p className="text-xs font-mono font-bold text-team-b uppercase tracking-widest mb-2">B Grubu</p>
            <div className="flex flex-col gap-1">
              {users.map(u => (
                <button key={u.id}
                  onClick={() => togglePlayer(u.id, "B")}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    teamB.includes(u.id) ? "bg-team-b/20 text-team-b border border-team-b/30" : "bg-surface/50 text-muted-foreground border border-border/20"
                  }`}>
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p className="text-destructive text-sm text-center py-2 bg-destructive/10 rounded-lg">{error}</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Gruplara oyuncuları dağıt. Her A-B eşleşmesi için bir maç oluşacak.
        </p>
      </main>

      <div className="fixed bottom-0 w-full md:max-w-4xl left-1/2 -translate-x-1/2 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pb-6 z-50">
        <button onClick={handleCreate} disabled={isLoading}
          className="w-full h-16 bg-primary rounded-full flex items-center justify-center gap-2 text-primary-foreground font-heading text-lg font-bold shadow-[0_0_20px_rgba(78,222,163,0.3)] active:scale-95 transition-transform disabled:opacity-50">
          {isLoading ? "Oluşturuluyor..." : <><Play className="w-5 h-5" fill="currentColor" /> Turnuvayı Başlat</>}
        </button>
      </div>
    </div>
  );
}
