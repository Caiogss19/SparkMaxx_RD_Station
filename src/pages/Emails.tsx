import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "@/components/ui/kpi-card";
import { Mail, Search, ArrowUpDown, RefreshCw, Send, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PieChartDistribution } from "@/components/charts/PieChartDistribution";
import { fmtNumber, fmtPercent, fmtDate } from "@/lib/format";
import type { Email, EmailMetric } from "@/types";

interface Row {
  id: string;
  name: string;
  type: string | null;
  status: string | null;
  send_at: string | null;
  sent: number;
  delivered: number;
  opened: number;
  unique_opens: number;
  clicked: number;
  unique_clicks: number;
  bounced: number;
  unsubscribed: number;
  open_rate: number;
  click_rate: number;
  ctor: number;
  bounce_rate: number;
}

type SortKey = 'name' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'open_rate' | 'click_rate' | 'bounce_rate' | 'ctor';

export function Emails() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>('sent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  async function loadData() {
    setLoading(true);
    try {
      const [{ data: emails }, { data: metrics }] = await Promise.all([
        supabase.from('rd_emails').select('*'),
        supabase.from('rd_email_metrics').select('*').order('snapshot_date', { ascending: false }),
      ]);

      const emailList = (emails || []) as Email[];
      const metricList = (metrics || []) as EmailMetric[];

      if (metricList.length === 0) {
        setRows([]);
        return;
      }

      const latestDate = metricList[0].snapshot_date;
      const latest = metricList.filter((m) => m.snapshot_date === latestDate);
      const emailMap = new Map(emailList.map(e => [e.id, e]));

      const joined: Row[] = latest.map((m) => {
        const e = emailMap.get(m.email_id);
        return {
          id: m.email_id,
          name: e?.name || `Email ${m.email_id}`,
          type: e?.type || null,
          status: e?.status || null,
          send_at: e?.send_at || null,
          sent: m.sent || 0,
          delivered: m.delivered || 0,
          opened: m.opened || 0,
          unique_opens: m.unique_opens || 0,
          clicked: m.clicked || 0,
          unique_clicks: m.unique_clicks || 0,
          bounced: m.bounced || 0,
          unsubscribed: m.unsubscribed || 0,
          open_rate: m.open_rate || 0,
          click_rate: m.click_rate || 0,
          ctor: m.ctor || 0,
          bounce_rate: m.bounce_rate || 0,
        };
      });

      setRows(joined);
    } catch (err) {
      console.error("Erro ao buscar dados de e-mails:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const summary = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.sent += r.sent;
        acc.delivered += r.delivered;
        acc.opened += r.opened;
        acc.clicked += r.clicked;
        acc.bounced += r.bounced;
        return acc;
      },
      { sent: 0, delivered: 0, opened: 0, clicked: 0, bounced: 0 }
    );
  }, [rows]);

  const typeDistribution = useMemo(() => {
    const map = new Map<string, number>();
    rows.forEach(r => {
      const k = r.type || 'Sem tipo';
      map.set(k, (map.get(k) || 0) + r.sent);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).filter(d => d.value > 0);
  }, [rows]);

  const best = useMemo(
    () => [...rows].filter(r => r.delivered >= 10).sort((a, b) => b.open_rate - a.open_rate).slice(0, 20),
    [rows]
  );

  const worst = useMemo(
    () => [...rows].filter(r => r.delivered >= 10).sort((a, b) => a.open_rate - b.open_rate).slice(0, 20),
    [rows]
  );

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

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
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
        <Skeleton className="h-[400px]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">E-mails</h2>
          <p className="text-muted-foreground mt-2">
            Análise detalhada por e-mail. {rows.length} e-mail{rows.length !== 1 ? 's' : ''} no snapshot mais recente.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={Mail}
            title="Sem dados de e-mails ainda"
            description="Workflow 2 ainda não rodou com sucesso. Os dados aparecerão aqui após a próxima execução (cron diário 06:15 BRT)."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <KpiCard title="Envios" value={fmtNumber(summary.sent)} icon={Send} accent="blue" hint={`${rows.length} e-mails`} />
            <KpiCard
              title="Abertura Média"
              value={fmtPercent(summary.delivered ? (summary.opened / summary.delivered) * 100 : 0)}
              icon={TrendingUp}
              accent="pink"
              hint={`${fmtNumber(summary.opened)} aberturas`}
            />
            <KpiCard
              title="Clique Médio"
              value={fmtPercent(summary.delivered ? (summary.clicked / summary.delivered) * 100 : 0)}
              icon={TrendingUp}
              accent="emerald"
              hint={`${fmtNumber(summary.clicked)} cliques`}
            />
            <KpiCard
              title="Bounce"
              value={fmtPercent(summary.sent ? (summary.bounced / summary.sent) * 100 : 0)}
              icon={AlertTriangle}
              accent="amber"
              hint={`${fmtNumber(summary.bounced)} bounces`}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-rose-400" /> Piores E-mails
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Menor taxa de abertura (mín. 10 entregues)</p>
              </CardHeader>
              <CardContent>
                <RankList rows={worst} negative />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Por volume de envios</p>
              </CardHeader>
              <CardContent className="h-[300px]">
                <PieChartDistribution data={typeDistribution} />
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="best">Melhores</TabsTrigger>
              <TabsTrigger value="worst">Piores</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <CardTitle>Todos os E-mails</CardTitle>
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Buscar e-mail..."
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <EmailsTable rows={filtered} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="best">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" /> Melhores E-mails
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Maior taxa de abertura (mín. 10 entregues)</p>
                </CardHeader>
                <CardContent>
                  <EmailsTable rows={best} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="worst">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-rose-400" /> Piores E-mails
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Atenção: revise copy, segmentação e timing</p>
                </CardHeader>
                <CardContent>
                  <EmailsTable rows={worst} sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}

