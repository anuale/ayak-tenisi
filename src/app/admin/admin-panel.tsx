"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  Check,
  X,
  UserPlus,
  Shield,
  UserMinus,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { BottomNavBar } from "@/components/layout/bottom-nav-bar";

type Season = {
  id: string;
  name: string;
  isActive: boolean;
  startDate: string;
  endDate?: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type AdminMatch = {
  id: string;
  teamAName: string | null;
  teamBName: string | null;
  teamType: string;
  winner: string | null;
  status: string;
  finishedAt: string | null;
  lastEditedAt: string | null;
  players: Array<{ user: { name: string }; team: string }>;
  sets: Array<{ setNumber: number; teamAScore: number; teamBScore: number }>;
};

export function AdminPanel({
  currentUserEmail,
  seasons: initialSeasons,
  users: initialUsers,
}: {
  currentUserEmail: string;
  seasons: Season[];
  users: User[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"seasons" | "players" | "matches">("seasons");
  const [seasons, setSeasons] = useState(initialSeasons);
  const [users, setUsers] = useState(initialUsers);
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [matchesLoaded, setMatchesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function loadMatches() {
    if (matchesLoaded) return;
    const res = await fetch("/api/matches?all=true");
    if (res.ok) {
      const data = await res.json();
      setMatches(data.matches);
    }
    setMatchesLoaded(true);
  }

  const [newSeasonName, setNewSeasonName] = useState("");
  const [editingSeason, setEditingSeason] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const [newPlayerName, setNewPlayerName] = useState("");

  async function api(url: string, opts?: RequestInit) {
    setMessage("");
    setLoading(true);
    const res = await fetch(url, opts);
    const data = await res.json();
    setMessage(data.message || data.error || "");
    setLoading(false);
    return { ok: res.ok, data };
  }

  async function createSeason() {
    if (!newSeasonName.trim()) return;
    const { ok, data } = await api("/api/admin/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newSeasonName }),
    });
    if (ok) {
      setSeasons([data.season, ...seasons]);
      setNewSeasonName("");
    }
    router.refresh();
  }

  async function updateSeason(id: string) {
    const { ok, data } = await api(`/api/admin/seasons`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: editName }),
    });
    if (ok) {
      setSeasons(seasons.map((s) => (s.id === id ? data.season : s)));
      setEditingSeason(null);
    }
    router.refresh();
  }

  async function toggleSeasonActive(id: string, isActive: boolean) {
    const { ok } = await api(`/api/admin/seasons`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (ok) {
      setSeasons(
        seasons.map((s) =>
          s.id === id ? { ...s, isActive: !isActive } : { ...s, isActive: false },
        ),
      );
    }
    router.refresh();
  }

  async function deleteSeason(id: string) {
    if (!confirm("Bu sezonu ve içindeki tüm maçları silmek istediğinize emin misiniz?")) return;
    const { ok } = await api(`/api/admin/seasons?id=${id}`, { method: "DELETE" });
    if (ok) setSeasons(seasons.filter((s) => s.id !== id));
    router.refresh();
  }

  async function createPlayer() {
    if (!newPlayerName.trim()) return;
    const randomId = Math.random().toString(36).substring(2, 8);
    const email = `${newPlayerName.toLowerCase().replace(/\s+/g, ".")}.${randomId}@demo.local`;
    const { ok, data } = await api("/api/admin/players", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newPlayerName,
        email,
        password: "demo1234",
      }),
    });
    if (ok) {
      setUsers([...users, data.user]);
      setNewPlayerName("");
    }
    router.refresh();
  }

  async function toggleAdmin(userId: string, currentRole: string) {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    const { ok } = await api(`/api/admin/players`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });
    if (ok) {
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
    }
    router.refresh();
  }

  async function deletePlayer(userId: string) {
    if (!confirm("Bu oyuncuyu silmek istediğinize emin misiniz?")) return;
    const { ok } = await api(`/api/admin/players?userId=${userId}`, { method: "DELETE" });
    if (ok) setUsers(users.filter((u) => u.id !== userId));
    router.refresh();
  }

  return (
    <div className="flex flex-col min-h-screen max-w-lg md:max-w-4xl mx-auto pb-24">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-border/50">
        <Link
          href="/"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-surface/50 border border-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </Link>
        <h1 className="font-heading text-xl font-bold text-foreground">
          Admin Panel
        </h1>
      </header>

      <div className="flex border-b border-border/50">
        {(["seasons", "players", "matches"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-widest transition-colors ${
              tab === t
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground"
            }`}
          >
            {t === "seasons" ? "Sezonlar" : t === "players" ? "Oyuncular" : "Maçlar"}
          </button>
        ))}
      </div>

      {message && (
        <div className="mx-6 mt-3 px-4 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary text-center">
          {message}
        </div>
      )}

      <main className="flex-1 px-6 pt-4 overflow-y-auto">
        {tab === "seasons" && (
          <div className="flex flex-col gap-4">
            <div className="flex gap-2">
              <input
                className="flex-1 bg-surface-high border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="Sezon adı..."
                value={newSeasonName}
                onChange={(e) => setNewSeasonName(e.target.value)}
              />
              <button
                onClick={createSeason}
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm active:scale-95 transition-transform disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {seasons.map((s) => (
              <div
                key={s.id}
                className={`glass-surface border rounded-xl p-4 ${
                  s.isActive ? "border-primary/30" : "border-border/50"
                }`}
              >
                {editingSeason === s.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="flex-1 bg-surface-high border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => updateSeason(s.id)}
                      className="p-2 text-primary"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingSeason(null)}
                      className="p-2 text-muted-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {s.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(s.startDate).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleSeasonActive(s.id, s.isActive)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-bold ${
                          s.isActive
                            ? "bg-primary/20 text-primary"
                            : "bg-surface text-muted-foreground"
                        }`}
                      >
                        {s.isActive ? "AKTİF" : "PASİF"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSeason(s.id);
                          setEditName(s.name);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteSeason(s.id)}
                        className="p-1 text-destructive hover:text-destructive/80"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "players" && (
          <div className="flex flex-col gap-4">
            <div className="glass-surface border border-border/50 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-sm font-medium text-foreground">
                Oyuncu Ekle
              </p>
              <p className="text-[10px] text-muted-foreground -mt-2">
                E-posta ve şifre otomatik oluşturulur. Sadece isim yazın.
              </p>
              <input
                className="bg-surface-high border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                placeholder="İsim Soyisim"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
              />
              <button
                onClick={createPlayer}
                disabled={loading}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Oyuncu Ekle
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="glass-surface border border-border/50 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {u.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        u.role === "ADMIN"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface text-muted-foreground"
                      }`}
                    >
                      {u.role}
                    </span>
                    <button
                      onClick={() => toggleAdmin(u.id, u.role)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title={
                        u.role === "ADMIN"
                          ? "Admin yetkisini kaldır"
                          : "Admin yap"
                      }
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deletePlayer(u.id)}
                      className="p-1 text-destructive hover:text-destructive/80"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "matches" && (
          <div className="flex flex-col gap-3">
            <button
              onClick={loadMatches}
              className="w-full py-2 bg-surface border border-border/50 rounded-lg text-sm text-foreground active:scale-95 transition-transform"
            >
              {matchesLoaded ? `${matches.length} maç yüklendi` : "Maçları Yükle"}
            </button>

            {matches.length === 0 && matchesLoaded && (
              <div className="glass-surface border border-border/50 rounded-xl p-8 text-center text-muted-foreground">
                <p className="text-sm">Henüz hiç maç yok.</p>
              </div>
            )}

            {matches.map((m) => {
              const teamA = m.teamAName || "Takım A";
              const teamB = m.teamBName || "Takım B";
              const setsA = m.sets.filter((s) => s.teamAScore > s.teamBScore).length;
              const setsB = m.sets.filter((s) => s.teamBScore > s.teamAScore).length;
              const playersA = m.players.filter((p) => p.team === "A").map((p) => p.user.name).join(", ");
              const playersB = m.players.filter((p) => p.team === "B").map((p) => p.user.name).join(", ");

              return (
                <div
                  key={m.id}
                  className={`glass-surface border rounded-xl p-4 ${
                    m.status === "LIVE" ? "border-primary/30" : "border-border/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        m.status === "FINISHED"
                          ? "bg-primary/10 text-primary"
                          : "bg-team-b/10 text-team-b"
                      }`}>
                        {m.status === "FINISHED" ? "BİTTİ" : "CANLI"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {m.finishedAt ? new Date(m.finishedAt).toLocaleDateString("tr-TR") : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <a
                        href={`/match/${m.id}`}
                        className="text-[10px] text-primary font-mono font-bold uppercase"
                      >
                        Detay
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-primary">{teamA}</p>
                      <p className="text-[10px] text-muted-foreground">{playersA}</p>
                    </div>
                    <span className="font-heading text-lg font-bold px-4">
                      <span className={m.winner === "A" ? "text-primary" : "text-muted-foreground opacity-50"}>
                        {setsA}
                      </span>
                      <span className="text-muted-foreground opacity-30 mx-1">-</span>
                      <span className={m.winner === "B" ? "text-team-b" : "text-muted-foreground opacity-50"}>
                        {setsB}
                      </span>
                    </span>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold text-team-b">{teamB}</p>
                      <p className="text-[10px] text-muted-foreground">{playersB}</p>
                    </div>
                  </div>

                  {m.lastEditedAt && (
                    <p className="text-[10px] text-muted-foreground mt-2 text-center">
                      Düzenlendi: {new Date(m.lastEditedAt).toLocaleString("tr-TR")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <BottomNavBar />
    </div>
  );
}
