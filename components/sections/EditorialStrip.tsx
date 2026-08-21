import { EditorialImage } from "@/components/sections/EditorialImage";
import { IconAward, IconKnife, IconPin } from "@/components/ui/Icons";

const strips = [
  {
    src: "/images/editorial-cortes.jpg",
    alt: "Cortes de carne recién preparados",
    icon: IconAward,
    title: "Cortes seleccionados",
    body: "Elegimos cada corte por su calidad, frescura y sabor.",
  },
  {
    src: "/images/editorial-origen.jpg",
    alt: "Corte de carne de vacuno sobre superficie de trabajo",
    focus: "center",
    icon: IconPin,
    title: "Del sur de Chile a tu mesa",
    body: "Directo desde Osorno con la frescura que tu parrilla merece.",
  },
  {
    src: "/images/editorial-preparacion.jpg",
    alt: "Corte de carne listo para la parrilla",
    focus: "center 30%",
    icon: IconKnife,
    title: "Preparados especialmente para ti",
    body: "Limpios, parejos y listos para disfrutar.",
  },
];

/** Franja editorial de marca. No son fichas de producto ni thumbnails. */
export function EditorialStrip() {
  return (
    <section aria-label="Nuestra carne" className="grid md:grid-cols-3">
      {strips.map((strip) => (
        <EditorialImage
          key={strip.title}
          src={strip.src}
          alt={strip.alt}
          focus={strip.focus}
          className="min-h-[240px] md:min-h-[320px]"
        >
          <div className="flex min-h-[240px] flex-col justify-end p-6 md:min-h-[320px]">
            <strip.icon className="text-copper" width={24} height={24} />
            <h2 className="display-3 mt-3 text-ivory">{strip.title}</h2>
            <p className="mt-1.5 max-w-xs text-[0.88rem] leading-snug text-ivory/75">
              {strip.body}
            </p>
          </div>
        </EditorialImage>
      ))}
    </section>
  );
}
