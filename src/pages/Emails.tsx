import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function Emails() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: emails } = await supabase.from('rd_emails').select('*');
        const { data: metrics } = await supabase.from('rd_email_metrics').select('*').order('snapshot_date', { ascending: false });

        if (emails && metrics && metrics.length > 0) {
          const latestDate = metrics[0].snapshot_date;
          const latestMetrics = metrics.filter(m => m.snapshot_date === latestDate);

          const joinedData = latestMetrics.map(m => {
            const e = emails.find(em => em.id === m.email_id);
            return {
              id: m.email_id,
              name: e ? e.name : `Email ${m.email_id}`,
              sent: m.sent || 0,
              delivered: m.delivered || 0,
              opened: m.opened || 0,
              open_rate: m.open_rate || 0,
              click_rate: m.click_rate || 0
            };
          }).sort((a, b) => a.open_rate - b.open_rate).slice(0, 20);

          setData(joinedData);
        }

      } catch (err) {
        console.error("Erro ao buscar dados de e-mails:", err);
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
        <h2 className="text-3xl font-bold tracking-tight">E-mails</h2>
        <p className="text-muted-foreground mt-2">Análise de desempenho e atenção aos piores e-mails.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atenção: Piores E-mails (Menor Taxa de Abertura)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Ainda não há dados de e-mails coletados pelo Workflow 2.
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">E-mail</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Envios</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Entregas</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Aberturas</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Taxa Abertura</th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Taxa Clique</th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {data.map((item) => (
                    <tr key={item.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <td className="p-4 align-middle font-medium">{item.name}</td>
                      <td className="p-4 align-middle text-right">{item.sent.toLocaleString('pt-BR')}</td>
                      <td className="p-4 align-middle text-right">{item.delivered.toLocaleString('pt-BR')}</td>
                      <td className="p-4 align-middle text-right">{item.opened.toLocaleString('pt-BR')}</td>
                      <td className="p-4 align-middle text-right text-destructive font-semibold">{item.open_rate}%</td>
                      <td className="p-4 align-middle text-right">{item.click_rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
