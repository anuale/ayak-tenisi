"use client";

import Link from "next/link";
import { Trophy, Settings, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

interface TopAppBarProps {
  showBack?: boolean;
  backHref?: string;
  title?: string;
  isAdmin?: boolean;
}

export function TopAppBar({ showBack, backHref, title, isAdmin }: TopAppBarProps) {
  const pathname = usePathname();

  return (
    <header className="bg-background/50 backdrop-blur-xl border-b border-border/50 flex justify-between items-center px-6 sticky top-0 w-full z-50 w-full md:max-w-4xl mx-auto" style={{ minHeight: "48px", paddingTop: "max(env(safe-area-inset-top), 0px)" }}>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="text-primary hover:opacity-80 active:scale-95 transition-transform"
        >
          <Trophy className="w-6 h-6" />
        </Link>
      </div>

      {title && (
        <h1 className="font-bold tracking-tight text-primary text-lg">
          {title}
        </h1>
      )}

      <div className="flex items-center gap-1">
        {isAdmin && (
          <Link
            href="/admin"
            className="text-team-b hover:text-team-b/80 active:scale-95 transition-all p-1"
            title="Admin Panel"
          >
            <Shield className="w-5 h-5" />
          </Link>
        )}
        <Link
          href="/settings"
          className="text-muted-foreground hover:text-foreground active:scale-95 transition-all p-1"
        >
          <Settings className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
