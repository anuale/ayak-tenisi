"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trophy, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);

    try {
      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      if (result?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md px-6 relative z-10 flex flex-col min-h-screen justify-center">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(78,222,163,0.1)]">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
          <h1 className="font-heading text-3xl font-bold tracking-tighter mb-2">
            AYAK TENİSİ <span className="text-primary">SKOR</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Performansınızı takip edin.
          </p>
      </div>

      <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative w-full">
            <input
              className="peer block w-full appearance-none rounded-t-lg border-0 border-b-2 border-border bg-surface-high px-4 pb-2.5 pt-6 text-base text-foreground focus:border-primary focus:outline-none focus:ring-0"
              id="email"
              name="email"
              placeholder=" "
              required
              type="email"
              autoComplete="email"
              disabled={isLoading}
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
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              disabled={isLoading}
            />
            <label
              className="absolute left-4 top-4 z-10 origin-[0] -translate-y-2 scale-75 transform text-sm text-muted-foreground duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-2 peer-focus:scale-75 peer-focus:text-primary"
              htmlFor="password"
            >
              Şifre
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-destructive text-sm text-center bg-destructive/10 rounded-lg py-2 px-3">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end mt-2 mb-4">
            <Link
              href="/forgot-password"
              className="text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Şifremi Unuttum
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="h-12 bg-primary text-primary-foreground font-bold text-lg rounded-full active:scale-95 active:opacity-80 transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(78,222,163,0.3)] hover:shadow-[0_0_30px_rgba(78,222,163,0.5)] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Giriş Yap
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:text-primary/80 transition-colors"
          >
            Hesap Oluştur
          </Link>
        </p>
      </div>
    </div>
  );
}
