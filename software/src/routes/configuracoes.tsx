import { createFileRoute } from "@tanstack/react-router";
import { Layout } from "@/components/stopleak/Layout";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatNumber, useStopLeak } from "@/lib/stopleak-store";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações do sistema — StopLeak" },
      {
        name: "description",
        content:
          "Ajuste o limite de vazamento, veja os dados de conexão do ESP32, escolha notificações e ative recursos de acessibilidade.",
      },
      { property: "og:title", content: "Configurações do sistema — StopLeak" },
      {
        property: "og:description",
        content: "Parâmetros de detecção, notificações e acessibilidade do StopLeak.",
      },
    ],
  }),
  component: Configuracoes,
});

function Configuracoes() {
  const { settings, updateSettings, connected } = useStopLeak();

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold sm:text-3xl">Configurações</h1>
        </div>

        <section
          aria-labelledby="titulo-parametros"
          className="space-y-5 rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-parametros" className="text-lg font-semibold">
            Parâmetros de detecção de vazamento
          </h2>
          <div>
            <Label htmlFor="limite">
              Limite de vazão para alerta: {formatNumber(settings.threshold, 0)} L/min
            </Label>
            <Slider
              id="limite"
              className="mt-3"
              min={1}
              max={12}
              step={1}
              value={[settings.threshold]}
              onValueChange={(v) => updateSettings({ threshold: v[0]! })}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Vazões acima deste valor são tratadas como possível vazamento.
            </p>
          </div>
          <div>
            <Label htmlFor="duracao">
              Duração mínima acima do limite: {settings.minDuration} segundos
            </Label>
            <Slider
              id="duracao"
              className="mt-3"
              min={2}
              max={60}
              step={2}
              value={[settings.minDuration]}
              onValueChange={(v) => updateSettings({ minDuration: v[0]! })}
            />
            <p className="mt-2 text-sm text-muted-foreground">
              Evita alertas falsos causados por picos rápidos de consumo.
            </p>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <Label htmlFor="auto" className="flex-1">
              Fechar a válvula automaticamente ao detectar vazamento
            </Label>
            <Switch
              id="auto"
              checked={settings.autoClose}
              onCheckedChange={(v) => updateSettings({ autoClose: v })}
            />
          </div>
        </section>

        <section
          aria-labelledby="titulo-esp32"
          className="rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-esp32" className="text-lg font-semibold">
            Conexão do dispositivo ESP32
          </h2>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Situação</dt>
              <dd className="font-medium">
                <span aria-hidden="true">{connected ? "🟢 " : "🔴 "}</span>
                {connected ? "Conectado" : "Desconectado"}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Rede Wi-Fi</dt>
              <dd className="font-medium">StopLeak-Casa (2,4 GHz)</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Endereço IP</dt>
              <dd className="font-medium">192.168.0.42</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Firmware</dt>
              <dd className="font-medium">v1.4.2 · sensor YF-S201</dd>
            </div>
          </dl>
        </section>

        <section
          aria-labelledby="titulo-notificacoes"
          className="space-y-3 rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-notificacoes" className="text-lg font-semibold">
            Preferências de notificação
          </h2>
          {[
            { id: "som", key: "notifySound" as const, label: "Alerta sonoro no navegador" },
            { id: "push", key: "notifyPush" as const, label: "Notificação push no celular" },
            { id: "email", key: "notifyEmail" as const, label: "Resumo diário por e-mail" },
          ].map((o) => (
            <div
              key={o.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-border p-3"
            >
              <Label htmlFor={o.id} className="flex-1">
                {o.label}
              </Label>
              <Switch
                id={o.id}
                checked={settings[o.key]}
                onCheckedChange={(v) => updateSettings({ [o.key]: v })}
              />
            </div>
          ))}
        </section>

        <section
          aria-labelledby="titulo-acessibilidade"
          className="space-y-5 rounded-xl border border-border bg-card p-4"
        >
          <h2 id="titulo-acessibilidade" className="text-lg font-semibold">
            Acessibilidade
          </h2>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
            <Label htmlFor="contraste" className="flex-1">
              Modo de alto contraste
            </Label>
            <Switch
              id="contraste"
              checked={settings.highContrast}
              onCheckedChange={(v) => updateSettings({ highContrast: v })}
            />
          </div>
          <div>
            <Label htmlFor="fonte">Tamanho da fonte: {settings.fontScale}%</Label>
            <Slider
              id="fonte"
              className="mt-3"
              min={90}
              max={150}
              step={10}
              value={[settings.fontScale]}
              onValueChange={(v) => updateSettings({ fontScale: v[0]! })}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => updateSettings({ fontScale: 100, highContrast: false })}
          >
            Restaurar padrões de acessibilidade
          </Button>
        </section>
      </div>
    </Layout>
  );
}
