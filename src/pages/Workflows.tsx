import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2, Workflow as WorkflowIcon, Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BarChartWorkflows } from "@/components/charts/BarChartWorkflows";
import { fmtNumber, fmtPercent } from "@/lib/format";
import type { Workflow, WorkflowMetric } from "@/types";

interface Row {
  id: string;
  name: string;
  status: string | null;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
}

type SortKey = 'name' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'open_rate' | 'click_rate' | 'bounce_rate';

const statusVariant = (status: string | null): 'success' | 'secondary' | 'warning' => {
  if (!status) return 'secondary';
  const s = status.toLowerCase();
  if (s.includes('enabled') || s.includes('active') || s === 'true') return 'success';
  if (s.includes('paused')) return 'warning';
  return 'secondary';
};

export function Workflows() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('sent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: workflows }, { data: metrics }] = await Promise.all([
        supabase.from('rd_workflows').select('id, name, status'),
        supabase.from('rd_workflow_metrics').select('*').order('snapshot_date', { ascending: false }),
      ]);

      const wfs = (workflows || []) as Pick<Workflow, 'id' | 'name' | 'status'>[];
      const mets = (metrics || []) as WorkflowMetric[];

      if (mets.length === 0) {
        setRows([]);
        return;
      }

      const latestDate = mets[0].snapshot_date;
      const latest = mets.filter((m) => m.snapshot_date === latestDate);
      const wfMap = new Map(wfs.map(w => [w.id, w]));

      const joined: Row[] = latest.map((m) => {
        const w = wfMap.get(m.workflow_id);
        return {
          id: m.workflow_id,
          name: w?.name || m.workflow_id,
          status: w?.status || null,
          sent: m.total_sent || 0,
          delivered: m.total_delivered || 0,
          opened: m.total_opened || 0,
          clicked: m.total_clicked || 0,
          bounced: m.total_bounced || 0,
          unsubscribed: m.total_unsubscribed || 0,
          delivery_rate: m.delivery_rate || 0,
          open_rate: m.open_rate || 0,
          click_rate: m.click_rate || 0,
          bounce_rate: m.bounce_rate || 0,
        };
      });

      setRows(joined);
    } catch (err) {
      console.error("Erro ao buscar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? rows.filter(r => r.name.toLowerCase().includes(q)) : rows;
    return [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === 'string' && typeof bv === 'string') {
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
  }, [rows, search, sortKey, sortDir]);

  const top10 = useMemo(
    () => [...rows].sort((a, b) => b.sent - a.sent).slice(0, 10),
    [rows]
  );

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.sent += r.sent;
        acc.delivered += r.delivered;
        acc.opened += r.opened;
        acc.clicked += r.clicked;
        return acc;
      },
      { sent: 0, delivered: 0, opened: 0, clicked: 0 }
    );
  }, [rows]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-9 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Workflows</h2>
          <p className="text-muted-foreground mt-2">
            Desempenho por automação no snapshot mais recente. {rows.length} workflow{rows.length !== 1 ? 's' : ''} com dados.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={WorkflowIcon}
            title="Nenhum dado de workflows ainda"
            description="Aguarde a próxima execução do Workflow 1 (cron diário 06:00 BRT) para ver as métricas aqui."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Volume Total</p>
                <p className="text-2xl font-bold mt-1">{fmtNumber(summary.sent)}</p>
                <p className="text-xs text-muted-foreground mt-1">envios consolidados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Taxa de Abertura Média</p>
                <p className="text-2xl font-bold mt-1 text-pink-400">
                  {fmtPercent(summary.delivered ? (summary.opened / summary.delivered) * 100 : 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{fmtNumber(summary.opened)} aberturas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Taxa de Clique Média</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">
                  {fmtPercent(summary.delivered ? (summary.clicked / summary.delivered) * 100 : 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{fmtNumber(summary.clicked)} cliques</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Workflows com Dados</p>
                <p className="text-2xl font-bold mt-1">{rows.length}</p>
                <p className="text-xs text-muted-foreground mt-1">no último snapshot</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="chart">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="chart">Gráfico</TabsTrigger>
                <TabsTrigger value="comparison">Comparativo</TabsTrigger>
                <TabsTrigger value="table">Tabela</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="chart">
              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Workflows por Volume</CardTitle>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <BarChartWorkflows
                    data={top10.map(r => ({
                      name: r.name,
                      sent: r.sent,
                      delivered: r.delivered,
                      opened: r.opened,
                      clicked: r.clicked,
                    }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Comparativo Funil — Top 10</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Visão lado-a-lado: enviados, entregues, abertos e clicados</p>
                </CardHeader>
                <CardContent className="h-[500px]">
                  <BarChartWorkflows
                    stacked
                    data={top10.map(r => ({
                      name: r.name,
                      sent: r.sent,
                      delivered: r.delivered,
                      opened: r.opened,
                      clicked: r.clicked,
                    }))}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="table">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle>Todos os Workflows</CardTitle>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar workflow..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead className="[&_tr]:border-b">
                        <tr className="border-b text-muted-foreground">
                          <Th onClick={() => toggleSort('name')} active={sortKey === 'name'} className="text-left">Workflow</Th>
                          <Th className="text-center w-24">Status</Th>
                          <Th onClick={() => toggleSort('sent')} active={sortKey === 'sent'} className="text-right">Envios</Th>
                          <Th onClick={() => toggleSort('delivered')} active={sortKey === 'delivered'} className="text-right">Entregues</Th>
                          <Th onClick={() => toggleSort('opened')} active={sortKey === 'opened'} className="text-right">Abertos</Th>
                          <Th onClick={() => toggleSort('clicked')} active={sortKey === 'clicked'} className="text-right">Cliques</Th>
                          <Th onClick={() => toggleSort('open_rate')} active={sortKey === 'open_rate'} className="text-right">Tx Abertura</Th>
                          <Th onClick={() => toggleSort('click_rate')} active={sortKey === 'click_rate'} className="text-right">Tx Clique</Th>
                          <Th onClick={() => toggleSort('bounce_rate')} active={sortKey === 'bounce_rate'} className="text-right">Bounce</Th>
                        </tr>
                      </thead>
                      <tbody className="[&_tr:last-child]:border-0">
                        {filtered.map((r) => (
                          <tr key={r.id} className="border-b transition-colors hover:bg-secondary/40">
                            <td className="p-3 align-middle font-medium max-w-xs truncate" title={r.name}>{r.name}</td>
                            <td className="p-3 align-middle text-center">
                              <Badge variant={statusVariant(r.status)} className="text-[10px]">
                                {r.status || '—'}
                              </Badge>
                            </td>
                            <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.sent)}</td>
                            <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.delivered)}</td>
                            <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.opened)}</td>
                            <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.clicked)}</td>
                            <td className="p-3 align-middle text-right tabular-nums text-pink-400">{fmtPercent(r.open_rate)}</td>
                            <td className="p-3 align-middle text-right tabular-nums text-emerald-400">{fmtPercent(r.click_rate)}</td>
                            <td className="p-3 align-middle text-right tabular-nums text-amber-400">{fmtPercent(r.bounce_rate)}</td>
                          </tr>
                        ))}
                        {filtered.length === 0 && (
                          <tr>
                            <td colSpan={9} className="py-12">
                              <div className="flex flex-col items-center justify-center text-center text-muted-foreground">
                                <Loader2 className="h-5 w-5 mb-2 opacity-40" />
                                <p className="text-sm">Nenhum workflow corresponde ao filtro.</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function Th({ children, className, onClick, active }: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <th className={`h-10 px-3 align-middle font-medium text-xs uppercase tracking-wide ${className || ''}`}>
      {onClick ? (
        <button
          onClick={onClick}
          className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${active ? 'text-foreground' : ''}`}
        >
          {children}
          <ArrowUpDown className="h-3 w-3" />
        </button>
      ) : (
        children
      )}
    </th>
  );
}
