import type { Metadata } from "next";

import { LegalPage } from "@/components/layout/LegalPage";
import {
  businessConfig,
  deliveryDaysLabel,
  deliveryWindowLabel,
} from "@/data/business";

export const metadata: Metadata = {
  title: "Términos y condiciones | Huele a Parrilla",
  description:
    "Condiciones de las solicitudes de pedido, cotizaciones aproximadas y despachos.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <LegalPage title="Términos y condiciones">
      <p>
        El pedido armado en esta página constituye una <strong>solicitud</strong> y
        no una compra confirmada. La confirmación y la coordinación final se
        realizan por WhatsApp con nuestro equipo.
      </p>
      <p>
        Los valores mostrados son <strong>estimados</strong> cuando el pedido
        incluye productos que se comercializan por pieza de peso variable. El monto
        definitivo se confirma según el peso real de los productos preparados.
      </p>
      <p>
        Los despachos se realizan los días {deliveryDaysLabel}, aproximadamente
        entre las {deliveryWindowLabel}. La hora exacta puede variar según la ruta
        de reparto y la jornada disponible se coordina contigo por WhatsApp.
      </p>
      <p>
        Los pedidos que incluyan porcionado o indicaciones especiales requieren al
        menos {businessConfig.advanceHours} horas de anticipación. El pedido mínimo
        depende de la comuna de entrega y considera solamente el valor de los
        productos, sin incluir el despacho.
      </p>
      <p className="rounded-[var(--radius-field)] border border-copper/40 bg-copper/10 px-4 py-3 text-[0.9rem] text-charcoal">
        <strong>Documento pendiente.</strong> Los términos legales definitivos serán
        publicados por {businessConfig.name}. Este resumen describe las condiciones
        comerciales vigentes en la página.
      </p>
    </LegalPage>
  );
}
