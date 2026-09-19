import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/stopleak/Layout";

export const Route = createFileRoute("/ajuda")({
  head: () => ({
    meta: [
      { title: "Ajuda e documentação — StopLeak" },
      {
        name: "description",
        content:
          "Guia dos indicadores e sensores do sistema StopLeak de monitoramento de vazamentos.",
      },
      { property: "og:title", content: "Ajuda e documentação — StopLeak" },
      {
        property: "og:description",
        content: "Entenda cada indicador e sensor do sistema StopLeak.",
      },
    ],
  }),
  component: Ajuda,
});

const indicadores: [string, string][] = [
  ["Status do sistema", "🟢 Normal indica leitura dentro do padrão; ⚠️ Alerta indica vazão acima do limite."],
  ["Vazão atual", "Litros por minuto medidos pelo sensor de fluxo YF-S201 acoplado à tubulação."],
  ["Estado da válvula", "Aberta permite a passagem de água; Fechada interrompe o fluxo (válvula solenoide)."],
  ["Estado da bomba", "Ligada pressuriza o sistema; Desligada interrompe a pressurização."],
  ["Conexão ESP32", "🟢 Conectado significa comunicação ativa; 🔴 Desconectado indica dados desatualizados."],
  ["Alertas", "Quantidade de ocorrências de vazamento registradas no histórico."],
];

function Ajuda() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Ajuda e documentação</h1>
        </div>

        <section
          aria-labelledby="titulo-indicadores"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-indicadores" className="text-lg font-semibold">
            O que significa cada indicador
          </h2>
          <dl className="mt-3 space-y-3 text-sm">
            {indicadores.map(([t, d]) => (
              <div key={t}>
                <dt className="font-medium">{t}</dt>
                <dd className="text-muted-foreground">{d}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby="titulo-sensores"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-sensores" className="text-lg font-semibold">
            Sensores e dispositivos
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Sensor de fluxo YF-S201:</strong> conta os pulsos
              do rotor e converte em litros por minuto.
            </li>
            <li>
              <strong className="text-foreground">Válvula solenoide 12 V:</strong> abre ou fecha a
              passagem de água por comando elétrico.
            </li>
            <li>
              <strong className="text-foreground">Bomba d&apos;água:</strong> mantém a pressão da
              linha monitorada.
            </li>
            <li>
              <strong className="text-foreground">Microcontrolador ESP32:</strong> lê os sensores e
              envia os dados por Wi-Fi para este painel.
            </li>
          </ul>
        </section>
      </div>
    </Layout>
  );
}