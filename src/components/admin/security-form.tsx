"use client";

import { useActionState, useState } from "react";
import { changePassword } from "@/lib/actions";
import { Eye, EyeOff } from "lucide-react";

const init: { error?: string; success?: string } = {};

function PasswordInput({ name, placeholder }: { name: string; placeholder: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 pr-10 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function SecurityForm() {
  const [state, action, pending] = useActionState(changePassword, init);

  return (
    <form action={action}>
      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Contraseña actual</label>
          <PasswordInput name="current" placeholder="••••••••" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nueva contraseña</label>
            <PasswordInput name="next" placeholder="••••••••" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 block mb-1.5">Confirmar contraseña</label>
            <PasswordInput name="confirm" placeholder="••••••••" />
          </div>
        </div>

        {state?.error && <p className="text-xs text-red-500">{state.error}</p>}
        {state?.success && <p className="text-xs text-emerald-600">{state.success}</p>}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={pending}
            className="bg-violet-500 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-60"
          >
            {pending ? "Guardando..." : "Cambiar contraseña"}
          </button>
        </div>
      </div>
    </form>
  );
}
