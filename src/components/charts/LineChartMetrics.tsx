import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WorkflowMetric } from '@/types';

interface Props {
  data: WorkflowMetric[];
}

export function LineChartMetrics({ data }: Props) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados disponíveis</div>;
  }

  type Acc = Record<string, { date: string; open_rate: number; click_rate: number; bounce_rate: number; count: number }>;

  const grouped = data.reduce<Acc>((acc, curr) => {
    const date = curr.snapshot_date;
    if (!acc[date]) {
      acc[date] = { date, open_rate: 0, click_rate: 0, bounce_rate: 0, count: 0 };
    }
    acc[date].open_rate += curr.open_rate || 0;
    acc[date].click_rate += curr.click_rate || 0;
    acc[date].bounce_rate += curr.bounce_rate || 0;
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(grouped)
    .map((item) => ({
      date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      open_rate: parseFloat((item.open_rate / item.count).toFixed(2)),
      click_rate: parseFloat((item.click_rate / item.count).toFixed(2)),
      bounce_rate: parseFloat((item.bounce_rate / item.count).toFixed(2)),
      _sortKey: new Date(item.date).getTime(),
    }))
    .sort((a, b) => a._sortKey - b._sortKey);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} unit="%" />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value) => `${Number(value).toFixed(2)}%`}
        />
        <Legend wrapperStyle={{ paddingTop: '20px', fontSize: 12 }} />
        <Line type="monotone" name="Taxa de Abertura" dataKey="open_rate" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" name="Taxa de Clique" dataKey="click_rate" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
        <Line type="monotone" name="Taxa de Bounce" dataKey="bounce_rate" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
