import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { safeRate } from '@/lib/format';

interface FunnelProps {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export function FunnelChartMetrics({ sent, delivered, opened, clicked }: FunnelProps) {
  const data = [
    { name: 'Enviados', value: sent || 0, color: '#3b82f6', rate: 100 },
    { name: 'Entregues', value: delivered || 0, color: '#8b5cf6', rate: safeRate(delivered || 0, sent || 0) },
    { name: 'Abertos', value: opened || 0, color: '#ec4899', rate: safeRate(opened || 0, sent || 0) },
    { name: 'Clicados', value: clicked || 0, color: '#10b981', rate: safeRate(clicked || 0, sent || 0) },
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 60, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" hide />
        <YAxis
          dataKey="name"
          type="category"
          axisLine={false}
          tickLine={false}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
          width={80}
        />
        <Tooltip
          cursor={{ fill: 'hsl(var(--secondary) / 0.3)' }}
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value, _name, item) => {
            const v = Number(value);
            const rate = (item?.payload?.rate ?? 0) as number;
            return [`${v.toLocaleString('pt-BR')} (${rate.toFixed(1)}%)`, 'Total'];
          }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={36}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            fill="hsl(var(--foreground))"
            fontSize={12}
            formatter={(v) => Number(v).toLocaleString('pt-BR')}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
