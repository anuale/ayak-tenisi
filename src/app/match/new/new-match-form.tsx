"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Play, Users } from "lucide-react";
import Link from "next/link";

interface UserOption {
  id: string;
  name: string;
}

export function NewMatchForm({
  users,
  seasonId,
}: {
  users: UserOption[];
  seasonId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [teamType, setTeamType] = useState<"TWO_VS_TWO" | "THREE_VS_THREE">(
    "TWO_VS_TWO",
  );
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    const playersA: string[] = [];
    const playersB: string[] = [];

    for (let i = 1; i <= (teamType === "TWO_VS_TWO" ? 2 : 3); i++) {
      const a = formData.get(`teamA_player_${i}`);
      const b = formData.get(`teamB_player_${i}`);
      if (a) playersA.push(a as string);
      if (b) playersB.push(b as string);
    }

    if (playersA.length !== playersB.length) {
      setError("Her iki takımda da aynı sayıda oyuncu seçilmelidir.");
      return;
    }

    const allPlayerIds = [...playersA, ...playersB];
    const uniqueIds = new Set(allPlayerIds);
    if (uniqueIds.size !== allPlayerIds.length) {
      setError("Bir oyuncu aynı maçta iki takımda da olamaz.");
      return;
    }

    const res = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        seasonId,
        teamType,
        playersA,
        playersB,
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Maç oluşturulamadı.");
      return;
    }

    const match = await res.json();

    startTransition(() => {
      router.push(`/match/${match.id}/scoring`);
      router.refresh();
    });
  }

  const playerCount = teamType === "TWO_VS_TWO" ? 2 : 3;

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto pb-32">
      <header className="flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10 hover:bg-white/5 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-xl font-bold text-foreground">
          YENİ MAÇ
        </h1>
        <div className="w-10" />
      </header>

      <div className="flex-1 px-6 flex flex-col gap-6 mt-4">
        <div className="w-full flex justify-center">
          <div className="bg-surface/50 backdrop-blur-md rounded-full p-1 flex border border-white/10 relative w-64">
            <div
              className={`absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-surface-high rounded-full border border-white/10 transition-transform duration-300 ${
                teamType === "THREE_VS_THREE" ? "translate-x-full" : ""
              }`}
            />
            <button
              type="button"
              onClick={() => setTeamType("TWO_VS_TWO")}
              className={`flex-1 py-2 relative z-10 text-xs font-mono font-bold tracking-widest transition-colors ${
                teamType === "TWO_VS_TWO"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              2 VS 2
            </button>
            <button
              type="button"
              onClick={() => setTeamType("THREE_VS_THREE")}
              className={`flex-1 py-2 relative z-10 text-xs font-mono font-bold tracking-widest transition-colors ${
                teamType === "THREE_VS_THREE"
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              3 VS 3
            </button>
          </div>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-4 flex-1">
          <div className="flex gap-4 flex-1">
            <PlayerColumn
              team="A"
              label="TAKIM A"
              accentColor="team-a"
              playerCount={playerCount}
              users={users}
            />
            <div className="flex flex-col items-center justify-center py-8">
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
              <div className="w-8 h-8 rounded-full bg-surface border border-white/10 flex items-center justify-center my-2">
                <span className="font-heading text-sm text-foreground">VS</span>
              </div>
              <div className="w-[1px] h-full bg-gradient-to-b from-transparent via-white/20 to-transparent" />
            </div>
            <PlayerColumn
              team="B"
              label="TAKIM B"
              accentColor="team-b"
              playerCount={playerCount}
              users={users}
            />
          </div>

          <div className="bg-surface/30 rounded-xl border border-white/5 p-4 flex justify-between items-center mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                FORMAT
              </span>
              <span className="font-heading text-lg font-bold text-foreground">
                {teamType === "TWO_VS_TWO" ? "2v2" : "3v3"}
              </span>
            </div>
            <div className="h-8 w-[1px] bg-white/10" />
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                SET SİSTEMİ
              </span>
              <span className="font-heading text-lg font-bold text-foreground">
                5 Set
              </span>
            </div>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
        </form>
      </div>

      <div className="fixed bottom-0 w-full max-w-lg left-1/2 -translate-x-1/2 p-6 bg-gradient-to-t from-background via-background/90 to-transparent pb-6 z-50">
        <button
          type="submit"
          form="match-form"
          onClick={() => {
            const form = document.getElementById(
              "match-form",
            ) as HTMLFormElement;
            form?.requestSubmit();
          }}
          disabled={isPending}
          className="w-full h-20 bg-primary rounded-full flex items-center justify-center gap-2 text-primary-foreground font-heading text-xl font-bold shadow-[0_0_20px_rgba(78,222,163,0.3)] active:scale-95 transition-transform duration-200 disabled:opacity-50"
        >
          {isPending ? (
            <span className="animate-spin">⟳</span>
          ) : (
            <>
              MAÇI BAŞLAT
              <Play className="w-6 h-6" fill="currentColor" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function PlayerColumn({
  team,
  label,
  accentColor,
  playerCount,
  users,
}: {
  team: "A" | "B";
  label: string;
  accentColor: string;
  playerCount: number;
  users: UserOption[];
}) {
  const isTeamA = team === "A";
  const barColor = isTeamA ? "bg-primary" : "bg-team-b";

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="text-center pb-2 border-b border-white/10">
        <span
          className={`text-xs font-mono font-bold tracking-widest ${
            isTeamA ? "text-primary" : "text-team-b"
          }`}
        >
          {label}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => {
          const hidden = i >= playerCount;
          return (
            <div
              key={i}
              className={`bg-surface/50 rounded-lg border border-white/5 p-3 flex flex-col gap-2 relative overflow-hidden transition-all ${
                hidden ? "opacity-20" : ""
              }`}
            >
              <div
                className={`absolute top-0 w-1 h-full opacity-50 ${barColor} ${
                  isTeamA ? "left-0" : "right-0"
                }`}
              />
              <div
                className={`flex items-center gap-3 ${
                  isTeamA ? "" : "flex-row-reverse"
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-surface-high border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-muted-foreground" />
                </div>
                {hidden ? (
                  <div className="text-muted-foreground text-sm">
                    3v3 için
                  </div>
                ) : (
                  <select
                    name={`team${team}_player_${i + 1}`}
                    required
                    defaultValue=""
                    className="w-full bg-transparent border-none text-foreground text-sm p-0 pr-4 focus:ring-0 outline-none cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386948a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: isTeamA
                        ? "right 0 center"
                        : "left 0 center",
                      backgroundSize: "1em",
                    }}
                  >
                    <option value="" disabled className="bg-surface text-foreground">
                      Seçiniz
                    </option>
                    {users.map((user) => (
                      <option
                        key={user.id}
                        value={user.id}
                        className="bg-surface text-foreground"
                      >
                        {user.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
