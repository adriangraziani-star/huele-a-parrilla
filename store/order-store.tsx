"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { getProduct } from "@/data/products";
import { getShippingForCommune, validateDeliveryMinimum } from "@/lib/delivery";
import {
  buildCartLines,
  calculateCartTotal,
  getQuantityRules,
  type CartLine,
} from "@/lib/pricing";
import { trackEvent } from "@/lib/analytics";
import type {
  CartItem,
  CartTotals,
  CommuneConditions,
  CustomerData,
  DeliveryData,
  DeliveryValidation,
  PaymentData,
  PreparationType,
  Product,
} from "@/types";

const CART_STORAGE_KEY = "hap-cart-v1";
const CUSTOMER_STORAGE_KEY = "hap-customer-v1";
const SCHEMA_VERSION = 1;

export interface CartSelection {
  quantity: number;
  preparationType: PreparationType | null;
  portionInstructions: string | null;
  specialInstructions: string | null;
}

interface OrderState {
  /** Falso hasta que se resuelve la lectura del almacenamiento del navegador. */
  hydrated: boolean;
  items: CartItem[];
  selectedCommuneId: string | null;
  customer: CustomerData;
  delivery: DeliveryData;
  payment: PaymentData;
}

const emptyCustomer: CustomerData = { fullName: "", phone: "", email: "" };
const emptyDelivery: DeliveryData = {
  address: "",
  residenceType: null,
  apartmentNumber: "",
  deliveryInstructions: "",
};
const emptyPayment: PaymentData = { method: null };

const initialState: OrderState = {
  hydrated: false,
  items: [],
  selectedCommuneId: null,
  customer: emptyCustomer,
  delivery: emptyDelivery,
  payment: emptyPayment,
};

type Action =
  | { type: "hydrate"; state: Omit<Partial<OrderState>, "hydrated"> }
  | { type: "addItem"; item: CartItem }
  | { type: "updateItem"; cartItemId: string; changes: Partial<CartItem> }
  | { type: "removeItem"; cartItemId: string }
  | { type: "restoreItem"; item: CartItem; index: number }
  | { type: "clearCart" }
  | { type: "setCommune"; communeId: string | null }
  | { type: "setCustomer"; changes: Partial<CustomerData> }
  | { type: "setDelivery"; changes: Partial<DeliveryData> }
  | { type: "setPayment"; method: PaymentData["method"] };

/**
 * Dos líneas se consolidan solo si son idénticas en producto, preparación e
 * instrucciones. Con preparaciones distintas permanecen separadas.
 */
const isSameConfiguration = (a: CartItem, b: CartItem): boolean =>
  a.productId === b.productId &&
  a.preparationType === b.preparationType &&
  (a.portionInstructions ?? "") === (b.portionInstructions ?? "") &&
  (a.specialInstructions ?? "") === (b.specialInstructions ?? "");

const reducer = (state: OrderState, action: Action): OrderState => {
  switch (action.type) {
    case "hydrate":
      return { ...state, ...action.state, hydrated: true };

    case "addItem": {
      const existingIndex = state.items.findIndex((item) =>
        isSameConfiguration(item, action.item),
      );
      if (existingIndex >= 0) {
        const items = [...state.items];
        items[existingIndex] = {
          ...items[existingIndex],
          quantity: items[existingIndex].quantity + action.item.quantity,
        };
        return { ...state, items };
      }
      return { ...state, items: [...state.items, action.item] };
    }

    case "updateItem":
      return {
        ...state,
        items: state.items.map((item) =>
          item.cartItemId === action.cartItemId
            ? { ...item, ...action.changes }
            : item,
        ),
      };

    case "removeItem":
      return {
        ...state,
        items: state.items.filter((item) => item.cartItemId !== action.cartItemId),
      };

    case "restoreItem": {
      const items = [...state.items];
      items.splice(Math.min(action.index, items.length), 0, action.item);
      return { ...state, items };
    }

    case "clearCart":
      return { ...state, items: [] };

    case "setCommune":
      return { ...state, selectedCommuneId: action.communeId };

    case "setCustomer":
      return { ...state, customer: { ...state.customer, ...action.changes } };

    case "setDelivery":
      return { ...state, delivery: { ...state.delivery, ...action.changes } };

    case "setPayment":
      return { ...state, payment: { method: action.method } };
  }
};

const createCartItemId = (): string =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Una línea exige anticipación cuando está porcionada o cuando el cliente
 * escribió indicaciones especiales. Criterio conservador: la web no interpreta
 * semánticamente el texto.
 */
