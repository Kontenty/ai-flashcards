import React from "react";
import type { ActivityPoint } from "@/types/dashboard";
import { ChartContainer, ChartTooltipContent, ChartLegend } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface ActivityChartProps {
  data: ActivityPoint[];
}

// ActivityChart displays a bar chart of reviews per day
export function ActivityChart({ data }: ActivityChartProps) {
  const config = { reviews: { color: "#3b82f6" } };
  return <h1>ActivityChart</h1>;
}

{
  /* <ChartContainer id="activity" config={config} className="w-full">
  <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" />
    <Tooltip content={<ChartTooltipContent />} />
    <Legend content={<ChartLegend />} />
    <Bar dataKey="reviews" name="Reviews" fill="var(--color-reviews)" />
  </BarChart>
</ChartContainer> */
}
