import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Activity, Droplets, Gauge, HelpCircle, History, Settings } from "lucide-react";

const nav = [
  { to: "/", label: "Painel", icon: Gauge },
  { to: "/monitoramento", label: "Monitoramento", icon: Activity },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/configuracoes", label: "Configurações", icon: Settings },
  { to: "/ajuda", label: "Ajuda", icon: HelpCircle },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <a href="#conteudo" className="pular-para-conteudo absolute z-50 m-2 rounded bg-primary px-3 py-2 text-primary-foreground">
        Pular para o conteúdo principal
      </a>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <Droplets className="size-5" />
            </span>
            StopLeak
          </Link>
          <nav aria-label="Navegação principal">
            <ul className="flex flex-wrap gap-1">
              {nav.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    activeOptions={{ exact: item.to === "/" }}
                    activeProps={{
                      className: "bg-primary text-primary-foreground",
                      "aria-current": "page",
                    }}
                    className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon aria-hidden="true" className="size-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <main id="conteudo" className="mx-auto max-w-6xl px-4 py-6">
        {children}
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        StopLeak — monitoramento inteligente de vazamentos
      </footer>
    </div>
  );
}
