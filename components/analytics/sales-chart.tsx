"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

interface SalesChartProps {
	data: Array<{
		date: string;
		sales: number;
		revenue: number;
	}>;
}

const chartConfig = {
	sales: {
		label: "Sales",
		color: "#5c705d",
	},
	revenue: {
		label: "Revenue",
		color: "#9bad9b",
	},
} satisfies ChartConfig;

export function SalesChart({ data }: SalesChartProps) {
	return (
		<ChartContainer config={chartConfig}>
			<BarChart data={data}>
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
				/>
				<ChartTooltip content={<ChartTooltipContent />} />
				<Bar
					dataKey='sales'
					fill='var(--color-brand-main-600)'
					radius={[4, 4, 0, 0]}
				/>
			</BarChart>
		</ChartContainer>
	);
}
