import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BarChartWorkflows } from "@/components/charts/BarChartWorkflows";

export function Workflows() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: workflows } = await supabase
          .from('rd_workflows')
          .select('id, name');

        const { data: metrics } = await supabase
          .from('rd_workflow_metrics')
          .select('*')
          .order('snapshot_date', { ascending: false });

        if (workflows && metrics && metrics.length > 0) {
          const latestDate = metrics[0].snapshot_date;
          const latestMetrics = metrics.filter(m => m.snapshot_date === latestDate);

          const joinedData = latestMetrics.map(m => {
            const w = workflows.find(wf => wf.id === m.workflow_id);
            return {
              name: w ? w.name : m.workflow_id,
              sent: m.total_sent || 0,
              delivered: m.total_delivered || 0,
              opened: m.total_opened || 0,
              clicked: m.total_clicked || 0,
              open_rate: m.open_rate || 0,
              click_rate: m.click_rate || 0
            };
          }).sort((a, b) => b.sent - a.sent).slice(0, 10);

          setData(joinedData);
        }

      } catch (err) {
        console.error("Erro ao buscar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Workflows</h2>
        <p className="text-muted-foreground mt-2">Desempenho detalhado por automação (Top 10 por volume).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 10 Workflows por Volume de Envios</CardTitle>
        </CardHeader>
        <CardContent className="h-[500px]">
          <BarChartWorkflows data={data} />
        </CardContent>
      </Card>
    </div>
  );
}
