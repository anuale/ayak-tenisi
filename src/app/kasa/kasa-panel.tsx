"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface Transaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  creator: { name: string };
  createdAt: string;
}

export function KasaPanel({
  transactions,
  balance,
  income,
  expense,
}: {
  transactions: Transaction[];
  balance: number;
  income: number;
  expense: number;
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState("GELİR");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const num = parseFloat(amount);
    if (!num || num <= 0) { setError("Geçerli bir tutar girin."); return; }
    if (!description.trim()) { setError("Açıklama girin."); return; }

    setIsSaving(true);
    const res = await fetch("/api/kasa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, amount: num, description: description.trim() }),
    });
    if (res.ok) {
      setAmount("");
      setDescription("");
      setIsAdding(false);
      router.refresh();
    } else {
      const d = await res.json();
      setError(d.error || "Hata");
    }
    setIsSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu işlemi silmek istediğinize emin misiniz?")) return;
    await fetch(`/api/kasa?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <main className="flex-1 overflow-y-auto px-4 pt-4 pb-4 flex flex-col gap-4">
      {/* Balance Card */}
      <div className={`glass-surface border rounded-xl p-5 text-center ${balance >= 0 ? "border-primary/30 bg-primary/5" : "border-destructive/30 bg-destructive/5"}`}>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Kasa Bakiyesi</p>
        <span className={`font-heading text-3xl font-bold ${balance >= 0 ? "text-primary" : "text-destructive"}`}>
          {balance >= 0 ? "+" : "-"}₺{Math.abs(balance).toFixed(2)}
        </span>
        <div className="flex justify-center gap-6 mt-3">
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Gelir</span>
            <p className="text-sm font-bold text-primary">+₺{income.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <span className="text-xs text-muted-foreground">Gider</span>
            <p className="text-sm font-bold text-destructive">-₺{expense.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Add Transaction */}
      {isAdding ? (
        <form onSubmit={handleAdd} className="glass-surface border border-border/50 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex gap-2">
            <button type="button" onClick={() => setType("GELİR")}
              className={`flex-1 py-2 rounded-full text-xs font-bold ${type === "GELİR" ? "bg-primary/20 text-primary" : "bg-surface text-muted-foreground"}`}>
              Gelir
            </button>
            <button type="button" onClick={() => setType("GİDER")}
              className={`flex-1 py-2 rounded-full text-xs font-bold ${type === "GİDER" ? "bg-destructive/20 text-destructive" : "bg-surface text-muted-foreground"}`}>
              Gider
            </button>
          </div>
          <input className="bg-surface-high border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Açıklama (örn: Saha ücreti, Aidat)"
            value={description} onChange={e => setDescription(e.target.value)} />
          <input className="bg-surface-high border border-border rounded-lg px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Tutar (₺)" inputMode="decimal"
            value={amount} onChange={e => setAmount(e.target.value)} />
          {error && <p className="text-destructive text-xs">{error}</p>}
          <div className="flex gap-2">
            <button type="button" onClick={() => setIsAdding(false)}
              className="flex-1 py-2 rounded-full border border-border/50 text-sm text-muted-foreground">İptal</button>
            <button type="submit" disabled={isSaving}
              className="flex-1 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50">
              {isSaving ? "..." : "Ekle"}
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setIsAdding(true)}
          className="w-full h-12 rounded-full border border-dashed border-border/50 text-muted-foreground flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <Plus className="w-4 h-4" />
          <span className="text-sm">İşlem Ekle</span>
        </button>
      )}

      {/* Transactions */}
      <p className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-widest">İşlemler</p>
      <div className="flex flex-col gap-2">
        {transactions.map((t) => (
          <div key={t.id} className="glass-surface border border-border/50 rounded-xl p-3 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${t.type === "GELİR" ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
              {t.type === "GELİR" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">{t.description}</p>
              <p className="text-[10px] text-muted-foreground">
                {new Date(t.createdAt).toLocaleDateString("tr-TR")} · {t.creator.name}
              </p>
            </div>
            <span className={`text-sm font-bold ${t.type === "GELİR" ? "text-primary" : "text-destructive"}`}>
              {t.type === "GELİR" ? "+" : "-"}₺{t.amount.toFixed(2)}
            </span>
            <button onClick={() => handleDelete(t.id)} className="text-muted-foreground hover:text-destructive text-[10px]">
              Sil
            </button>
          </div>
        ))}
        {transactions.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">Henüz işlem yok.</div>
        )}
      </div>
    </main>
  );
}
