/**
 * Configuración general del negocio.
 * Fuente única: no repetir el número de WhatsApp, los días ni el horario en
 * ningún componente.
 */
export const businessConfig = {
  name: "Huele a Parrilla",
  /**
   * Dirección pública del sitio. Se usa para las URL absolutas que necesitan
   * Google y las vistas previas al compartir el enlace por WhatsApp.
   * Se define en la variable de entorno NEXT_PUBLIC_SITE_URL al publicar.
   */
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hueleaparrilla.cl").replace(
    /\/+$/,
    "",
  ),
  tagline: "Carne fresca del sur, directo a tu puerta.",
  /** Número normalizado para wa.me (sin +, sin espacios, sin guiones). */
  whatsapp: "56930169902",
  /** Versión legible para mostrar en la interfaz. */
  whatsappDisplay: "+56 9 3016 9902",
  origin: "Osorno, sur de Chile",
  deliveryDays: ["martes", "jueves", "viernes", "sábado"] as const,
  deliveryWindow: { from: "13:00", to: "19:00" },
  advanceHours: 14,
  socialLinks: {
    instagram: null as string | null,
    facebook: null as string | null,
  },
} as const;

/** "martes, jueves, viernes y sábado" */
export const deliveryDaysLabel = (() => {
  const days = [...businessConfig.deliveryDays];
  const last = days.pop();
  return `${days.join(", ")} y ${last}`;
})();

/** "13:00 a 19:00 hrs" */
export const deliveryWindowLabel = `${businessConfig.deliveryWindow.from} a ${businessConfig.deliveryWindow.to} hrs`;

/** "13:00–19:00 hrs aprox." */
export const deliveryWindowShort = `${businessConfig.deliveryWindow.from}–${businessConfig.deliveryWindow.to} hrs aprox.`;
