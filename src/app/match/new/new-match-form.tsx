"use client";

import { useState } from "react";
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
  const [teamASize, setTeamASize] = useState(2);
  const [teamBSize, setTeamBSize] = useState(2);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamAName, setTeamAName] = useState("");
  const [teamBName, setTeamBName] = useState("");
  const [playedAt, setPlayedAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const maxPlayers = 5;
  const minPlayers = 1;
  const teamType = `${teamASize}v${teamBSize}`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const playersA: string[] = [];
    const playersB: string[] = [];

    for (let i = 1; i <= teamASize; i++) {
      const a = formData.get(`teamA_player_${i}`);
      if (a) playersA.push(a as string);
    }
    for (let i = 1; i <= teamBSize; i++) {
      const b = formData.get(`teamB_player_${i}`);
      if (b) playersB.push(b as string);
    }

    if (playersA.length !== playersB.length) {
      setError("Her iki takımda da aynı sayıda oyuncu seçilmelidir.");
      setIsLoading(false);
      return;
    }

    const allPlayerIds = [...playersA, ...playersB];
    const uniqueIds = new Set(allPlayerIds);
    if (uniqueIds.size !== allPlayerIds.length) {
      setError("Bir oyuncu aynı maçta iki takımda da olamaz.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seasonId,
          teamType,
          teamAName: teamAName.trim(),
          teamBName: teamBName.trim(),
          playedAt: playedAt ? new Date(playedAt).toISOString() : undefined,
          playersA,
          playersB,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Maç oluşturulamadı.");
        setIsLoading(false);
        return;
      }

      const match = await res.json();
      router.push(`/match/${match.id}/scoring`);
      router.refresh();
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      setIsLoading(false);
    }
  }

  const playerCount = teamType === "TWO_VS_TWO" ? 2 : 3;

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-32">
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

      <div className="flex-1 px-4 flex flex-col gap-4 mt-2">
        <div className="flex items-center gap-3 justify-center">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Takım A</span>
            <button onClick={() => setTeamASize(Math.max(minPlayers, teamASize - 1))} className="w-7 h-7 rounded-full bg-surface border border-border/50 text-sm">−</button>
            <span className="text-sm font-bold text-primary w-4 text-center">{teamASize}</span>
            <button onClick={() => setTeamASize(Math.min(maxPlayers, teamASize + 1))} className="w-7 h-7 rounded-full bg-surface border border-border/50 text-sm">+</button>
          </div>
          <span className="text-muted-foreground text-sm font-bold">VS</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setTeamBSize(Math.max(minPlayers, teamBSize - 1))} className="w-7 h-7 rounded-full bg-surface border border-border/50 text-sm">−</button>
            <span className="text-sm font-bold text-team-b w-4 text-center">{teamBSize}</span>
            <button onClick={() => setTeamBSize(Math.min(maxPlayers, teamBSize + 1))} className="w-7 h-7 rounded-full bg-surface border border-border/50 text-sm">+</button>
            <span className="text-xs text-muted-foreground">Takım B</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
            Tarih
          </span>
          <input
            type="datetime-local"
            className="flex-1 min-w-0 bg-surface-high border border-border rounded-lg px-2 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            value={playedAt}
            onChange={(e) => setPlayedAt(e.target.value)}
          />
        </div>

        <form id="match-form" onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">
          <div className="flex gap-2 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <input
                className="bg-surface-high border border-border rounded-lg px-3 py-2.5 text-xs text-center text-primary font-bold placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                placeholder="Takım A"
                value={teamAName}
                onChange={(e) => setTeamAName(e.target.value)}
              />
              <PlayerSelects
                team="A"
                count={teamASize}
                users={users}
              />
            </div>

            <div className="flex items-center justify-center pt-6 flex-shrink-0">
              <div className="w-6 h-6 rounded-full bg-surface border border-white/10 flex items-center justify-center">
                <span className="text-[10px] font-heading font-bold text-foreground">VS</span>
              </div>
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-2">
              <input
                className="bg-surface-high border border-border rounded-lg px-3 py-2.5 text-xs text-center text-team-b font-bold placeholder:text-muted-foreground focus:border-team-b focus:outline-none"
                placeholder="Takım B"
                value={teamBName}
                onChange={(e) => setTeamBName(e.target.value)}
              />
              <PlayerSelects
                team="B"
                count={teamBSize}
                users={users}
              />
            </div>
          </div>

          <div className="bg-surface/30 rounded-xl border border-white/5 p-4 flex justify-between items-center mt-auto">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                FORMAT
              </span>
              <span className="font-heading text-lg font-bold text-foreground">
                {teamType}
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
            <p className="text-destructive text-sm text-center py-2 bg-destructive/10 rounded-lg">
              {error}
            </p>
          )}
        </form>
      </div>

      <div className="fixed bottom-0 w-full md:max-w-4xl left-1/2 -translate-x-1/2 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pb-6 z-50">
        <button
          type="submit"
          form="match-form"
          disabled={isLoading}
          className="w-full h-20 bg-primary rounded-full flex items-center justify-center gap-2 text-primary-foreground font-heading text-xl font-bold shadow-[0_0_20px_rgba(78,222,163,0.3)] active:scale-95 transition-transform duration-200 disabled:opacity-50"
        >
          {isLoading ? (
            <span className="animate-spin text-2xl">⟳</span>
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

function PlayerSelects({
  team,
  count,
  users,
}: {
  team: "A" | "B";
  count: number;
  users: UserOption[];
}) {
  const isTeamA = team === "A";
  const barColor = isTeamA ? "bg-primary" : "bg-team-b";

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-surface/50 rounded-lg border border-white/5 p-2 flex flex-col gap-0.5 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 w-1 h-full opacity-50 ${barColor} ${
                isTeamA ? "left-0" : "right-0"
              }`}
            />
            <label className="text-[9px] text-muted-foreground pl-1">
              Oyuncu {i + 1}
            </label>
            <select
              name={`team${team}_player_${i + 1}`}
              defaultValue=""
              className="w-full bg-transparent border-none text-foreground text-xs px-1 py-0 pr-5 focus:ring-0 outline-none cursor-pointer appearance-none truncate"
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2386948a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0 center",
                backgroundSize: "1em",
              }}
            >
              <option value="" disabled className="bg-surface text-foreground">
                Seç
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id} className="bg-surface text-foreground">
                  {user.name}
                </option>
              ))}
            </select>
          </div>
        ))}
    </div>
  );
}
