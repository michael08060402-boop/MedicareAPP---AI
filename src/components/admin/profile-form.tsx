"use client";

import { useActionState } from "react";
import { updateProfile } from "@/lib/actions";

interface Props {
  name: string;
  email: string;
}

const init: { error?: string; success?: string } = {};

export default function ProfileForm({ name, email }: Props) {
  const [state, action, pending] = useActionState(updateProfile, init);

  return (
    <form action={action}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Nombre completo</label>
          <input
            name="name"
            defaultValue={name}
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition"
            placeholder="Tu nombre"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 block mb-1.5">Correo electrónico</label>
          <input
            name="email"
            defaultValue={email}
            type="email"
            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition"
            placeholder="tu@email.com"
          />
        </div>
      </div>

      {state?.error && <p className="mt-3 text-xs text-red-500">{state.error}</p>}
      {state?.success && <p className="mt-3 text-xs text-emerald-600">{state.success}</p>}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm shadow-blue-200 hover:opacity-90 transition-opacity disabled:opacity-60"
        >
          {pending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
