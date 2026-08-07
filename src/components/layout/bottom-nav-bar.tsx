"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Clock, User, PiggyBank } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/history", label: "Maçlar", icon: Clock },
  { href: "/kasa", label: "Kasa", icon: PiggyBank },
  { href: "/settings", label: "Profile", icon: User },
];

export function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-surface/80 backdrop-blur-xl border-t border-border/50 flex justify-around items-center h-20 pb-safe fixed bottom-0 w-full z-50 w-full md:max-w-4xl left-1/2 -translate-x-1/2 rounded-t-xl">
      {navItems.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full hover:bg-white/5 active:scale-95 transition-all duration-200 ${
              isActive
                ? "text-primary font-bold"
                : "text-muted-foreground"
            }`}
          >
            <item.icon
              className={`w-5 h-5 mb-1 ${
                isActive ? "fill-primary/20" : ""
              }`}
            />
            <span className="text-[10px] tracking-widest font-mono uppercase">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
