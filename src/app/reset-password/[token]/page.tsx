"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Trophy, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "İşlem başarısız.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Bağlantı hatası.");
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-6">
          <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Şifreniz Değişti!</h2>
          <p className="text-sm text-muted-foreground">Giriş sayfasına yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-md px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl mb-6">
            <Trophy className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tighter mb-2">
            Yeni <span className="text-primary">Şifre</span>
          </h1>
          <p className="text-muted-foreground text-sm">Yeni şifrenizi belirleyin.</p>
        </div>

        <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative w-full">
              <input
                className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
                id="password"
                placeholder=" "
                required
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
              <label
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
                htmlFor="password"
              >
                Yeni Şifre
              </label>
            </div>

            <div className="relative w-full">
              <input
                className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
                id="confirm"
                placeholder=" "
                required
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
              />
              <label
                className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
                htmlFor="confirm"
              >
                Şifre Tekrar
              </label>
            </div>

            {error && (
              <p className="text-destructive text-sm text-center py-2 bg-destructive/10 rounded-lg">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="h-12 bg-primary text-primary-foreground font-bold text-lg rounded-full active:scale-95 active:opacity-80 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(78,222,163,0.3)] disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Şifreyi Güncelle
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-primary hover:text-primary/80">
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
