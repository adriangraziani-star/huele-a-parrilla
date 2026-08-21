import Link from "next/link";

import { BrandLogo } from "@/components/layout/BrandLogo";
import type { ReactNode } from "react";

/** Estructura mínima compartida por las páginas de contenido legal. */
export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ivory">
      <header className="bg-charcoal">
        <div className="container-page flex h-[68px] items-center">
          <Link href="/" aria-label="Volver al inicio">
            <BrandLogo variant="light" size="sm" />
          </Link>
        </div>
      </header>

      <main className="container-page py-16">
        <div className="container-editorial">
          <h1 className="display-2">{title}</h1>
          <div className="mt-8 space-y-5 text-[0.95rem] leading-relaxed text-charcoal-muted">
            {children}
          </div>
          <Link href="/" className="btn btn-charcoal mt-12">
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
