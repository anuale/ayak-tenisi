"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";

export function ChangePasswordForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("Yeni şifre en az 8 karakter olmalı.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "İşlem başarısız.");
        setIsLoading(false);
        return;
      }

      setSuccess("Şifreniz başarıyla değiştirildi.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsOpen(false);
    } catch {
      setError("Bağlantı hatası.");
    }
    setIsLoading(false);
  }

  return (
    <div className="glass-surface border border-border/50 rounded-xl p-5">
      {!isOpen ? (
        <button
          onClick={() => { setIsOpen(true); setError(""); setSuccess(""); }}
          className="w-full text-sm text-foreground font-medium text-left"
        >
          Şifre Değiştir
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h3 className="text-sm font-medium text-foreground">Şifre Değiştir</h3>
          <input
            type="password"
            className="bg-surface-high border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Mevcut şifre"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            className="bg-surface-high border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Yeni şifre"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            className="bg-surface-high border border-border rounded-lg px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
            placeholder="Yeni şifre tekrar"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />

          {error && (
            <p className="text-destructive text-xs">{error}</p>
          )}
          {success && (
            <p className="text-primary text-xs flex items-center gap-1">
              <Check className="w-3 h-3" /> {success}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex-1 py-2 rounded-full border border-border/50 text-sm text-muted-foreground active:scale-95 transition-transform"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-1"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Güncelle"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
