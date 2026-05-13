import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/ui/kpi-card";
import {
  Mail, Send, Activity, MousePointerClick, AlertTriangle, UserMinus,
  Workflow, Target, RefreshCw, Trophy, ChevronRight, CheckCircle2, XCircle, Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FunnelChartMetrics } from "@/components/charts/FunnelChart";
import { LineChartMetrics } from "@/components/charts/LineChartMetrics";
import { AreaChartVolume } from "@/components/charts/AreaChartVolume";
import { fmtNumber, fmtPercent, fmtRelative, safeRate, trendDelta } from "@/lib/format";
import type { Workflow as WorkflowRow, WorkflowMetric, SyncLog } from "@/types";
import { Link } from "react-router-dom";

interface OverviewData {
  totals: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    bounced: number;
    unsubscribed: number;
  };
  rates: {
    delivery: number;
    open: number;
    click: number;
    bounce: number;
    unsubscribe: number;
    ctor: number;
  };
  trend: {
    open: ReturnType<typeof trendDelta>;
    click: ReturnType<typeof trendDelta>;
    sent: ReturnType<typeof trendDelta>;
    delivery: ReturnType<typeof trendDelta>;
  };
  workflows: {
    total: number;
    active: number;
    withMetrics: number;
  };
  topWorkflows: Array<{ id: string; name: string; sent: number; openRate: number }>;
  lastSync: SyncLog | null;
  rawMetrics: WorkflowMetric[];
}

