import { Bell } from "lucide-react";
import { auth } from "@/lib/auth";

export default async function AdminTopbar({ title }: { title: string }) {
  const session = await auth();

  return (
    <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-white border-b border-gray-100 sticky top-0 z-10 shrink-0">
      <h1 className="text-base md:text-lg font-bold text-gray-800">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-blue-200">
            {session?.user?.name?.charAt(0).toUpperCase() ?? "A"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-gray-800 leading-none">
              {session?.user?.name ?? "Administrador"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
