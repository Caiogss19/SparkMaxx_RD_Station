import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function LineChartMetrics({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return <div className="flex h-full items-center justify-center text-muted-foreground">Sem dados disponíveis</div>;
  }

  // Agrupar dados por snapshot_date
  const groupedData = data.reduce((acc, curr) => {
    const date = curr.snapshot_date;
    if (!acc[date]) {
      acc[date] = { date, open_rate: 0, click_rate: 0, count: 0 };
    }
    acc[date].open_rate += curr.open_rate || 0;
    acc[date].click_rate += curr.click_rate || 0;
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.values(groupedData).map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
    open_rate: parseFloat((item.open_rate / item.count).toFixed(2)),
    click_rate: parseFloat((item.click_rate / item.count).toFixed(2))
  })).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
        <Tooltip 
          contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line type="monotone" name="Taxa de Abertura (%)" dataKey="open_rate" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
        <Line type="monotone" name="Taxa de Clique (%)" dataKey="click_rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
