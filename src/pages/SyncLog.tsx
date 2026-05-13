import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, CheckCircle2, XCircle, Clock, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fmtDateTime, fmtDuration, fmtNumber, fmtRelative } from "@/lib/format";
import type { SyncLog as SyncLogRow } from "@/types";

const statusConfig: Record<string, { variant: 'success' | 'destructive' | 'info' | 'secondary'; icon: typeof CheckCircle2 }> = {
  success: { variant: 'success', icon: CheckCircle2 },
  error: { variant: 'destructive', icon: XCircle },
  running: { variant: 'info', icon: Clock },
};

const sourceLabel: Record<string, string> = {
  workflows: 'Workflow 1 — Workflows',
  emails: 'Workflow 2 — E-mails',
  assets: 'Workflow 3 — Assets',
};

export function SyncLog() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<SyncLogRow[]>([]);

  async function loadData() {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('rd_sync_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      setLogs((data || []) as SyncLogRow[]);
    } catch (err) {
      console.error("Erro ao buscar logs:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = logs.reduce(
    (acc, log) => {
      acc.total += 1;
      if (log.status === 'success') acc.success += 1;
      if (log.status === 'error') acc.error += 1;
      acc.items += log.items_synced || 0;
      return acc;
    },
    { total: 0, success: 0, error: 0, items: 0 }
  );

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
          <h2 className="text-3xl font-bold tracking-tight">Histórico de Sincronizações</h2>
          <p className="text-muted-foreground mt-2">
            Execuções dos workflows n8n que populam o Supabase. Últimas 100 entradas.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4" /> Atualizar
        </Button>
      </div>

      {logs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Activity}
            title="Nenhum log de sincronização ainda"
            description="Os workflows n8n registrarão sua execução aqui automaticamente."
          />
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Execuções</p>
                <p className="text-2xl font-bold mt-1">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sucesso</p>
                <p className="text-2xl font-bold mt-1 text-emerald-400">{stats.success}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.total ? `${((stats.success / stats.total) * 100).toFixed(0)}%` : '—'} de sucesso
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Erros</p>
                <p className="text-2xl font-bold mt-1 text-rose-400">{stats.error}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Itens Sincronizados</p>
                <p className="text-2xl font-bold mt-1">{fmtNumber(stats.items)}</p>
                <p className="text-xs text-muted-foreground mt-1">somatório histórico</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Execuções Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b text-muted-foreground">
                      <th className="h-10 px-3 text-left text-xs uppercase tracking-wide font-medium">Quando</th>
                      <th className="h-10 px-3 text-left text-xs uppercase tracking-wide font-medium">Fonte</th>
                      <th className="h-10 px-3 text-center text-xs uppercase tracking-wide font-medium">Status</th>
                      <th className="h-10 px-3 text-right text-xs uppercase tracking-wide font-medium">Itens</th>
                      <th className="h-10 px-3 text-right text-xs uppercase tracking-wide font-medium">Duração</th>
                      <th className="h-10 px-3 text-left text-xs uppercase tracking-wide font-medium">Detalhes</th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {logs.map((log) => {
                      const cfg = statusConfig[log.status] || { variant: 'secondary', icon: Clock };
                      const Icon = cfg.icon;
                      const metaMessage = (log.metadata as { message?: string } | null)?.message;
                      return (
                        <tr key={log.id} className="border-b transition-colors hover:bg-secondary/40">
                          <td className="p-3 align-middle">
                            <div className="text-sm">{fmtRelative(log.created_at)}</div>
                            <div className="text-xs text-muted-foreground">{fmtDateTime(log.created_at)}</div>
                          </td>
                          <td className="p-3 align-middle text-sm">
                            {sourceLabel[log.source] || log.source}
                          </td>
                          <td className="p-3 align-middle text-center">
                            <Badge variant={cfg.variant} className="gap-1">
                              <Icon className="h-3 w-3" /> {log.status}
                            </Badge>
                          </td>
                          <td className="p-3 align-middle text-right tabular-nums">
                            {log.items_synced != null ? fmtNumber(log.items_synced) : '—'}
                          </td>
                          <td className="p-3 align-middle text-right tabular-nums text-muted-foreground">
                            {fmtDuration(log.duration_ms)}
                          </td>
                          <td className="p-3 align-middle text-xs text-muted-foreground max-w-md truncate" title={metaMessage}>
                            {metaMessage || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
