"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { IconClose } from "@/components/ui/Icons";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Descripción accesible opcional, anunciada junto al título. */
  description?: string;
  children: ReactNode;
  /** `sheet` ocupa la zona inferior en móvil; `drawer` entra por el costado. */
  variant?: "sheet" | "drawer";
  footer?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Capa modal accesible: atrapa el foco, cierra con Escape y devuelve el foco
 * al elemento que la abrió.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  variant = "sheet",
  footer,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const descriptionId = useId();

  // `onClose` puede cambiar de identidad entre renders; guardarlo en una
  // referencia evita que el efecto de foco se reinicie y devuelva el foco
  // antes de tiempo.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const panel = panelRef.current;
    const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE);
    firstFocusable?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;

      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (element) => element.offsetParent !== null,
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown, true);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      previouslyFocused.current?.focus?.();
    };
  }, [open]);

  if (!open) return null;

  const isDrawer = variant === "drawer";

  return (
    <div className="fixed inset-0 z-50 flex animate-fade">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-charcoal/55"
        tabIndex={-1}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        aria-describedby={description ? descriptionId : undefined}
        className={
          isDrawer
            ? "relative ml-auto flex h-full w-full max-w-[26rem] flex-col bg-ivory shadow-2xl animate-rise sm:max-w-[27rem]"
            : "relative mt-auto flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-ivory shadow-2xl animate-rise sm:m-auto sm:max-h-[88dvh] sm:w-[min(34rem,calc(100vw-3rem))] sm:rounded-2xl"
        }
      >
        <header className="flex items-start justify-between gap-4 border-b border-leather/15 bg-charcoal px-5 py-4 text-ivory sm:rounded-t-2xl">
          <div>
            <h2 className="display-3 text-ivory">{title}</h2>
            {description ? (
              <p id={descriptionId} className="mt-1 text-sm text-ivory/70">
                {description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 -mt-1 rounded-full p-2 text-ivory/70 transition hover:bg-ivory/10 hover:text-ivory"
            aria-label={`Cerrar ${title}`}
          >
            <IconClose />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {children}
        </div>

        {footer ? (
          <footer className="border-t border-leather/20 bg-cream px-5 py-4">
            {footer}
          </footer>
        ) : null}
      </div>
    </div>
  );
}
