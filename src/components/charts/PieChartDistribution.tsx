import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface Slice {
  name: string;
  value: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#f43f5e', '#84cc16'];

export function PieChartDistribution({ data }: { data: Slice[] }) {
  if (!data || data.length === 0 || data.every((d) => d.value === 0)) {
    return <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Sem dados disponíveis</div>;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          stroke="hsl(var(--card))"
          strokeWidth={2}
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
          itemStyle={{ color: 'hsl(var(--foreground))' }}
          formatter={(value) => {
            const v = Number(value);
            return [`${v.toLocaleString('pt-BR')} (${((v / total) * 100).toFixed(1)}%)`, 'Total'];
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
