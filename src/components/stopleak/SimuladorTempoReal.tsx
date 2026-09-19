import { Droplets, PlugZap, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStopLeak, type SimMode } from "@/lib/stopleak-store";

const opcoes: { mode: SimMode; label: string; desc: string; icon: typeof Droplets }[] = [
  { mode: "normal", label: "Fluxo normal", desc: "Vazão entre 2 e 4 L/min", icon: Droplets },
  { mode: "vazamento", label: "Disparar vazamento", desc: "Vazão acima do limite", icon: Waves },
  {
    mode: "desconectado",
    label: "Desconectar ESP32",
    desc: "Perda de comunicação",
    icon: PlugZap,
  },
];

export function SimuladorTempoReal() {
  const { mode, setMode } = useStopLeak();

  return (
    <section
      aria-labelledby="titulo-simulacao"
      className="rounded-xl border border-border bg-surface p-4"
    >
      <h2 id="titulo-simulacao" className="text-base font-semibold">
        Simulação em tempo real
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Use os cenários abaixo para testar todos os estados do sistema sem hardware conectado.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3" role="group" aria-label="Cenários de simulação">
        {opcoes.map((o) => {
          const ativo = mode === o.mode;
          return (
            <Button
              key={o.mode}
              variant={ativo ? "default" : "outline"}
              aria-pressed={ativo}
              className="h-auto flex-col items-start gap-1 py-3 text-left whitespace-normal"
              onClick={() => setMode(o.mode)}
            >
              <span className="flex items-center gap-2 font-semibold">
                <o.icon aria-hidden="true" className="size-4" />
                {o.label}
                {ativo ? <span className="text-xs font-normal">(ativo)</span> : null}
              </span>
              <span className="text-xs opacity-80">{o.desc}</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
