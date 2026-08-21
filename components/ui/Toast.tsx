"use client";

import { IconCheck } from "@/components/ui/Icons";
import { useOrder } from "@/store/order-store";
import { useUi } from "@/store/ui-store";

/** Feedback breve y no intrusivo, con la acción de deshacer una eliminación. */
export function ToastHost() {
  const { toast } = useUi();
  const { lastRemoved, undoRemove } = useOrder();

  if (!toast && !lastRemoved) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-8"
    >
      {toast ? (
        <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-charcoal px-5 py-2.5 text-sm font-semibold text-ivory shadow-lg animate-rise">
          <IconCheck width={16} height={16} className="text-copper" />
          {toast}
        </div>
      ) : null}

      {lastRemoved ? (
        <div className="pointer-events-auto flex items-center gap-3 rounded-full bg-charcoal px-5 py-2.5 text-sm text-ivory shadow-lg animate-rise">
          <span>{lastRemoved.productName} eliminado</span>
          <button
            type="button"
            onClick={undoRemove}
            className="font-bold text-copper underline underline-offset-2 transition hover:text-ivory"
          >
            Deshacer
          </button>
        </div>
      ) : null}
    </div>
  );
}
