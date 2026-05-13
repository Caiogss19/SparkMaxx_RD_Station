import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { WorkflowMetric } from '@/types';

export function AreaChartVolume({ data }: { data: WorkflowMetric[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados disponíveis</div>;
  }

  type Acc = Record<string, { date: string; sent: number; delivered: number; opened: number; clicked: number }>;

  const grouped = data.reduce<Acc>((acc, curr) => {
    const date = curr.snapshot_date;
    if (!acc[date]) acc[date] = { date, sent: 0, delivered: 0, opened: 0, clicked: 0 };
    acc[date].sent += curr.total_sent || 0;
    acc[date].delivered += curr.total_delivered || 0;
    acc[date].opened += curr.total_opened || 0;
    acc[date].clicked += curr.total_clicked || 0;
    return acc;
  }, {});

  const chartData = Object.values(grouped)
    .map((item) => ({
      ...item,
      label: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      _sortKey: new Date(item.date).getTime(),
    }))
    .sort((a, b) => a._sortKey - b._sortKey);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
        <defs>
          <linearGradient id="sentG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="openedG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ec4899" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="clickedG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value) => Number(value).toLocaleString('pt-BR')}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" name="Enviados" dataKey="sent" stroke="#3b82f6" fill="url(#sentG)" strokeWidth={2} />
        <Area type="monotone" name="Abertos" dataKey="opened" stroke="#ec4899" fill="url(#openedG)" strokeWidth={2} />
        <Area type="monotone" name="Clicados" dataKey="clicked" stroke="#10b981" fill="url(#clickedG)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
