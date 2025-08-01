"use client";

import {
  BarChart as BarChartPrimitive,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@workspace/ui/components/chart";

interface ChartData {
  [key: string]: string | number;
}

interface BarChartProps {
  data: ChartData[];
  xAxisKey: string;
  yAxisKey: string;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  xAxisKey,
  yAxisKey,
  className,
}) => {
  return (
    <ChartContainer className={className} config={{}}>
      <ResponsiveContainer width="100%" height={350}>
        <BarChartPrimitive data={data}>
          <XAxis
            dataKey={xAxisKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value: number) => `${value}`}
          />
          <Bar
            dataKey={yAxisKey}
            fill="currentColor"
            radius={[4, 4, 0, 0]}
            className="fill-primary"
          />
          <Tooltip content={<CustomTooltip />} />
        </BarChartPrimitive>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

interface CustomTooltipProps extends TooltipProps<number, string> {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: ChartData;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <ChartTooltipContent
      active={active}
      formatter={(value) => `${value} bookings`}
    >
      <p className="font-semibold">{label}</p>
      <p className="text-sm text-muted-foreground">
        {payload[0]?.value} bookings
      </p>
    </ChartTooltipContent>
  );
};

export { BarChart };
