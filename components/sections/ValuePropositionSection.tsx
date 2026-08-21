import { IconKnife, IconLeaf, IconTruck } from "@/components/ui/Icons";

const pillars = [
  {
    icon: IconLeaf,
    title: "Origen",
    body: "Carne proveniente del sur de Chile, principalmente de Osorno.",
  },
  {
    icon: IconKnife,
    title: "Preparación",
    body: "Cortes preparados según los requerimientos de cada cliente.",
  },
  {
    icon: IconTruck,
    title: "Entrega",
    body: "Despacho directo al domicilio en Santiago.",
  },
];

export function ValuePropositionSection() {
  return (
    <section className="section bg-ivory">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <div>
            <p className="eyebrow">Nuestra propuesta</p>
            <h2 className="display-2 mt-3">Del sur de Chile a tu mesa</h2>
          </div>
          <div>
            <p className="text-[1.05rem] leading-relaxed text-charcoal-muted">
              En Huele a Parrilla trabajamos mediante pedidos programados,
              seleccionando y preparando nuestros productos para cada jornada de
              despacho. Queremos que recibas carne fresca, cortes limpios y una
              atención cercana, pudiendo indicarnos además cómo prefieres que
              preparemos tu pedido.
            </p>
          </div>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-leather/20 bg-leather/20 md:grid-cols-3">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="bg-cream px-6 py-8">
              <pillar.icon className="text-copper" width={26} height={26} />
              <h3 className="display-3 mt-4">{pillar.title}</h3>
              <p className="mt-2 text-[0.9rem] leading-relaxed text-charcoal-muted">
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
