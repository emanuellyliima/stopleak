import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type SimMode = "normal" | "vazamento" | "desconectado";

export type FlowPoint = { t: number; label: string; flow: number };

export type Occurrence = {
  id: string;
  date: string;
  time: string;
  status: "normal" | "alerta" | "desconexao";
  flow: number;
  action: string;
  detail: string;
};

export type Settings = {
  threshold: number;
  minDuration: number;
  autoClose: boolean;
  notifySound: boolean;
  notifyPush: boolean;
  notifyEmail: boolean;
  highContrast: boolean;
  fontScale: number;
};

type Ctx = {
  mode: SimMode;
  setMode: (m: SimMode) => void;
  flow: number;
  history: FlowPoint[];
  totalVolume: number;
  elapsed: number;
  valveOpen: boolean;
  pumpOn: boolean;
  connected: boolean;
  alertActive: boolean;
  alertFlow: number;
  occurrences: Occurrence[];
  settings: Settings;
  updateSettings: (s: Partial<Settings>) => void;
  setValve: (open: boolean) => void;
  setPump: (on: boolean) => void;
  dismissAlert: () => void;
  restoreSystem: () => void;
  resetMonitoring: () => void;
};

const StopLeakContext = createContext<Ctx | null>(null);

const seedOccurrences: Occurrence[] = [
  {
    id: "OC-1042",
    date: "08/09/2026",
    time: "07:14",
    status: "alerta",
    flow: 9.4,
    action: "Válvula fechada automaticamente",
    detail:
      "Vazão acima do limite por 12 segundos consecutivos no ponto da cozinha. Sistema interrompeu o fluxo e notificou o responsável.",
  },
  {
    id: "OC-1041",
    date: "07/09/2026",
    time: "21:02",
    status: "desconexao",
    flow: 0,
    action: "Modo seguro ativado",
    detail:
      "O dispositivo ESP32 ficou sem comunicação por 45 segundos. Últimos valores mantidos em tela com aviso de dado desatualizado.",
  },
  {
    id: "OC-1040",
    date: "07/09/2026",
    time: "18:37",
    status: "normal",
    flow: 3.1,
    action: "Consumo dentro do padrão",
    detail: "Ciclo de irrigação concluído sem intercorrências. Volume total registrado: 24,8 L.",
  },
  {
    id: "OC-1039",
    date: "05/09/2026",
    time: "12:20",
    status: "alerta",
    flow: 8.7,
    action: "Válvula fechada manualmente pelo usuário",
    detail:
      "Alerta confirmado pelo usuário na tela de monitoramento. Fechamento manual antes do tempo limite automático.",
  },
];

const defaultSettings: Settings = {
  threshold: 6,
  minDuration: 10,
  autoClose: true,
  notifySound: true,
  notifyPush: true,
  notifyEmail: false,
  highContrast: false,
  fontScale: 100,
};