const computeAdvancePreparation = (
  preparationType: PreparationType | null,
  specialInstructions: string | null,
): boolean =>
  preparationType === "portioned" ||
  (specialInstructions !== null && specialInstructions.trim().length > 0);

interface RemovedItemSnapshot {
  item: CartItem;
  index: number;
  productName: string;
}

interface OrderContextValue {
  hydrated: boolean;
  items: CartItem[];
  lines: CartLine[];
  totals: CartTotals;
  commune: CommuneConditions | null;
  validation: DeliveryValidation | null;
  minimumSatisfied: boolean;
  customer: CustomerData;
  delivery: DeliveryData;
  payment: PaymentData;
  /** Productos guardados que ya no están disponibles. */
  unavailableItems: CartItem[];
  lastRemoved: RemovedItemSnapshot | null;
  addItem: (product: Product, selection: CartSelection) => void;
  updateItemSelection: (cartItemId: string, selection: CartSelection) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeItem: (cartItemId: string) => void;
  undoRemove: () => void;
  dismissUndo: () => void;
  clearCart: () => void;
  setCommune: (communeId: string | null) => void;
  setCustomer: (changes: Partial<CustomerData>) => void;
  setDelivery: (changes: Partial<DeliveryData>) => void;
  setPayment: (method: PaymentData["method"]) => void;
}

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [lastRemoved, setLastRemoved] = useState<RemovedItemSnapshot | null>(null);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Restauración desde el navegador. El catálogo nunca se persiste: cada línea
  // se resuelve contra los datos vigentes, de modo que un cambio de precio se
  // refleja automáticamente.
  useEffect(() => {
    const restored: Omit<Partial<OrderState>, "hydrated"> = {};

    try {
      const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
      if (rawCart) {
        const parsed = JSON.parse(rawCart) as {
          version?: number;
          items?: CartItem[];
          selectedCommuneId?: string | null;
        };
        if (parsed.version === SCHEMA_VERSION) {
          if (Array.isArray(parsed.items)) restored.items = parsed.items;
          if (typeof parsed.selectedCommuneId === "string" || parsed.selectedCommuneId === null) {
            restored.selectedCommuneId = parsed.selectedCommuneId ?? null;
          }
        }
      }
    } catch {
      // Un almacenamiento corrupto no debe romper la página.
    }

    try {
      const rawCustomer = window.sessionStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (rawCustomer) {
        const parsed = JSON.parse(rawCustomer) as Partial<OrderState>;
        if (parsed.customer) restored.customer = { ...emptyCustomer, ...parsed.customer };
        if (parsed.delivery) restored.delivery = { ...emptyDelivery, ...parsed.delivery };
        if (parsed.payment) restored.payment = { ...emptyPayment, ...parsed.payment };
      }
    } catch {
      // Idem.
    }

    dispatch({ type: "hydrate", state: restored });
  }, []);

  // Carrito y comuna: localStorage.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({
          version: SCHEMA_VERSION,
          items: state.items,
          selectedCommuneId: state.selectedCommuneId,
        }),
      );
    } catch {
      // Modo privado o cuota agotada: la sesión sigue funcionando en memoria.
    }
  }, [state.hydrated, state.items, state.selectedCommuneId]);

  // Datos personales: solo mientras dura la sesión.
  useEffect(() => {
    if (!state.hydrated) return;
    try {
      window.sessionStorage.setItem(
        CUSTOMER_STORAGE_KEY,
        JSON.stringify({
          customer: state.customer,
          delivery: state.delivery,
          payment: state.payment,
        }),
      );
    } catch {
      // Idem.
    }
  }, [state.hydrated, state.customer, state.delivery, state.payment]);

  useEffect(
    () => () => {
      if (undoTimer.current) clearTimeout(undoTimer.current);
    },
    [],
  );

  const lines = useMemo(
    () => buildCartLines(state.items, getProduct),
    [state.items],
  );

  const unavailableItems = useMemo(
    () =>
      state.items.filter((item) => {
        const product = getProduct(item.productId);
        return !product || !product.active || product.price === null;
      }),
    [state.items],
  );

  const commune = useMemo(
    () => getShippingForCommune(state.selectedCommuneId),
    [state.selectedCommuneId],
  );

  const totals = useMemo(
    () => calculateCartTotal(lines, commune?.active ? commune.shippingFee : null),
    [lines, commune],
  );

  const validation = useMemo(
    () =>
      commune && commune.active
        ? validateDeliveryMinimum(
            {
              cartMin: totals.cartMin,
              cartMax: totals.cartMax,
              hasUnpricedItem: totals.hasUnpricedItem,
              itemCount: totals.itemCount,
            },
            commune,
          )
        : null,
    [commune, totals],
  );

  const addItem = useCallback((product: Product, selection: CartSelection) => {
    const requiresAdvancePreparation = computeAdvancePreparation(
      selection.preparationType,
      selection.specialInstructions,
    );
    dispatch({
      type: "addItem",
      item: {
        cartItemId: createCartItemId(),
        productId: product.id,
        quantity: selection.quantity,
        preparationType: selection.preparationType,
        portionInstructions: selection.portionInstructions,
        specialInstructions: selection.specialInstructions,
        requiresAdvancePreparation,
      },
    });
    trackEvent("add_to_cart", { product_id: product.id });
  }, []);

  const updateItemSelection = useCallback(
    (cartItemId: string, selection: CartSelection) => {
      dispatch({
        type: "updateItem",
        cartItemId,
        changes: {
          quantity: selection.quantity,
          preparationType: selection.preparationType,
          portionInstructions: selection.portionInstructions,
          specialInstructions: selection.specialInstructions,
          requiresAdvancePreparation: computeAdvancePreparation(
            selection.preparationType,
            selection.specialInstructions,
          ),
        },
      });
    },
    [],
  );

  const updateQuantity = useCallback(
    (cartItemId: string, quantity: number) => {
      const item = state.items.find((entry) => entry.cartItemId === cartItemId);
      if (!item) return;
      const product = getProduct(item.productId);
      if (!product) return;
      const { minimum } = getQuantityRules(product, item.preparationType);
      const next = Math.max(minimum, Math.round(quantity * 100) / 100);
      dispatch({ type: "updateItem", cartItemId, changes: { quantity: next } });
      trackEvent("update_quantity", { product_id: product.id });
    },
    [state.items],
  );

  const removeItem = useCallback(
    (cartItemId: string) => {
      const index = state.items.findIndex((item) => item.cartItemId === cartItemId);
      if (index < 0) return;
      const item = state.items[index];
      const product = getProduct(item.productId);
      setLastRemoved({ item, index, productName: product?.name ?? "Producto" });
      dispatch({ type: "removeItem", cartItemId });
      trackEvent("remove_from_cart", { product_id: item.productId });

      if (undoTimer.current) clearTimeout(undoTimer.current);
      undoTimer.current = setTimeout(() => setLastRemoved(null), 8000);
    },
    [state.items],
  );

  const undoRemove = useCallback(() => {
    if (!lastRemoved) return;
    dispatch({ type: "restoreItem", item: lastRemoved.item, index: lastRemoved.index });
    setLastRemoved(null);
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, [lastRemoved]);

  const dismissUndo = useCallback(() => setLastRemoved(null), []);

  const clearCart = useCallback(() => dispatch({ type: "clearCart" }), []);

  const setCommune = useCallback((communeId: string | null) => {
    dispatch({ type: "setCommune", communeId });
    if (communeId) trackEvent("select_commune", { commune_id: communeId });
  }, []);

  const setCustomer = useCallback(
    (changes: Partial<CustomerData>) => dispatch({ type: "setCustomer", changes }),
    [],
  );

  const setDelivery = useCallback(
    (changes: Partial<DeliveryData>) => dispatch({ type: "setDelivery", changes }),
    [],
  );

  const setPayment = useCallback((method: PaymentData["method"]) => {
    dispatch({ type: "setPayment", method });
    if (method) trackEvent("payment_method_selected", { method });
  }, []);

  const value = useMemo<OrderContextValue>(
    () => ({
      hydrated: state.hydrated,
      items: state.items,
      lines,
      totals,
      commune,
      validation,
      minimumSatisfied: validation?.status === "SAFE",
      customer: state.customer,
      delivery: state.delivery,
      payment: state.payment,
      unavailableItems,
      lastRemoved,
      addItem,
      updateItemSelection,
      updateQuantity,
      removeItem,
      undoRemove,
      dismissUndo,
      clearCart,
      setCommune,
      setCustomer,
      setDelivery,
      setPayment,
    }),
    [
      state.hydrated,
      state.items,
      state.customer,
      state.delivery,
      state.payment,
      lines,
      totals,
      commune,
      validation,
      unavailableItems,
      lastRemoved,
      addItem,
      updateItemSelection,
      updateQuantity,
      removeItem,
      undoRemove,
      dismissUndo,
      clearCart,
      setCommune,
      setCustomer,
      setDelivery,
      setPayment,
    ],
  );

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export const useOrder = (): OrderContextValue => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder debe usarse dentro de OrderProvider.");
  }
  return context;
};
