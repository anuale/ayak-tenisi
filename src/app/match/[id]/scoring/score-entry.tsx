"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

interface PlayerInfo { id: string; name: string; }
interface Match {
  id: string;
  teamType: string;
}

const TOTAL_SETS = 5;
const WIN_SCORE = 10;
const TARGET_SET_WINS = 3;

export function ScoreEntry({
  match,
  teamAName,
  teamBName,
  teamAPlayers,
  teamBPlayers,
}: {
  match: Match;
  teamAName: string;
  teamBName: string;
  teamAPlayers: PlayerInfo[];
  teamBPlayers: PlayerInfo[];
}) {
  const router = useRouter();
  const [scores, setScores] = useState<Record<number, { a: string; b: string }>>(
    () => {
      const initial: Record<number, { a: string; b: string }> = {};
      for (let i = 1; i <= TOTAL_SETS; i++) initial[i] = { a: "", b: "" };
      return initial;
    },
  );
  const [playerPoints, setPlayerPoints] = useState<Record<string, Record<string, string>>>({});
  const [expandedSets, setExpandedSets] = useState<Record<number, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function updateScore(set: number, team: "a" | "b", value: string) {
    if (!/^\d*$/.test(value)) return;
    const num = parseInt(value);
    if (value !== "" && (isNaN(num) || num > 50)) return;
    setScores((prev) => ({
      ...prev,
      [set]: { ...prev[set], [team]: value },
    }));
  }

  function updatePlayerPoints(playerId: string, set: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const num = parseInt(value);
    if (value !== "" && (isNaN(num) || num > 50)) return;
      setPlayerPoints(prev => ({
        ...prev,
        [playerId]: { ...(prev[playerId] || {}), [set.toString()]: value },
      }));
  }

  function toggleSet(set: number) {
    setExpandedSets(prev => ({ ...prev, [set]: !prev[set] }));
  }

  function calculateWinner() {
    let aWins = 0, bWins = 0;
    const setResults: Array<{ setNumber: number; teamA: number; teamB: number }> = [];
    let playedSets = 0;

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
      playedSets = s;

      if (aWins >= TARGET_SET_WINS || bWins >= TARGET_SET_WINS) break;
    }

    if (setResults.length === 0) { setError("En az bir set skoru giriniz."); return null; }

    if (aWins < TARGET_SET_WINS && bWins < TARGET_SET_WINS) {
      if (aWins === 2 && bWins === 2) setError("Setler 2-2. Lütfen 5. set skorunu da girin.");
      else setError(`Maçın bitmesi için bir takım ${TARGET_SET_WINS} set kazanmalı.`);
      return null;
    }

    return {
      winner: aWins >= TARGET_SET_WINS ? ("A" as const) : ("B" as const),
      setScores: setResults,
    };
  }

  function collectPlayerPoints() {
    const result: Array<{ userId: string; setNumber: number; pointsWon: number; pointsLost: number; team: string }> = [];
    for (const pid of Object.keys(playerPoints)) {
      const isTeamA = teamAPlayers.some(p => p.id === pid);
      for (const snKey of Object.keys(playerPoints[pid] || {})) {
        const pts = parseInt(playerPoints[pid][snKey]) || 0;
        if (pts > 0) {
          result.push({ userId: pid, setNumber: parseInt(snKey), pointsWon: pts, pointsLost: 0, team: isTeamA ? "A" : "B" });
        }
      }
    }
    return result;
  }

  async function handleFinish() {
    setError("");
    const result = calculateWinner();
    if (!result) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/matches/${match.id}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setScores: result.setScores,
          winner: result.winner,
          playerPoints: collectPlayerPoints(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kayıt sırasında hata oluştu.");
        setIsSubmitting(false);
        return;
      }

      router.push(`/match/${match.id}`);
      router.refresh();
    } catch {
      setError("Bağlantı hatası.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen w-full md:max-w-4xl mx-auto pb-28">
      <header className="flex items-center justify-between px-4 py-4 border-b border-border/50">
        <Link href="/" className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-lg font-bold text-foreground">SKOR GİRİŞİ</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 px-4 pt-4 flex flex-col gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3">
            <span className="text-base font-bold text-primary">{teamAName}</span>
            <span className="text-muted-foreground text-sm">VS</span>
            <span className="text-base font-bold text-team-b">{teamBName}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Her set 10 sayı. 3 set kazanan maçı alır.</p>
        </div>

        <div className="flex flex-col gap-3">
          {Array.from({ length: TOTAL_SETS }).map((_, i) => {
            const setNum = i + 1;
            const isOptional = setNum >= 4;
            const hasPlayers = teamAPlayers.length > 0 || teamBPlayers.length > 0;

            return (
              <div key={setNum} className={`glass-surface border rounded-xl p-3 ${isOptional ? "border-border/30" : "border-border/50"}`}>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-muted-foreground uppercase">
                    Set {setNum}
                  </span>
                  {isOptional && (
                    <span className="text-[10px] text-muted-foreground bg-surface px-2 py-0.5 rounded-full">gerekirse</span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">10 sayı</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    className="w-16 h-12 bg-surface-high border border-border rounded-lg text-center text-xl font-heading font-bold text-foreground focus:border-primary focus:outline-none"
                    placeholder="0" value={scores[setNum].a}
                    onChange={(e) => updateScore(setNum, "a", e.target.value)} inputMode="numeric" maxLength={2}
                  />
                  <span className="text-muted-foreground font-bold">-</span>
                  <input
                    className="w-16 h-12 bg-surface-high border border-border rounded-lg text-center text-xl font-heading font-bold text-foreground focus:border-team-b focus:outline-none"
                    placeholder="0" value={scores[setNum].b}
                    onChange={(e) => updateScore(setNum, "b", e.target.value)} inputMode="numeric" maxLength={2}
                  />
                  {hasPlayers && (
                    <button onClick={() => toggleSet(setNum)} className="p-1 text-muted-foreground hover:text-foreground ml-auto">
                      {expandedSets[setNum] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>

                {hasPlayers && expandedSets[setNum] && (
                  <div className="mt-3 pt-3 border-t border-border/20">
                    <p className="text-[10px] text-muted-foreground mb-2">Oyuncu sayıları (opsiyonel)</p>
                    <div className="flex gap-3">
                      <div className="flex-1 flex flex-col gap-1.5">
                        {teamAPlayers.map(p => (
                          <div key={p.id} className="flex items-center gap-1">
                            <span className="text-[10px] text-primary truncate flex-1">{p.name}</span>
                            <input
                              className="w-12 h-8 bg-surface-high border border-border rounded-lg text-center text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                              placeholder="0" inputMode="numeric" maxLength={2}
                              value={playerPoints[p.id]?.[setNum.toString()] || ""}
                              onChange={(e) => updatePlayerPoints(p.id, setNum, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="w-[1px] bg-border/30" />
                      <div className="flex-1 flex flex-col gap-1.5">
                        {teamBPlayers.map(p => (
                          <div key={p.id} className="flex items-center gap-1">
                            <input
                              className="w-12 h-8 bg-surface-high border border-border rounded-lg text-center text-xs font-mono text-foreground focus:border-team-b focus:outline-none"
                              placeholder="0" inputMode="numeric" maxLength={2}
                              value={playerPoints[p.id]?.[setNum.toString()] || ""}
                              onChange={(e) => updatePlayerPoints(p.id, setNum, e.target.value)}
                            />
                            <span className="text-[10px] text-team-b truncate flex-1 text-right">{p.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p className="text-destructive text-sm text-center py-2 bg-destructive/10 rounded-lg">{error}</p>
        )}
      </main>

      <div className="fixed bottom-0 w-full md:max-w-4xl left-1/2 -translate-x-1/2 p-4 bg-gradient-to-t from-background via-background/90 to-transparent pb-6 z-50">
        <button onClick={handleFinish} disabled={isSubmitting}
          className="w-full h-16 bg-primary rounded-full flex items-center justify-center gap-2 text-primary-foreground font-heading text-lg font-bold shadow-[0_0_20px_rgba(78,222,163,0.3)] active:scale-95 transition-transform duration-200 disabled:opacity-50">
          {isSubmitting ? <span className="animate-spin text-xl">⟳</span> : <><Save className="w-5 h-5" /> MAÇI BİTİR VE KAYDET</>}
        </button>
      </div>
    </div>
  );
}
