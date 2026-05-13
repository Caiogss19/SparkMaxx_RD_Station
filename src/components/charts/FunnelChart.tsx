import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FunnelProps {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
}

export function FunnelChartMetrics({ sent, delivered, opened, clicked }: FunnelProps) {
  const data = [
    { name: 'Enviados', value: sent || 0, color: '#3b82f6' },     // blue-500
    { name: 'Entregues', value: delivered || 0, color: '#8b5cf6' }, // violet-500
    { name: 'Abertos', value: opened || 0, color: '#ec4899' },    // pink-500
    { name: 'Clicados', value: clicked || 0, color: '#10b981' },    // emerald-500
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))' }} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Total']}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