function RankList({ rows, negative }: { rows: Row[]; negative?: boolean }) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">Sem e-mails suficientes para ranquear.</p>;
  }
  return (
    <ul className="space-y-2.5">
      {rows.slice(0, 8).map((r, i) => (
        <li key={r.id} className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-secondary text-xs font-semibold text-muted-foreground">
            {i + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" title={r.name}>{r.name}</p>
            <p className="text-xs text-muted-foreground">
              {fmtNumber(r.sent)} envios · {fmtNumber(r.opened)} aberturas
            </p>
          </div>
          <span className={`text-sm font-semibold tabular-nums ${negative ? 'text-rose-400' : 'text-emerald-400'}`}>
            {fmtPercent(r.open_rate)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function EmailsTable({
  rows,
  sortKey,
  onSort,
}: {
  rows: Row[];
  sortKey: SortKey;
  sortDir: 'asc' | 'desc';
  onSort: (k: SortKey) => void;
}) {
  return (
    <div className="relative w-full overflow-auto">
      <table className="w-full caption-bottom text-sm">
        <thead>
          <tr className="border-b text-muted-foreground">
            <Th onClick={() => onSort('name')} active={sortKey === 'name'} className="text-left">E-mail</Th>
            <Th className="text-center">Tipo</Th>
            <Th className="text-center">Enviado em</Th>
            <Th onClick={() => onSort('sent')} active={sortKey === 'sent'} className="text-right">Envios</Th>
            <Th onClick={() => onSort('delivered')} active={sortKey === 'delivered'} className="text-right">Entregues</Th>
            <Th onClick={() => onSort('opened')} active={sortKey === 'opened'} className="text-right">Abertos</Th>
            <Th onClick={() => onSort('clicked')} active={sortKey === 'clicked'} className="text-right">Cliques</Th>
            <Th onClick={() => onSort('open_rate')} active={sortKey === 'open_rate'} className="text-right">Tx Ab.</Th>
            <Th onClick={() => onSort('click_rate')} active={sortKey === 'click_rate'} className="text-right">Tx Cl.</Th>
            <Th onClick={() => onSort('ctor')} active={sortKey === 'ctor'} className="text-right">CTOR</Th>
            <Th onClick={() => onSort('bounce_rate')} active={sortKey === 'bounce_rate'} className="text-right">Bounce</Th>
          </tr>
        </thead>
        <tbody className="[&_tr:last-child]:border-0">
          {rows.map((r) => (
            <tr key={r.id} className="border-b transition-colors hover:bg-secondary/40">
              <td className="p-3 align-middle font-medium max-w-xs truncate" title={r.name}>{r.name}</td>
              <td className="p-3 align-middle text-center">
                {r.type ? <Badge variant="secondary" className="text-[10px]">{r.type}</Badge> : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="p-3 align-middle text-center text-muted-foreground text-xs">{fmtDate(r.send_at)}</td>
              <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.sent)}</td>
              <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.delivered)}</td>
              <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.opened)}</td>
              <td className="p-3 align-middle text-right tabular-nums">{fmtNumber(r.clicked)}</td>
              <td className="p-3 align-middle text-right tabular-nums text-pink-400">{fmtPercent(r.open_rate)}</td>
              <td className="p-3 align-middle text-right tabular-nums text-emerald-400">{fmtPercent(r.click_rate)}</td>
              <td className="p-3 align-middle text-right tabular-nums text-sky-400">{fmtPercent(r.ctor)}</td>
              <td className="p-3 align-middle text-right tabular-nums text-amber-400">{fmtPercent(r.bounce_rate)}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={11} className="py-12 text-center text-sm text-muted-foreground">
                Nenhum e-mail corresponde ao filtro.
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
