import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import { businessConfig } from "@/data/business";

export const metadata: Metadata = {
  title: "Política de privacidad | Huele a Parrilla",
  description:
    "Cómo utilizamos los datos que nos entregas para gestionar tu solicitud de pedido.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad">
      <p>
        {businessConfig.name} utiliza los datos que ingresas en esta página
        únicamente para gestionar tu solicitud de pedido y coordinar la entrega:
        nombre, número de WhatsApp, correo electrónico si decides entregarlo,
        comuna, dirección e indicaciones de entrega.
      </p>
      <p>
        La información que completas se mantiene en tu propio navegador durante la
        sesión y se envía a nuestro WhatsApp únicamente cuando tú confirmas el
        mensaje. Esta página no procesa pagos ni solicita datos bancarios,
        contraseñas ni documentos de identidad.
      </p>
      <p className="rounded-[var(--radius-field)] border border-copper/40 bg-copper/10 px-4 py-3 text-[0.9rem] text-charcoal">
        <strong>Documento pendiente.</strong> El texto legal definitivo será
        publicado por {businessConfig.name}. Este resumen describe el
        funcionamiento actual de la página y no reemplaza dicha política.
      </p>
    </LegalPage>
  );
}
