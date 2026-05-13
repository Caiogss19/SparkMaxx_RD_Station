import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutTemplate } from "lucide-react";

export function Assets() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">LP & Forms</h2>
        <p className="text-muted-foreground mt-2">Métricas de páginas de captura e formulários.</p>
      </div>

      <Card className="border-dashed border-2 bg-transparent shadow-none">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <LayoutTemplate className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Fonte de Dados Externa</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          <p>A coleta de Landing Pages, Popups e Forms é feita por outra ferramenta, conforme definido no projeto.</p>
          <p className="mt-2 text-sm">Este painel será integrado posteriormente quando a fonte de dados estiver consolidada.</p>
        </CardContent>
      </Card>
    </div>
  );
}
