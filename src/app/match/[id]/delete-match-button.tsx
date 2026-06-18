"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function DeleteMatchButton({ matchId }: { matchId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Bu maçı silmek istediğinize emin misiniz?")) return;
    setIsDeleting(true);
    const res = await fetch(`/api/matches/${matchId}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/history");
      router.refresh();
    }
    setIsDeleting(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="w-full h-10 rounded-full border border-destructive/30 text-destructive text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform mt-2"
    >
      <Trash2 className="w-4 h-4" />
      {isDeleting ? "Siliniyor..." : "Maçı Sil"}
    </button>
  );
}
