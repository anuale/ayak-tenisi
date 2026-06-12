"use client";

import { useState } from "react";

interface PlayerStats {
  userId: string;
  name: string;
  played: number;
  won: number;
  lost: number;
  setsFor: number;
  setsAgainst: number;
  points: number;
}

interface TeamStats {
  name: string;
  played: number;
  won: number;
  lost: number;
  setsFor: number;
  setsAgainst: number;
  points: number;
}

export function StandingsTabs({
  teams,
  players,
  activeSeason,
}: {
  teams: TeamStats[];
  players: PlayerStats[];
  activeSeason: boolean;
}) {
  const [tab, setTab] = useState<"teams" | "players">("teams");

  const medalColors = (i: number) =>
    i === 0
      ? "border-l-[#FFD700] bg-[#FFD700]/5"
      : i === 1
        ? "border-l-[#C0C0C0] bg-[#C0C0C0]/5"
        : i === 2
          ? "border-l-[#CD7F32] bg-[#CD7F32]/5"
          : "border-l-border/50";

  if (!activeSeason) {
    return (
      <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
        <p className="text-sm">Aktif sezon bulunamadı.</p>
      </div>
    );
  }

  const data = tab === "teams" ? teams : players;

  if (data.length === 0) {
    return (
      <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
        <p className="text-sm">Henüz tamamlanmış maç yok.</p>
        <p className="text-xs mt-2 opacity-70">
          Maçlar tamamlandıkça puan tablosu burada görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex border-b border-border/50">
        <button
          onClick={() => setTab("teams")}
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
            tab === "teams"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          Takımlar
        </button>
        <button
          onClick={() => setTab("players")}
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
            tab === "players"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          Oyuncular
        </button>
      </div>

      <div className="hidden md:grid grid-cols-[40px_1fr_40px_40px_40px_40px_50px] gap-2 px-4 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
        <span>#</span>
        <span>{tab === "teams" ? "Takım" : "Oyuncu"}</span>
        <span className="text-center">O</span>
        <span className="text-center">G</span>
        <span className="text-center">M</span>
        <span className="text-center">AV</span>
        <span className="text-center">P</span>
      </div>

      {data.map((item, i) => {
        const name = "userId" in item ? (item as PlayerStats).name : (item as TeamStats).name;
        return (
          <div
            key={"userId" in item ? (item as PlayerStats).userId : (item as TeamStats).name}
            className={`glass-surface border border-border/50 rounded-xl p-4 border-l-4 ${medalColors(i)}`}
          >
            <div className="flex md:hidden items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono font-bold text-muted-foreground w-5">
                  {i + 1}
                </span>
                <span className="text-sm font-medium text-foreground">{name}</span>
              </div>
              <span className="font-heading text-lg font-bold text-primary">
                {item.points}
                <span className="text-[10px] text-muted-foreground font-normal ml-1">P</span>
              </span>
            </div>
            <div className="hidden md:grid grid-cols-[40px_1fr_40px_40px_40px_40px_50px] gap-2 items-center">
              <span className="text-sm font-mono font-bold text-muted-foreground">{i + 1}</span>
              <span className="text-sm font-medium text-foreground">{name}</span>
              <span className="text-sm text-center text-foreground">{item.played}</span>
              <span className="text-sm text-center text-primary">{item.won}</span>
              <span className="text-sm text-center text-muted-foreground">{item.lost}</span>
              <span
                className={`text-sm text-center font-mono ${
                  item.setsFor - item.setsAgainst >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {item.setsFor - item.setsAgainst >= 0 ? "+" : ""}
                {item.setsFor - item.setsAgainst}
              </span>
              <span className="font-heading text-lg font-bold text-primary text-center">
                {item.points}
              </span>
            </div>
            <div className="md:hidden flex gap-2 mt-2 text-[10px] text-muted-foreground">
              <span>O:{item.played} G:{item.won} M:{item.lost}</span>
              <span
                className={
                  item.setsFor - item.setsAgainst >= 0
                    ? "text-primary"
                    : "text-destructive"
                }
              >
                AV:{item.setsFor - item.setsAgainst >= 0 ? "+" : ""}
                {item.setsFor - item.setsAgainst}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
