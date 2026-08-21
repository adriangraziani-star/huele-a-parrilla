"use client";

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

import type { CartItem, Product } from "@/types";

export interface CustomizationTarget {
  product: Product;
  /** Cantidad inicial preseleccionada desde la tarjeta del catálogo. */
  quantity: number;
  /** Presente solo cuando se está editando una línea existente. */
  editing: CartItem | null;
}

interface UiContextValue {
  cartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  customization: CustomizationTarget | null;
  openCustomization: (target: CustomizationTarget) => void;
  closeCustomization: () => void;
  toast: string | null;
  showToast: (message: string) => void;
  dismissToast: () => void;
}

const UiContext = createContext<UiContextValue | null>(null);

export function UiProvider({ children }: { children: ReactNode }) {
  const [cartOpen, setCartOpen] = useState(false);
  const [customization, setCustomization] = useState<CustomizationTarget | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    },
    [],
  );

  // Bloquear el scroll de fondo mientras exista una capa modal abierta.
  useEffect(() => {
    const locked = cartOpen || customization !== null;
    if (!locked) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [cartOpen, customization]);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const openCustomization = useCallback(
    (target: CustomizationTarget) => setCustomization(target),
    [],
  );
  const closeCustomization = useCallback(() => setCustomization(null), []);
  const dismissToast = useCallback(() => setToast(null), []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo<UiContextValue>(
    () => ({
      cartOpen,
      openCart,
      closeCart,
      customization,
      openCustomization,
      closeCustomization,
      toast,
      showToast,
      dismissToast,
    }),
    [
      cartOpen,
      customization,
      toast,
      openCart,
      closeCart,
      openCustomization,
      closeCustomization,
      showToast,
      dismissToast,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export const useUi = (): UiContextValue => {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error("useUi debe usarse dentro de UiProvider.");
  }
  return context;
};
