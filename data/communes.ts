import type { Commune } from "@/types";

const commune = (name: string, slug: string, zoneId: number): Commune => ({
  id: slug,
  name,
  slug,
  zoneId,
  active: true,
  deliveryNote: null,
});

export const communes: Commune[] = [
  // Zona 1
  commune("Providencia", "providencia", 1),
  commune("Ñuñoa", "nunoa", 1),
  commune("Santiago", "santiago", 1),
  commune("Macul", "macul", 1),
  commune("San Miguel", "san-miguel", 1),
  commune("La Reina", "la-reina", 1),
  commune("Las Condes", "las-condes", 1),
  commune("Estación Central", "estacion-central", 1),
  commune("Vitacura", "vitacura", 1),
  commune("Recoleta", "recoleta", 1),
  commune("San Joaquín", "san-joaquin", 1),

  // Zona 2
  commune("Peñalolén", "penalolen", 2),
  commune("La Florida", "la-florida", 2),
  commune("San Ramón", "san-ramon", 2),
  commune("La Cisterna", "la-cisterna", 2),
  commune("Pedro Aguirre Cerda", "pedro-aguirre-cerda", 2),
  commune("Independencia", "independencia", 2),
  commune("Huechuraba", "huechuraba", 2),
  commune("Cerrillos", "cerrillos", 2),
  commune("Quinta Normal", "quinta-normal", 2),

  // Zona 3
  commune("Lo Barnechea", "lo-barnechea", 3),
  commune("Puente Alto", "puente-alto", 3),
  commune("Maipú", "maipu", 3),
  commune("Pudahuel", "pudahuel", 3),
  commune("Quilicura", "quilicura", 3),
  commune("Conchalí", "conchali", 3),
  commune("Renca", "renca", 3),
  commune("Cerro Navia", "cerro-navia", 3),
  commune("Lo Prado", "lo-prado", 3),
  commune("Lo Espejo", "lo-espejo", 3),
  commune("El Bosque", "el-bosque", 3),
  commune("La Granja", "la-granja", 3),
  commune("San Bernardo", "san-bernardo", 3),

  // Zona 4
  commune("Colina", "colina", 4),
  // Chicureo no es una comuna administrativa independiente, pero comercialmente
  // se utiliza como zona de entrega y se mantiene seleccionable.
  commune("Chicureo", "chicureo", 4),
  commune("Lampa", "lampa", 4),
  commune("Talagante", "talagante", 4),
  commune("Peñaflor", "penaflor", 4),
  commune("Padre Hurtado", "padre-hurtado", 4),
  commune("Calera de Tango", "calera-de-tango", 4),
  commune("Pirque", "pirque", 4),
];

export const getCommune = (communeId: string | null): Commune | null =>
  communeId ? communes.find((item) => item.id === communeId) ?? null : null;
