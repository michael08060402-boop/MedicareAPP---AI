"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#3B82F6", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B"];

export default function SpecialtiesChart({ data }: { data: { name: string; value: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-gray-300">
        Sin especialidades registradas
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }} barSize={10}>
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={90} />
        <Tooltip
          contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
          formatter={(v) => [`${v} médicos`, ""]}
          cursor={{ fill: "#F8FAFC" }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
