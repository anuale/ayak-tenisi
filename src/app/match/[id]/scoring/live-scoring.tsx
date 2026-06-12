"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Undo2 } from "lucide-react";
import Link from "next/link";
import { addPoint, undoPoint, ScoreState, createInitialScoreState, getTargetSets, getMaxSets } from "@/lib/score-engine";

interface MatchPlayer {
  id: string;
  team: "A" | "B";
  user: { id: string; name: string };
}

interface MatchSet {
  setNumber: number;
  teamAScore: number;
  teamBScore: number;
}

interface Match {
  id: string;
  teamType: string;
  players: MatchPlayer[];
  sets: MatchSet[];
}

export function LiveScoring({ match }: { match: Match }) {
  const router = useRouter();
  const [score, setScore] = useState<ScoreState>(() => {
    const initial = createInitialScoreState();
    if (match.sets.length > 0) {
      const lastSet = match.sets[match.sets.length - 1];
      initial.teamAScore = lastSet.teamAScore;
      initial.teamBScore = lastSet.teamBScore;
      initial.currentSet = lastSet.setNumber;
    }
    match.sets.slice(0, -1).forEach((s) => {
      if (s.teamAScore > s.teamBScore) initial.teamASets++;
      else initial.teamBSets++;
    });
    return initial;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const teamAPlayers = match.players
    .filter((p) => p.team === "A")
    .map((p) => p.user.name);
  const teamBPlayers = match.players
    .filter((p) => p.team === "B")
    .map((p) => p.user.name);

  const isAServing = score.teamAScore >= score.teamBScore;

  const handleIncrement = useCallback((team: "A" | "B") => {
    if (score.isFinished) return;
    if (navigator.vibrate) navigator.vibrate(30);
    setScore((prev) => addPoint(prev, team));
  }, [score.isFinished]);

  const handleUndo = useCallback(() => {
    if (score.isFinished) return;
    if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
    setScore((prev) => undoPoint(prev));
  }, [score.isFinished]);

  async function handleFinish() {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const res = await fetch(`/api/matches/${match.id}/finish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setScores: [
          ...score.setScores,
          { teamA: score.teamAScore, teamB: score.teamBScore },
        ],
        winner: score.winner,
      }),
    });

    if (res.ok) {
      router.push(`/match/${match.id}`);
      router.refresh();
    } else {
      setIsSubmitting(false);
    }
  }

  const maxSets = getMaxSets();
  const targetSets = getTargetSets();

  return (
    <div className="h-dvh w-screen overflow-hidden flex flex-col bg-background select-none touch-manipulation max-w-lg md:max-w-4xl mx-auto">
      <header className="flex justify-between items-center px-6 h-12 bg-background/50 backdrop-blur-xl border-b border-border/50">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono font-bold text-primary">
            {teamAPlayers.join(", ") || "TEAM A"}
          </span>
          <span className="text-muted-foreground opacity-50">VS</span>
          <span className="font-mono font-bold text-team-b">
            {teamBPlayers.join(", ") || "TEAM B"}
          </span>
        </div>
        <div className="w-5" />
      </header>

      <main className="flex-1 w-full flex flex-col relative">
        <section className="h-1/2 w-full flex flex-col items-center justify-center px-6 relative">
          {!score.isFinished && (
            <div className="absolute top-4 flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-surface/50">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isAServing ? "bg-primary" : "bg-team-b"
                }`}
              />
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase">
                SERVING
              </span>
            </div>
          )}

          <div className="flex items-center justify-center gap-6 w-full mt-8">
            <span
              className={`score-display text-7xl text-right flex-1 transition-colors ${
                score.teamAScore > score.teamBScore
                  ? "text-primary"
                  : score.teamAScore === score.teamBScore
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {score.teamAScore}
            </span>
            <span className="font-heading text-2xl text-muted-foreground opacity-30">
              -
            </span>
            <span
              className={`score-display text-7xl text-left flex-1 transition-colors ${
                score.teamBScore > score.teamAScore
                  ? "text-team-b"
                  : score.teamBScore === score.teamAScore
                    ? "text-foreground"
                    : "text-muted-foreground"
              }`}
            >
              {score.teamBScore}
            </span>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex gap-1.5">
              {Array.from({ length: maxSets }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < score.teamASets
                      ? "bg-primary shadow-[0_0_6px_rgba(78,222,163,0.5)]"
                      : "bg-surface-high border border-border/30"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground opacity-50">
              SETS
            </span>
            <div className="flex gap-1.5">
              {Array.from({ length: maxSets }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < score.teamBSets
                      ? "bg-team-b shadow-[0_0_6px_rgba(236,106,6,0.5)]"
                      : "bg-surface-high border border-border/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {score.isFinished && (
            <div className="mt-6 text-center">
              <p className="text-xl font-bold text-primary mb-2">
                {score.winner === "A"
                  ? teamAPlayers.join(", ")
                  : teamBPlayers.join(", ")}
              </p>
              <p className="text-sm text-muted-foreground mb-4">KAZANDI!</p>
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded-full active:scale-95 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Kaydediliyor..." : "Maçı Bitir"}
              </button>
            </div>
          )}
        </section>

        <section className="h-1/2 w-full flex relative">
          <button
            onClick={() => handleIncrement("A")}
            disabled={score.isFinished}
            className="w-1/2 h-full bg-[#10b981] tap-effect flex flex-col items-center justify-center gap-2 outline-none disabled:opacity-30"
          >
            <span className="score-display text-6xl text-[#003824] leading-none">
              +1
            </span>
            <span className="font-heading text-lg font-bold text-[#003824] uppercase">
              {teamAPlayers[0]?.split(" ")[0] || "TEAM A"}
            </span>
          </button>

          <button
            onClick={() => handleIncrement("B")}
            disabled={score.isFinished}
            className="w-1/2 h-full bg-[#ec6a06] tap-effect flex flex-col items-center justify-center gap-2 outline-none disabled:opacity-30"
          >
            <span className="score-display text-6xl text-[#4a1c00] leading-none">
              +1
            </span>
            <span className="font-heading text-lg font-bold text-[#4a1c00] uppercase">
              {teamBPlayers[0]?.split(" ")[0] || "TEAM B"}
            </span>
          </button>

          {!score.isFinished && (
            <button
              onClick={handleUndo}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[72px] h-[72px] bg-surface-highest rounded-full border-4 border-background flex items-center justify-center text-foreground z-10 tap-effect shadow-lg"
            >
              <Undo2 className="w-8 h-8" />
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
