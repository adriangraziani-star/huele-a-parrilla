import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-charcoal px-6 text-center">
      <BrandLogo variant="light" size="md" />
      <h1 className="display-2 mt-8 text-ivory">No encontramos esta página</h1>
      <p className="mt-3 max-w-sm text-[0.95rem] text-ivory/70">
        Es posible que el enlace haya cambiado. Vuelve al inicio para armar tu
        pedido.
      </p>
      <Link href="/" className="btn btn-primary mt-8">
        Volver al inicio
      </Link>
    </div>
  );
}
