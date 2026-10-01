import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, CheckCircle2, Search, WifiOff } from "lucide-react";
import { Layout } from "@/components/stopleak/Layout";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, useStopLeak, type Occurrence } from "@/lib/stopleak-store";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de ocorrências — StopLeak" },
      {
        name: "description",
        content:
          "Tabela com data, hora, status, vazão e ação tomada em cada ocorrência registrada pelo sistema StopLeak.",
      },
      { property: "og:title", content: "Histórico de ocorrências — StopLeak" },
      {
        property: "og:description",
        content: "Consulte todas as ocorrências de vazamento, desconexão e operação normal.",
      },
    ],
  }),
  component: Historico,
});

const rotulos = {
  alerta: { texto: "Alerta de vazamento", simbolo: "⚠️", icone: AlertTriangle, cor: "text-destructive" },
  desconexao: { texto: "Desconexão", simbolo: "🔴", icone: WifiOff, cor: "text-warning" },
  normal: { texto: "Normal", simbolo: "🟢", icone: CheckCircle2, cor: "text-success" },
} as const;

function Historico() {
  const { occurrences } = useStopLeak();
  const [selecionada, setSelecionada] = useState<Occurrence | null>(null);

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Histórico de ocorrências</h1>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <caption className="sr-only">
              Ocorrências registradas com data, hora, status, vazão e ação tomada
            </caption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Data</TableHead>
                <TableHead scope="col">Hora</TableHead>
                <TableHead scope="col">Status</TableHead>
                <TableHead scope="col">Vazão</TableHead>
                <TableHead scope="col">Ação tomada</TableHead>
                <TableHead scope="col">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {occurrences.map((o) => {
                const r = rotulos[o.status];
                return (
                  <TableRow key={`${o.id}-${o.time}-${o.action}`}>
                    <TableCell>{o.date}</TableCell>
                    <TableCell>{o.time}</TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-2 font-medium ${r.cor}`}>
                        <span aria-hidden="true">{r.simbolo}</span>
                        <r.icone aria-hidden="true" className="size-4" />
                        {r.texto}
                      </span>
                    </TableCell>
                    <TableCell>{formatNumber(o.flow)} L/min</TableCell>
                    <TableCell className="max-w-[16rem] whitespace-normal">{o.action}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelecionada(o)}
                        aria-label={`Ver detalhes da ocorrência de ${o.date} às ${o.time}`}
                      >
                        <Search aria-hidden="true" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={selecionada !== null} onOpenChange={(o) => !o && setSelecionada(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da ocorrência</DialogTitle>
            <DialogDescription>
              {selecionada ? `${selecionada.date} às ${selecionada.time}` : ""}
            </DialogDescription>
          </DialogHeader>
          {selecionada ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium text-muted-foreground">Status</dt>
                <dd>
                  <span aria-hidden="true">{rotulos[selecionada.status].simbolo} </span>
                  {rotulos[selecionada.status].texto}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Vazão registrada</dt>
                <dd>{formatNumber(selecionada.flow)} L/min</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Ação tomada</dt>
                <dd>{selecionada.action}</dd>
              </div>
              <div>
                <dt className="font-medium text-muted-foreground">Descrição</dt>
                <dd>{selecionada.detail}</dd>
              </div>
            </dl>
          ) : null}
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
