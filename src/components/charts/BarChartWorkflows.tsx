import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WorkflowRow {
  name: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export function BarChartWorkflows({ data, stacked = false }: { data: WorkflowRow[]; stacked?: boolean }) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados disponíveis</div>;
  }

  const truncate = (n: string) => (n.length > 38 ? `${n.slice(0, 36)}…` : n);
  const chartData = data.map((d) => ({ ...d, name: truncate(d.name) }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 24, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
        <YAxis
          dataKey="name"
          type="category"
          width={240}
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--secondary) / 0.3)' }}
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value) => Number(value).toLocaleString('pt-BR')}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="sent" name="Enviados" stackId={stacked ? 'a' : undefined} fill="#3b82f6" radius={stacked ? 0 : [0, 4, 4, 0]} barSize={stacked ? 20 : 14} />
        <Bar dataKey="delivered" name="Entregues" stackId={stacked ? 'a' : undefined} fill="#8b5cf6" radius={stacked ? 0 : [0, 4, 4, 0]} barSize={stacked ? 20 : 14} />
        <Bar dataKey="opened" name="Abertos" stackId={stacked ? 'a' : undefined} fill="#ec4899" radius={stacked ? 0 : [0, 4, 4, 0]} barSize={stacked ? 20 : 14} />
        <Bar dataKey="clicked" name="Clicados" stackId={stacked ? 'a' : undefined} fill="#10b981" radius={stacked ? [0, 4, 4, 0] : [0, 4, 4, 0]} barSize={stacked ? 20 : 14} />
      </BarChart>
    </ResponsiveContainer>
  );
}