function fmtTime(d: Date) {
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function StopLeakProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SimMode>("normal");
  const [flow, setFlow] = useState(2.8);
  const [history, setHistory] = useState<FlowPoint[]>([]);
  const [totalVolume, setTotalVolume] = useState(18.5);
  const [elapsed, setElapsed] = useState(0);
  const [valveOpen, setValveOpen] = useState(true);
  const [pumpOn, setPumpOn] = useState(true);
  const [alertActive, setAlertActive] = useState(false);
  const [alertFlow, setAlertFlow] = useState(0);
  const [occurrences, setOccurrences] = useState<Occurrence[]>(seedOccurrences);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const alertRef = useRef(false);

  const connected = mode !== "desconectado";

  const addOccurrence = useCallback((o: Omit<Occurrence, "id" | "date" | "time">) => {
    const now = new Date();
    setOccurrences((prev) => [
      {
        ...o,
        id: `OC-${1043 + prev.length - seedOccurrences.length}`,
        date: now.toLocaleDateString("pt-BR"),
        time: now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      },
      ...prev,
    ]);
  }, []);

  // simulation tick
  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date();
      setElapsed((e) => e + 1);
      setFlow((prev) => {
        let next: number;
        if (mode === "desconectado") next = prev;
        else if (!valveOpen || !pumpOn) next = 0;
        else if (mode === "vazamento") next = 8.2 + Math.random() * 1.2;
        else next = 2.4 + Math.random() * 1.1;
        if (mode !== "desconectado") {
          setTotalVolume((v) => +(v + next / 60).toFixed(2));
          setHistory((h) => [...h.slice(-59), { t: now.getTime(), label: fmtTime(now), flow: +next.toFixed(1) }]);
        }
        return +next.toFixed(1);
      });
    }, 1000);
    return () => clearInterval(id);
  }, [mode, valveOpen, pumpOn]);

  // leak detection
  useEffect(() => {
    if (mode === "vazamento" && valveOpen && !alertRef.current && flow > settings.threshold) {
      alertRef.current = true;
      setAlertActive(true);
      setAlertFlow(flow);
      if (settings.autoClose) {
        setValveOpen(false);
        setPumpOn(false);
      }
      addOccurrence({
        status: "alerta",
        flow,
        action: settings.autoClose
          ? "Válvula fechada automaticamente"
          : "Alerta emitido (fechamento automático desativado)",
        detail: `Vazão de ${flow.toFixed(1).replace(".", ",")} L/min acima do limite de ${settings.threshold} L/min configurado.`,
      });
    }
    if (mode !== "vazamento") alertRef.current = false;
  }, [mode, flow, valveOpen, settings.threshold, settings.autoClose, addOccurrence]);

  // disconnection log
  useEffect(() => {
    if (mode === "desconectado") {
      addOccurrence({
        status: "desconexao",
        flow: 0,
        action: "Comunicação perdida com o ESP32",
        detail: "Os dados exibidos são os últimos recebidos antes da perda de conexão.",
      });
    }
  }, [mode, addOccurrence]);

  // accessibility side effects
  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("contraste-alto", settings.highContrast);
    el.style.fontSize = `${settings.fontScale}%`;
  }, [settings.highContrast, settings.fontScale]);

  const setMode = useCallback((m: SimMode) => {
    setModeState(m);
    if (m === "normal") {
      setAlertActive(false);
      setValveOpen(true);
      setPumpOn(true);
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      mode,
      setMode,
      flow: connected ? flow : flow,
      history,
      totalVolume,
      elapsed,
      valveOpen,
      pumpOn,
      connected,
      alertActive,
      alertFlow,
      occurrences,
      settings,
      updateSettings: (s) => setSettings((prev) => ({ ...prev, ...s })),
      setValve: (open) => {
        setValveOpen(open);
        addOccurrence({
          status: "normal",
          flow,
          action: open ? "Válvula aberta manualmente" : "Válvula fechada manualmente",
          detail: "Ação executada pelo usuário nos controles rápidos do painel.",
        });
      },
      setPump: (on) => {
        setPumpOn(on);
        addOccurrence({
          status: "normal",
          flow,
          action: on ? "Bomba ligada manualmente" : "Bomba desligada manualmente",
          detail: "Ação executada pelo usuário nos controles rápidos do painel.",
        });
      },
      dismissAlert: () => setAlertActive(false),
      restoreSystem: () => {
        setModeState("normal");
        setAlertActive(false);
        setValveOpen(true);
        setPumpOn(true);
        addOccurrence({
          status: "normal",
          flow: 0,
          action: "Sistema restaurado pelo usuário",
          detail: "Válvula reaberta e bomba religada após verificação do ponto de vazamento.",
        });
      },
      resetMonitoring: () => {
        setTotalVolume(0);
        setElapsed(0);
        setHistory([]);
      },
    }),
    [
      mode,
      setMode,
      connected,
      flow,
      history,
      totalVolume,
      elapsed,
      valveOpen,
      pumpOn,
      alertActive,
      alertFlow,
      occurrences,
      settings,
      addOccurrence,
    ],
  );

  return <StopLeakContext.Provider value={value}>{children}</StopLeakContext.Provider>;
}

export function useStopLeak() {
  const ctx = useContext(StopLeakContext);
  if (!ctx) throw new Error("useStopLeak precisa estar dentro de StopLeakProvider");
  return ctx;
}

export function formatNumber(n: number, digits = 1) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}
