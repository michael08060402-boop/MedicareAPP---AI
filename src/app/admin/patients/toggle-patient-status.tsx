"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { togglePatientStatus } from "./actions";

export default function TogglePatientStatus({ userId, isActive }: { userId: string; isActive: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await togglePatientStatus(userId, !isActive);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors disabled:opacity-50 ${
        isActive
          ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100"
          : "bg-gray-50 text-gray-500 border-gray-100 hover:bg-gray-100"
      }`}
    >
      {loading && <Loader2 className="w-3 h-3 animate-spin" />}
      {isActive ? "Activo" : "Inactivo"}
    </button>
  );
}
