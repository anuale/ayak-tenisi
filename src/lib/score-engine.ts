const SET_POINTS = 10;
const TIEBREAK_POINTS = 15;

export interface ScoreState {
  teamAScore: number;
  teamBScore: number;
  currentSet: number;
  setScores: Array<{ teamA: number; teamB: number }>;
  teamASets: number;
  teamBSets: number;
  isFinished: boolean;
  winner: "A" | "B" | null;
  history: Array<{ teamA: number; teamB: number }>;
}

export function createInitialScoreState(): ScoreState {
  return {
    teamAScore: 0,
    teamBScore: 0,
    currentSet: 1,
    setScores: [],
    teamASets: 0,
    teamBSets: 0,
    isFinished: false,
    winner: null,
    history: [],
  };
}

const TARGET_SETS = 3;

function getSetTarget(): number {
  return SET_POINTS;
}

function getCurrentSetTarget(currentSet: number): number {
  return currentSet === 5 ? TIEBREAK_POINTS : SET_POINTS;
}

export function addPoint(state: ScoreState, team: "A" | "B"): ScoreState {
  if (state.isFinished) return state;

  const next = { ...state };
  next.history = [...state.history, { teamA: state.teamAScore, teamB: state.teamBScore }];

  if (team === "A") {
    next.teamAScore++;
  } else {
    next.teamBScore++;
  }

  const target = getCurrentSetTarget(next.currentSet);
  const diff = Math.abs(next.teamAScore - next.teamBScore);
  const aWins = next.teamAScore >= target && next.teamAScore - next.teamBScore >= 2;
  const bWins = next.teamBScore >= target && next.teamBScore - next.teamAScore >= 2;

  if (aWins) {
    next.setScores = [...next.setScores, { teamA: next.teamAScore, teamB: next.teamBScore }];
    next.teamASets++;
    next.teamAScore = 0;
    next.teamBScore = 0;
    next.history = [];

    if (next.teamASets >= TARGET_SETS) {
      next.currentSet++;
      next.isFinished = true;
      next.winner = "A";
    } else {
      next.currentSet++;
    }
  } else if (bWins) {
    next.setScores = [...next.setScores, { teamA: next.teamAScore, teamB: next.teamBScore }];
    next.teamBSets++;
    next.teamAScore = 0;
    next.teamBScore = 0;
    next.history = [];

    if (next.teamBSets >= TARGET_SETS) {
      next.currentSet++;
      next.isFinished = true;
      next.winner = "B";
    } else {
      next.currentSet++;
    }
  }

  return next;
}

export function undoPoint(state: ScoreState): ScoreState {
  if (state.isFinished) return state;
  if (state.history.length === 0) return state;

  const next = { ...state };
  const previous = next.history[next.history.length - 1];
  next.history = next.history.slice(0, -1);
  next.teamAScore = previous.teamA;
  next.teamBScore = previous.teamB;
  return next;
}

export function getMaxSets(): number {
  return 5;
}

export function getTargetSets(): number {
  return TARGET_SETS;
}
