import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function BarChartWorkflows({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Sem dados disponíveis</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
        <XAxis type="number" hide />
        <YAxis dataKey="name" type="category" width={200} axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value: any) => [value.toLocaleString('pt-BR'), 'Envios']}
        />
        <Bar dataKey="sent" radius={[0, 4, 4, 0]} barSize={20} fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  );
}
