"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/utils";

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
		color: "var(--color-brand-main-600)",
	},
} satisfies ChartConfig;

export function RevenueChart({ data }: RevenueChartProps) {
	return (
		<ChartContainer config={chartConfig}>
			<LineChart data={data}>
				<CartesianGrid strokeDasharray='3 3' />
				<XAxis
					dataKey='date'
					tickLine={false}
					axisLine={false}
					className='text-brand-main-600'
				/>
				<YAxis
					tickLine={false}
					axisLine={false}
					className='text-brand-main-600'
					tickFormatter={(value) => `₦${formatCurrency(value)}`}
				/>
				<ChartTooltip
					content={<ChartTooltipContent />}
					formatter={(value) => [
						`₦${formatCurrency(Number(value))}`,
						"Revenue",
					]}
				/>
				<Line
					type='monotone'
					dataKey='revenue'
					stroke='var(--color-revenue)'
					strokeWidth={2}
					dot={{ fill: "var(--color-revenue)", strokeWidth: 2, r: 4 }}
				/>
			</LineChart>
		</ChartContainer>
	);
}
