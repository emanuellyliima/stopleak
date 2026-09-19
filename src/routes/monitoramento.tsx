import { createFileRoute } from "@tanstack/react-router";
import { Activity, Droplets, Power, Timer, Waves } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Layout } from "@/components/stopleak/Layout";
import { StatusCard } from "@/components/stopleak/StatusCard";
import { AlertaVazamento } from "@/components/stopleak/AlertaVazamento";
import { SimuladorTempoReal } from "@/components/stopleak/SimuladorTempoReal";
import { Button } from "@/components/ui/button";
import { formatDuration, formatNumber, useStopLeak } from "@/lib/stopleak-store";

export const Route = createFileRoute("/monitoramento")({
  head: () => ({
    meta: [
      { title: "Monitoramento em tempo real — StopLeak" },
      {
        name: "description",
        content:
          "Gráfico de vazão por tempo, volume total monitorado, duração do monitoramento e estado imediato da válvula e da bomba.",
      },
      { property: "og:title", content: "Monitoramento em tempo real — StopLeak" },
      {
        property: "og:description",
        content: "Acompanhe a variação da vazão de água e o volume monitorado pelo StopLeak.",
      },
    ],
  }),
  component: Monitoramento,
});

function Monitoramento() {
  const { history, flow, totalVolume, elapsed, valveOpen, pumpOn, settings, resetMonitoring } =
    useStopLeak();

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">Monitoramento</h1>
          </div>
          <Button variant="outline" onClick={resetMonitoring}>
            Reiniciar contagem
          </Button>
        </div>

        <AlertaVazamento />

        <section
          aria-labelledby="titulo-grafico"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-grafico" className="text-base font-semibold">
            Vazão (L/min) por tempo
          </h2>
          <p className="text-sm text-muted-foreground">
            A linha tracejada indica o limite de {formatNumber(settings.threshold, 0)} L/min
            configurado para disparo de alerta.
          </p>
          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} minTickGap={40} stroke="var(--muted-foreground)" />
                <YAxis domain={[0, 12]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                <Tooltip
                  formatter={(v: number) => [`${formatNumber(v)} L/min`, "Vazão"]}
                  labelFormatter={(l) => `Horário: ${l}`}
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    color: "var(--popover-foreground)",
                  }}
                />
                <ReferenceLine
                  y={settings.threshold}
                  stroke="var(--destructive)"
                  strokeDasharray="6 4"
                />
                <Line
                  type="monotone"
                  dataKey="flow"
                  stroke="var(--chart-1)"
                  strokeWidth={2.5}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="sr-only" aria-live="polite">
            Vazão atual: {formatNumber(flow)} litros por minuto.
          </p>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatusCard
            title="Vazão atual"
            value={`${formatNumber(flow)} L/min`}
            icon={Activity}
            tone="info"
          />
          <StatusCard
            title="Volume total monitorado"
            value={`${formatNumber(totalVolume)} L`}
            icon={Droplets}
            tone="info"
          />
          <StatusCard
            title="Tempo de monitoramento"
            value={formatDuration(elapsed)}
            detail="horas:minutos:segundos"
            icon={Timer}
            tone="neutral"
          />
          <StatusCard
            title="Válvula e bomba"
            value={`${valveOpen ? "Aberta" : "Fechada"} · ${pumpOn ? "Ligada" : "Desligada"}`}
            symbol={valveOpen && pumpOn ? "🟢" : "🔴"}
            icon={valveOpen ? Waves : Power}
            tone={valveOpen && pumpOn ? "success" : "warning"}
          />
        </div>

        <SimuladorTempoReal />
      </div>
    </Layout>
  );
}
