'use client';

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts';

export function ProducesBarChart({
  data
}: Readonly<{
  data: {
    itemName: string;
    current: number;
    prev: number;
  }[];
}>) {
  const chartConfig = {
    current: {
      label: 'Current month',
      color: 'hsl(142.1 70.6% 45.3%)'
    },
    prev: {
      label: 'Prev month',
      color: 'hsl(215 20.2% 65.1%)'
    },
    label: {
      label: 'Prev month',
      color: 'hsl(var(--card))'
    }
  } satisfies ChartConfig;
  const chartData = data;
  const barSize = 60;
  const barGap = 10;
  const containerHeight = chartData.length * (barSize + barGap) + 40;
  console.log(chartData);
  return (
    <ChartContainer config={chartConfig} style={{ height: `${containerHeight}px`, width: '100%' }}>
      <BarChart
        accessibilityLayer
        data={chartData}
        barCategoryGap={barGap} // Space between categories
        maxBarSize={barSize}
        layout="vertical"
        margin={{
          left: 0,
          right: 100
        }}>
        <YAxis dataKey="itemName" type="category" width={100} axisLine={false} />
        <CartesianGrid vertical={true} />
        <XAxis accumulate="sum" type="number" hide />
        {/* <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} /> */}
        <Bar
          dataKey="current"
          layout="vertical"
          radius={5}
          fill="var(--color-current)"
          startOffset={10}>
          <LabelList
            dataKey="current"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={14}
          />
        </Bar>
        <Bar dataKey="prev" layout="vertical" radius={5} fill="var(--color-prev)">
          <LabelList
            dataKey="prev"
            position="right"
            offset={8}
            className="fill-foreground"
            fontSize={12}
          />
        </Bar>
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}
