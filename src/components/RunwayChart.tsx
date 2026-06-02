import { ProjectedMonth } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { formatCurrency } from '@/utils/currency';
import type { SupportedCurrency } from '@/types';

interface RunwayChartProps {
  data: ProjectedMonth[];
  currency?: SupportedCurrency;
}

interface TooltipPayload {
  value: number;
  payload: ProjectedMonth;
}

export function RunwayChart({ data, currency = 'PHP' }: RunwayChartProps) {
  const minBalance = Math.min(...data.map((d) => d.balance));
  const isHealthy = minBalance >= 0;

  const formatAxisValue = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`;
    return value.toString();
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) => {
    if (!active || !payload?.length) return null;
    const item = payload[0].payload as ProjectedMonth;
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="text-muted-foreground mb-1">{item.date}</p>
        <p className="font-bold text-lg">{formatCurrency(item.balance, currency)}</p>
        <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
      </div>
    );
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Add income, expenses, and cash to see your runway projection.
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="dangerGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
          />
          <YAxis
            tickFormatter={formatAxisValue}
            tick={{ fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            className="text-muted-foreground"
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          {!isHealthy && (
            <ReferenceLine y={0} stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
          )}
          <Area
            type="monotone"
            dataKey="balance"
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            fill={isHealthy ? 'url(#runwayGradient)' : 'url(#dangerGradient)'}
            animationDuration={800}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}