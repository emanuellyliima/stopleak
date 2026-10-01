import { AlertTriangle, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, useStopLeak } from "@/lib/stopleak-store";

export function AlertaVazamento() {
  const { alertActive, alertFlow, dismissAlert, restoreSystem, settings } = useStopLeak();
  if (!alertActive) return null;

  return (
    <section
      role="alert"
      aria-live="assertive"
      className="rounded-xl border-2 border-destructive bg-destructive/10 p-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-destructive text-destructive-foreground"
        >
          <AlertTriangle className="size-6" />
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-destructive">
            <span aria-hidden="true">⚠️ </span>POSSÍVEL VAZAMENTO IDENTIFICADO
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-foreground">
            <li>
              Vazão detectada: <strong>{formatNumber(alertFlow)} L/min</strong> (limite configurado:{" "}
              {formatNumber(settings.threshold, 0)} L/min)
            </li>
            <li>
              Ação realizada:{" "}
              <strong>
                {settings.autoClose
                  ? "Válvula fechada automaticamente"
                  : "Somente alerta emitido — fechamento automático desativado"}
              </strong>
            </li>
            <li>Recomendação: verifique o ponto monitorado antes de restabelecer o fluxo.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={restoreSystem}>
              <ShieldCheck aria-hidden="true" />
              Restabelecer sistema
            </Button>
            <Button variant="outline" onClick={dismissAlert}>
              <X aria-hidden="true" />
              Manter fechado e ocultar aviso
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
