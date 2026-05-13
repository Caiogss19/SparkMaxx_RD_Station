import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Send, Activity, MousePointerClick, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FunnelChartMetrics } from "@/components/charts/FunnelChart";
import { LineChartMetrics } from "@/components/charts/LineChartMetrics";

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: metrics } = await supabase
          .from('rd_workflow_metrics')
          .select('*')
          .order('snapshot_date', { ascending: false });

        let totalSent = 0;
        let totalDelivered = 0;
        let totalOpened = 0;
        let totalClicked = 0;

        if (metrics && metrics.length > 0) {
          const latestDate = metrics[0].snapshot_date;
          const latestMetrics = metrics.filter(m => m.snapshot_date === latestDate);

          latestMetrics.forEach(m => {
            totalSent += m.total_sent || 0;
            totalDelivered += m.total_delivered || 0;
            totalOpened += m.total_opened || 0;
            totalClicked += m.total_clicked || 0;
          });
        }

        setData({
          totalSent,
          totalDelivered,
          totalOpened,
          totalClicked,
          deliveryRate: totalSent ? ((totalDelivered / totalSent) * 100).toFixed(1) : 0,
          openRate: totalDelivered ? ((totalOpened / totalDelivered) * 100).toFixed(1) : 0,
          clickRate: totalOpened ? ((totalClicked / totalOpened) * 100).toFixed(1) : 0,
          rawMetrics: metrics || []
        });

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
        <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
        <p className="text-muted-foreground mt-2">Métricas agregadas das automações RD Station.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Envios</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.totalSent.toLocaleString('pt-BR')}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">{data?.totalDelivered.toLocaleString('pt-BR')} entregues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Abertura</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.openRate}%</div>
            <p className="text-xs text-muted-foreground">{data?.totalOpened.toLocaleString('pt-BR')} aberturas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Clique</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.clickRate}%</div>
            <p className="text-xs text-muted-foreground">{data?.totalClicked.toLocaleString('pt-BR')} cliques</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Evolução de Aberturas e Cliques</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <LineChartMetrics data={data?.rawMetrics} />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <FunnelChartMetrics 
              sent={data?.totalSent} 
              delivered={data?.totalDelivered} 
              opened={data?.totalOpened} 
              clicked={data?.totalClicked} 
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
