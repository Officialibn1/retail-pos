"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

interface RevenueChartProps {
  data: Array<{
    date: string;
    sales: number;
    revenue: number;
  }>;
}

const chartConfig = {
  revenue: {
    label: "Revenue (₦)",
    color: "#5c705d",
  },
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ChartContainer config={chartConfig}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          className="text-lunar-green-600"
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          className="text-lunar-green-600"
          tickFormatter={(value) => `₦${value}`}
        />
        <ChartTooltip
          content={<ChartTooltipContent />}
          formatter={(value) => [`₦${value}`, "Revenue"]}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="var(--color-revenue)"
          strokeWidth={3}
          dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
}
