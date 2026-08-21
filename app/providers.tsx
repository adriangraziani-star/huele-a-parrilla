"use client";

import type { ReactNode } from "react";

import { OrderProvider } from "@/store/order-store";
import { UiProvider } from "@/store/ui-store";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <OrderProvider>
      <UiProvider>{children}</UiProvider>
    </OrderProvider>
  );
}
