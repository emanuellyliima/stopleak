import { useState } from "react";
import { Power, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStopLeak } from "@/lib/stopleak-store";

type Pendente = { titulo: string; descricao: string; confirmar: () => void } | null;

export function ControlesRapidos() {
  const { valveOpen, pumpOn, setValve, setPump, connected } = useStopLeak();
  const [pendente, setPendente] = useState<Pendente>(null);

  const alternarValvula = () => {
    if (valveOpen) {
      setPendente({
        titulo: "Deseja fechar a válvula?",
        descricao:
          "Esta ação interromperá a passagem de água no ponto monitorado. Você poderá reabrir a válvula a qualquer momento.",
        confirmar: () => setValve(false),
      });
    } else {
      setValve(true);
    }
  };

  const alternarBomba = () => {
    if (pumpOn) {
      setPendente({
        titulo: "Deseja desligar a bomba?",
        descricao:
          "A bomba deixará de pressurizar o sistema. Equipamentos que dependem de pressão podem parar de funcionar.",
        confirmar: () => setPump(false),
      });
    } else {
      setPump(true);
    }
  };

  return (
    <section
      aria-labelledby="titulo-controles"
      className="rounded-xl border border-border bg-card p-4"
    >
      <h2 id="titulo-controles" className="text-base font-semibold">
        Ações rápidas
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Ações críticas pedem confirmação antes de serem executadas.
      </p>
      {!connected ? (
        <p className="mt-2 text-sm font-medium text-destructive">
          <span aria-hidden="true">🔴 </span>Dispositivo desconectado: comandos podem não chegar ao
          ESP32.
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant={valveOpen ? "destructive" : "default"} onClick={alternarValvula}>
          <Waves aria-hidden="true" />
          {valveOpen ? "Fechar válvula" : "Abrir válvula"}
        </Button>
        <Button variant={pumpOn ? "destructive" : "default"} onClick={alternarBomba}>
          <Power aria-hidden="true" />
          {pumpOn ? "Desligar bomba" : "Ligar bomba"}
        </Button>
      </div>

      <AlertDialog open={pendente !== null} onOpenChange={(o) => !o && setPendente(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendente?.titulo}</AlertDialogTitle>
            <AlertDialogDescription>{pendente?.descricao}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                pendente?.confirmar();
                setPendente(null);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
