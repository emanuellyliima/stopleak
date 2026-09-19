import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "warning" | "danger" | "neutral" | "info";

const toneClasses: Record<Tone, string> = {
  success: "border-success/60 bg-success/10 text-success",
  warning: "border-warning/70 bg-warning/15 text-warning",
  danger: "border-destructive/60 bg-destructive/10 text-destructive",
  info: "border-info/60 bg-info/10 text-info",
  neutral: "border-border bg-muted text-muted-foreground",
};

export function StatusCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "neutral",
  symbol,
}: {
  title: string;
  value: string;
  detail?: string;
  icon: LucideIcon;
  tone?: Tone;
  symbol?: string;
}) {
  return (
    <article
      className="rounded-xl border border-border bg-card p-4 shadow-sm"
      aria-label={`${title}: ${value}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg border",
            toneClasses[tone],
          )}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
      </div>
      <p className="mt-3 flex items-center gap-2 text-2xl font-semibold text-card-foreground">
        {symbol ? (
          <span aria-hidden="true" className="text-xl">
            {symbol}
          </span>
        ) : null}
        <span>{value}</span>
      </p>
      {detail ? <p className="mt-1 text-sm text-muted-foreground">{detail}</p> : null}
    </article>
  );
}
