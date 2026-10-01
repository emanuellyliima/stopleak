import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Power,
  Waves,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Layout } from "@/components/stopleak/Layout";
import { StatusCard } from "@/components/stopleak/StatusCard";
import { AlertaVazamento } from "@/components/stopleak/AlertaVazamento";
import { ControlesRapidos } from "@/components/stopleak/ControlesRapidos";
import { SimuladorTempoReal } from "@/components/stopleak/SimuladorTempoReal";
import { formatNumber, useStopLeak } from "@/lib/stopleak-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel StopLeak — Monitoramento de vazamentos em tempo real" },
      {
        name: "description",
        content:
          "Painel StopLeak com status do sistema, vazão atual, estado da válvula e da bomba, conexão do ESP32 e alertas de vazamento.",
      },
      { property: "og:title", content: "Painel StopLeak — Monitoramento de vazamentos" },
      {
        property: "og:description",
        content:
          "Acompanhe vazão, válvula, bomba e alertas de vazamento em tempo real com uma interface acessível.",
      },
    ],
  }),
  component: Painel,
});

function Painel() {
  const { flow, valveOpen, pumpOn, connected, alertActive, occurrences } = useStopLeak();
  const alertasHoje = occurrences.filter((o) => o.status === "alerta").length;

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Painel de controle</h1>
        </div>

        <AlertaVazamento />

        <section aria-labelledby="titulo-resumo">
          <h2 id="titulo-resumo" className="sr-only">
            Resumo do sistema
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatusCard
              title="Status do sistema"
              value={alertActive ? "Alerta" : "Normal"}
              symbol={alertActive ? "⚠️" : "🟢"}
              detail={
                alertActive ? "Vazamento identificado" : "Nenhuma anomalia nos últimos minutos"
              }
              icon={alertActive ? AlertTriangle : CheckCircle2}
              tone={alertActive ? "danger" : "success"}
            />
            <StatusCard
              title="Vazão atual"
              value={`${formatNumber(flow)} L/min`}
              detail={connected ? "Leitura ao vivo do sensor YF-S201" : "Último valor recebido"}
              icon={Activity}
              tone={flow > 6 ? "warning" : "info"}
            />
            <StatusCard
              title="Estado da válvula"
              value={valveOpen ? "Aberta" : "Fechada"}
              symbol={valveOpen ? "🟢" : "🔴"}
              detail={valveOpen ? "Água circulando" : "Passagem de água interrompida"}
              icon={Waves}
              tone={valveOpen ? "success" : "danger"}
            />
            <StatusCard
              title="Estado da bomba"
              value={pumpOn ? "Ligada" : "Desligada"}
              symbol={pumpOn ? "🟢" : "⚪"}
              detail={pumpOn ? "Pressurizando o sistema" : "Sem pressurização"}
              icon={Power}
              tone={pumpOn ? "success" : "neutral"}
            />
            <StatusCard
              title="Dispositivo ESP32"
              value={connected ? "Conectado" : "Desconectado"}
              symbol={connected ? "🟢" : "🔴"}
              detail={connected ? "Wi-Fi estável · sinal bom" : "Sem comunicação com o dispositivo"}
              icon={connected ? Wifi : WifiOff}
              tone={connected ? "success" : "danger"}
            />
            <StatusCard
              title="Alertas registrados"
              value={`${alertasHoje} alerta${alertasHoje === 1 ? "" : "s"}`}
              detail={alertActive ? "1 alerta ativo agora" : "Nenhum alerta ativo"}
              icon={BellRing}
              tone={alertActive ? "warning" : "neutral"}
            />
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          <ControlesRapidos />
          <SimuladorTempoReal />
        </div>
      </div>
    </Layout>
  );
}
