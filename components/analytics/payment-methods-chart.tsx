"use client";

import { PieChart, Pie, Cell } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

interface PaymentMethodsChartProps {
	data: Array<{
		method: string;
		count: number;
		revenue: number;
	}>;
}

const chartConfig = {
	Cash: {
		label: "Cash",
		color: "#5c705d",
	},
	Card: {
		label: "Card",
		color: "#768b76",
	},
	Digital: {
		label: "Digital",
		color: "#9bad9b",
	},
} satisfies ChartConfig;

const COLORS = [
	"var(--color-brand-main-400)",
	"var(--color-brand-main-500)",
	"var(--color-brand-main-700)",
	"var(--color-brand-main-600)",
];

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
	return (
		<ChartContainer config={chartConfig}>
			<PieChart>
				<Pie
					data={data}
					cx='50%'
					cy='50%'
					labelLine={false}
					outerRadius={130}
					fill='#8884d8'
					dataKey='count'
					label={({ method, percent }) =>
						`${method} ${(percent * 100).toFixed(0)}%`
					}>
					{data.map((entry, index) => (
						<Cell
							key={`cell-${index}`}
							fill={COLORS[index % COLORS.length]}
						/>
					))}
				</Pie>
				<ChartTooltip content={<ChartTooltipContent />} />
			</PieChart>
		</ChartContainer>
	);
}
