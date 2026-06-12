"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Trophy, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Kayıt sırasında bir hata oluştu.");
      return;
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Kayıt başarılı fakat giriş yapılamadı.");
      return;
    }

    startTransition(() => {
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="w-full max-w-md px-6 relative z-10 flex flex-col min-h-screen justify-center">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(78,222,163,0.1)]">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tighter mb-2">
          Hesap <span className="text-primary">Oluştur</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Ayak tenisi topluluğuna katıl.
        </p>
      </div>

      <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="relative w-full">
            <input
              className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
              id="name"
              name="name"
              placeholder=" "
              required
              type="text"
              autoComplete="name"
            />
            <label
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
              htmlFor="name"
            >
              İsim Soyisim
            </label>
          </div>

          <div className="relative w-full">
            <input
              className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
              id="email"
              name="email"
              placeholder=" "
              required
              type="email"
              autoComplete="email"
            />
            <label
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
              htmlFor="email"
            >
              E-posta Adresi
            </label>
          </div>

          <div className="relative w-full">
            <input
              className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
              id="password"
              name="password"
              placeholder=" "
              required
              type="password"
              autoComplete="new-password"
            />
            <label
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
              htmlFor="password"
            >
              Şifre
            </label>
          </div>

          <div className="relative w-full">
            <input
              className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
              id="confirmPassword"
              name="confirmPassword"
              placeholder=" "
              required
              type="password"
              autoComplete="new-password"
            />
            <label
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
              htmlFor="confirmPassword"
            >
              Şifre Tekrar
            </label>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="h-12 bg-primary text-primary-foreground font-bold text-lg rounded-full active:scale-95 active:opacity-80 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(78,222,163,0.3)] hover:shadow-[0_0_30px_rgba(78,222,163,0.5)] disabled:opacity-50 mt-2"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Hesap Oluştur
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Zaten hesabınız var mı?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:text-primary/80 transition-colors"
          >
            Giriş Yap
          </Link>
        </p>
      </div>
    </div>
  );
}
