import Link from "next/link";
import { Trophy, ArrowLeft, MessageCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="w-full max-w-md px-6 relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-surface/50 backdrop-blur-xl border border-white/10 rounded-2xl mb-6 shadow-[0_0_30px_rgba(78,222,163,0.1)]">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="font-heading text-2xl font-bold tracking-tighter mb-2">
          Şifremi <span className="text-primary">Unuttum</span>
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Şifrenizi sıfırlamak için admin ile iletişime geçin.
        </p>

        <div className="bg-surface/30 backdrop-blur-xl border border-white/10 rounded-xl p-6 text-center">
          <MessageCircle className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-sm text-foreground mb-4">
            Grup admininiz şifrenizi sıfırlayabilir. Admin ile iletişime geçip
            yeni şifrenizi isteyin.
          </p>
        </div>

        <div className="mt-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-primary font-medium text-sm hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}
