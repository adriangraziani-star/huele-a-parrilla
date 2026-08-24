const stripTrailingSlashes = (url: string): string => url.replace(/\/+$/, "");

/** Ver la nota de `siteUrl`. */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit && explicit.trim().length > 0) {
    return stripTrailingSlashes(explicit.trim());
  }

  // Vercel expone la dirección de producción del proyecto al compilar.
  const vercel = process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel && vercel.trim().length > 0) {
    return stripTrailingSlashes(`https://${vercel.trim()}`);
  }

  return "http://localhost:3000";
}

/**
 * Configuración general del negocio.
 * Fuente única: no repetir el número de WhatsApp, los días ni el horario en
 * ningún componente.
 */
export const businessConfig = {
  name: "Huele a Parrilla",
  /**
   * Dirección pública del sitio. Se usa para las URL absolutas que necesitan
   * Google y la vista previa que aparece al compartir el enlace.
   *
   * Se resuelve sola, en este orden:
   * 1. NEXT_PUBLIC_SITE_URL, cuando ya existe un dominio propio.
   * 2. La dirección que asigna Vercel al publicar, de modo que el sitio
   *    funcione correctamente sin configurar nada.
   * 3. El servidor local, durante el desarrollo.
   *
   * Nunca se escribe aquí un dominio a mano: mientras no exista uno confirmado,
   * inventarlo generaría enlaces rotos en Google y en las vistas previas.
   */
  siteUrl: resolveSiteUrl(),
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
