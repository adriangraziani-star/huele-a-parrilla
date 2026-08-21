import type { ReactNode } from "react";

import { IconAlert, IconCheck, IconClock } from "@/components/ui/Icons";

type NoticeTone = "confirm" | "warning" | "alert" | "info";

interface NoticeProps {
  tone: NoticeTone;
  title?: string;
  children: ReactNode;
  icon?: "check" | "alert" | "clock";
  className?: string;
}

const toneClass: Record<NoticeTone, string> = {
  confirm: "notice notice-confirm",
  warning: "notice notice-warning",
  alert: "notice notice-alert",
  info: "notice notice-info",
};

const icons = {
  check: IconCheck,
  alert: IconAlert,
  clock: IconClock,
};

/**
 * Aviso de estado. El significado nunca depende solo del color: siempre
 * acompaña un icono y un texto explícito.
 */
export function Notice({ tone, title, children, icon, className = "" }: NoticeProps) {
  const Icon = icon ? icons[icon] : null;

  return (
    <div className={`${toneClass[tone]} ${className}`}>
      {Icon ? <Icon className="mt-0.5 shrink-0" width={18} height={18} /> : null}
      <div className="min-w-0">
        {title ? <p className="font-bold">{title}</p> : null}
        <div className={title ? "mt-0.5" : ""}>{children}</div>
      </div>
    </div>
  );
}
