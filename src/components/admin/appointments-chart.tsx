"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AppointmentsChart({ data }: { data: { month: string; citas: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorCitas" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: "white", border: "1px solid #E2E8F0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)", fontSize: "12px" }}
          labelStyle={{ color: "#1E293B", fontWeight: 600 }}
          itemStyle={{ color: "#3B82F6" }}
          formatter={(v) => [`${v} citas`, ""]}
        />
        <Area type="monotone" dataKey="citas" stroke="#3B82F6" strokeWidth={2.5} fill="url(#colorCitas)" dot={{ fill: "#3B82F6", r: 4, strokeWidth: 0 }} activeDot={{ r: 6, strokeWidth: 0 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