export function Overview() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<OverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setError(null);
    try {
      const [metricsRes, workflowsRes, syncRes] = await Promise.all([
        supabase.from('rd_workflow_metrics').select('*').order('snapshot_date', { ascending: false }),
        supabase.from('rd_workflows').select('id, name, status'),
        supabase.from('rd_sync_log').select('*').order('created_at', { ascending: false }).limit(1),
      ]);

      const metrics = (metricsRes.data || []) as WorkflowMetric[];
      const workflows = (workflowsRes.data || []) as Pick<WorkflowRow, 'id' | 'name' | 'status'>[];
      const lastSync = syncRes.data?.[0] as SyncLog | undefined;

      const acc = { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0, unsubscribed: 0 };
      const prevAcc = { sent: 0, delivered: 0, opened: 0, clicked: 0 };
      const workflowAgg = new Map<string, { sent: number; opened: number; delivered: number }>();

      let latestDate: string | null = null;
      let previousDate: string | null = null;

      if (metrics.length > 0) {
        latestDate = metrics[0].snapshot_date;
        const uniqueDates = Array.from(new Set(metrics.map(m => m.snapshot_date))).sort().reverse();
        previousDate = uniqueDates[1] || null;

        metrics.forEach((m) => {
          if (m.snapshot_date === latestDate) {
            acc.sent += m.total_sent || 0;
            acc.delivered += m.total_delivered || 0;
            acc.opened += m.total_opened || 0;
            acc.clicked += m.total_clicked || 0;
            acc.bounced += m.total_bounced || 0;
            acc.unsubscribed += m.total_unsubscribed || 0;

            const cur = workflowAgg.get(m.workflow_id) || { sent: 0, opened: 0, delivered: 0 };
            cur.sent += m.total_sent || 0;
            cur.opened += m.total_opened || 0;
            cur.delivered += m.total_delivered || 0;
            workflowAgg.set(m.workflow_id, cur);
          } else if (m.snapshot_date === previousDate) {
            prevAcc.sent += m.total_sent || 0;
            prevAcc.delivered += m.total_delivered || 0;
            prevAcc.opened += m.total_opened || 0;
            prevAcc.clicked += m.total_clicked || 0;
          }
        });
      }

      const nameById = new Map(workflows.map(w => [w.id, w.name]));
      const topWorkflows = Array.from(workflowAgg.entries())
        .map(([id, v]) => ({
          id,
          name: nameById.get(id) || id,
          sent: v.sent,
          openRate: safeRate(v.opened, v.delivered),
        }))
        .filter(w => w.sent > 0)
        .sort((a, b) => b.sent - a.sent)
        .slice(0, 5);

      const rates = {
        delivery: safeRate(acc.delivered, acc.sent),
        open: safeRate(acc.opened, acc.delivered),
        click: safeRate(acc.clicked, acc.delivered),
        bounce: safeRate(acc.bounced, acc.sent),
        unsubscribe: safeRate(acc.unsubscribed, acc.delivered),
        ctor: safeRate(acc.clicked, acc.opened),
      };

      const prevRates = {
        open: safeRate(prevAcc.opened, prevAcc.delivered),
        click: safeRate(prevAcc.clicked, prevAcc.delivered),
        delivery: safeRate(prevAcc.delivered, prevAcc.sent),
      };

      const activeCount = workflows.filter(w =>
        (w.status || '').toLowerCase().includes('enabled') ||
        (w.status || '').toLowerCase().includes('active') ||
        (w.status || '').toLowerCase() === 'true'
      ).length;

      setData({
        totals: acc,
        rates,
        trend: {
          open: trendDelta(rates.open, prevRates.open),
          click: trendDelta(rates.click, prevRates.click),
          sent: trendDelta(acc.sent, prevAcc.sent),
          delivery: trendDelta(rates.delivery, prevRates.delivery),
        },
        workflows: {
          total: workflows.length,
          active: activeCount,
          withMetrics: workflowAgg.size,
        },
        topWorkflows,
        lastSync: lastSync || null,
        rawMetrics: metrics,
      });
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-7">
          <Skeleton className="h-[380px] lg:col-span-4" />
          <Skeleton className="h-[380px] lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
          <h3 className="font-semibold">Falha ao carregar dados</h3>
          <p className="text-sm text-muted-foreground mt-1">{error || 'Tente recarregar a página.'}</p>
          <Button onClick={handleRefresh} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4" /> Tentar novamente
          </Button>
        </CardContent>
      </Card>
    );
  }

  const syncStatusVariant =
    data.lastSync?.status === 'success' ? 'success' :
    data.lastSync?.status === 'error' ? 'destructive' :
    data.lastSync?.status === 'running' ? 'info' : 'secondary';

  const SyncIcon = data.lastSync?.status === 'success' ? CheckCircle2
    : data.lastSync?.status === 'error' ? XCircle
    : Clock;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Visão Geral</h2>
          <p className="text-muted-foreground mt-2">
            Métricas agregadas das automações RD Station — últimos 30 dias.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.lastSync && (
            <Badge variant={syncStatusVariant} className="gap-1.5">
              <SyncIcon className="h-3 w-3" />
              Última sync: {fmtRelative(data.lastSync.created_at)}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            Atualizar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total de Envios"
          value={fmtNumber(data.totals.sent)}
          icon={Send}
          accent="blue"
          trend={data.trend.sent.value > 0 ? data.trend.sent : null}
          trendLabel={data.trend.sent.value > 0 ? "vs. snapshot anterior" : undefined}
          hint={data.trend.sent.value === 0 ? "sem comparativo histórico" : undefined}
        />
        <KpiCard
          title="Taxa de Entrega"
          value={fmtPercent(data.rates.delivery)}
          icon={Mail}
          accent="violet"
          trend={data.trend.delivery.value > 0 ? data.trend.delivery : null}
          hint={`${fmtNumber(data.totals.delivered)} entregues`}
        />
        <KpiCard
          title="Taxa de Abertura"
          value={fmtPercent(data.rates.open)}
          icon={Activity}
          accent="pink"
          trend={data.trend.open.value > 0 ? data.trend.open : null}
          hint={`${fmtNumber(data.totals.opened)} aberturas`}
        />
        <KpiCard
          title="Taxa de Clique"
          value={fmtPercent(data.rates.click)}
          icon={MousePointerClick}
          accent="emerald"
          trend={data.trend.click.value > 0 ? data.trend.click : null}
          hint={`${fmtNumber(data.totals.clicked)} cliques`}
        />
        <KpiCard
          title="CTOR"
          value={fmtPercent(data.rates.ctor)}
          icon={Target}
          accent="sky"
          hint="cliques / aberturas"
        />
        <KpiCard
          title="Taxa de Bounce"
          value={fmtPercent(data.rates.bounce)}
          icon={AlertTriangle}
          accent="amber"
          hint={`${fmtNumber(data.totals.bounced)} bounces`}
        />
        <KpiCard
          title="Descadastros"
          value={fmtPercent(data.rates.unsubscribe)}
          icon={UserMinus}
          accent="rose"
          hint={`${fmtNumber(data.totals.unsubscribed)} unsubscribes`}
        />
        <KpiCard
          title="Workflows Ativos"
          value={`${data.workflows.active}/${data.workflows.total}`}
          icon={Workflow}
          accent="violet"
          hint={`${data.workflows.withMetrics} com dados`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Evolução das Taxas</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Aberturas, cliques e bounces por snapshot</p>
          </CardHeader>
          <CardContent className="h-[340px]">
            <LineChartMetrics data={data.rawMetrics} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Funil de Conversão</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Do envio ao clique</p>
          </CardHeader>
          <CardContent className="h-[340px]">
            <FunnelChartMetrics
              sent={data.totals.sent}
              delivered={data.totals.delivered}
              opened={data.totals.opened}
              clicked={data.totals.clicked}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Volume Diário</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Enviados, abertos e clicados ao longo do tempo</p>
          </CardHeader>
          <CardContent className="h-[300px]">
            <AreaChartVolume data={data.rawMetrics} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-amber-400" />
                Top 5 Workflows
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Por volume de envios</p>
            </div>
            <Link to="/workflows" className="text-xs text-primary hover:underline inline-flex items-center">
              Ver todos <ChevronRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {data.topWorkflows.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhum workflow com dados no último snapshot.</p>
            ) : (
              <ul className="space-y-3">
                {data.topWorkflows.map((w, i) => (
                  <li key={w.id} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" title={w.name}>{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {fmtNumber(w.sent)} envios · {fmtPercent(w.openRate)} abertura
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
