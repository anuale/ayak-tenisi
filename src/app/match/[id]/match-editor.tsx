"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Save, X } from "lucide-react";

interface SetScore {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
}

const TOTAL_SETS = 5;
const WIN_SCORE = 10;

export function MatchEditor({
  matchId,
  teamAName: initialTeamA,
  teamBName: initialTeamB,
  sets: initialSets,
  winner: initialWinner,
}: {
  matchId: string;
  teamAName: string;
  teamBName: string;
  sets: SetScore[];
  winner: string | null;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [teamAName, setTeamAName] = useState(initialTeamA);
  const [teamBName, setTeamBName] = useState(initialTeamB);
  const [scores, setScores] = useState<Record<number, { a: string; b: string }>>(() => {
    const initial: Record<number, { a: string; b: string }> = {};
    for (let i = 1; i <= TOTAL_SETS; i++) {
      initial[i] = { a: "", b: "" };
    }
    initialSets.forEach((s) => {
      initial[s.setNumber] = { a: String(s.teamAScore), b: String(s.teamBScore) };
    });
    return initial;
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  function updateScore(set: number, team: "a" | "b", value: string) {
    if (!/^\d*$/.test(value)) return;
    setScores((prev) => ({
      ...prev,
      [set]: { ...prev[set], [team]: value },
    }));
  }

  function calculateWinner() {
    let aWins = 0;
    let bWins = 0;
    const setResults: Array<{ setNumber: number; teamA: number; teamB: number }> = [];

    for (let s = 1; s <= TOTAL_SETS; s++) {
      const a = parseInt(scores[s].a) || 0;
      const b = parseInt(scores[s].b) || 0;
      if (a === 0 && b === 0) break;
      if (a >= WIN_SCORE && a > b) aWins++;
      else if (b >= WIN_SCORE && b > a) bWins++;
      else {
        setError(`Set ${s}: Bir takım ${WIN_SCORE} sayıya ulaşmalı ve önde olmalı.`);
        return null;
      }
      setResults.push({ setNumber: s, teamA: a, teamB: b });
      if (aWins >= 3 || bWins >= 3) break;
    }

    if (setResults.length === 0) {
      setError("En az bir set skoru giriniz.");
      return null;
    }
    if (aWins < 3 && bWins < 3) {
      setError("Bir takım 3 set kazanmalı.");
      return null;
    }

    return {
      winner: aWins >= 3 ? ("A" as const) : ("B" as const),
      setScores: setResults,
    };
  }

  async function handleSave() {
    setError("");
    setMessage("");
    const result = calculateWinner();
    if (!result) return;

    setIsSaving(true);
    const res = await fetch(`/api/matches/${matchId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        teamAName,
        teamBName,
        setScores: result.setScores,
        winner: result.winner,
      }),
    });

    if (res.ok) {
      setMessage("Maç güncellendi!");
      setIsOpen(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Güncelleme başarısız.");
    }
    setIsSaving(false);
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full h-12 rounded-full border border-border/50 text-muted-foreground flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <Edit3 className="w-4 h-4" />
        Skorları Düzenle
      </button>
    );
  }

  return (
    <div className="glass-surface border border-border/50 rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">
          Skorları Düzenle
        </h3>
        <button onClick={() => setIsOpen(false)} className="p-1 text-muted-foreground">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-3">
        <input
          className="flex-1 bg-surface-high border border-border rounded-lg px-3 py-2 text-sm text-center text-primary font-bold focus:border-primary focus:outline-none"
          value={teamAName}
          onChange={(e) => setTeamAName(e.target.value)}
        />
        <span className="text-muted-foreground self-center">VS</span>
        <input
          className="flex-1 bg-surface-high border border-border rounded-lg px-3 py-2 text-sm text-center text-team-b font-bold focus:border-team-b focus:outline-none"
          value={teamBName}
          onChange={(e) => setTeamBName(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-2">
        {Array.from({ length: TOTAL_SETS }).map((_, i) => {
          const setNum = i + 1;
          return (
            <div key={setNum} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-8">S{setNum}</span>
              <input
                className="w-14 h-9 bg-surface-high border border-border rounded-lg text-center text-sm font-mono font-bold focus:border-primary focus:outline-none"
                placeholder="0"
                inputMode="numeric"
                value={scores[setNum].a}
                onChange={(e) => updateScore(setNum, "a", e.target.value)}
              />
              <span className="text-muted-foreground text-xs">-</span>
              <input
                className="w-14 h-9 bg-surface-high border border-border rounded-lg text-center text-sm font-mono font-bold focus:border-team-b focus:outline-none"
                placeholder="0"
                inputMode="numeric"
                value={scores[setNum].b}
                onChange={(e) => updateScore(setNum, "b", e.target.value)}
              />
            </div>
          );
        })}
      </div>

      {error && (
        <p className="text-destructive text-xs text-center">{error}</p>
      )}
      {message && (
        <p className="text-primary text-xs text-center">{message}</p>
      )}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full h-10 bg-primary text-primary-foreground rounded-full font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50"
      >
        {isSaving ? (
          <span className="animate-spin">⟳</span>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Kaydet
          </>
        )}
      </button>
    </div>
  );
}
