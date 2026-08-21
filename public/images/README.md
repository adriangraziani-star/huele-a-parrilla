# Imágenes del sitio

Coloca aquí los archivos definitivos **con exactamente estos nombres**. Mientras
un archivo no exista, la página muestra automáticamente un respaldo con los
colores de la marca: **nunca se genera una imagen artificial ni se usa una
fotografía de stock**.

| Archivo | Dónde aparece | Qué foto va aquí |
|---|---|---|
| `logo-huele-a-parrilla.png` | Header, hero, footer y páginas legales | El logo oficial (llama roja + tipografía). PNG con fondo transparente. |
| `hero-campo-sur.jpg` | Fotografía principal de la portada | La foto más ambiental y luminosa: carne al aire libre, con pasto o entorno de campo. Es la imagen más pesada del sitio, conviene exportarla optimizada. |
| `editorial-cortes.jpg` | Franja "Cortes seleccionados" | Un corte limpio y bien presentado, por ejemplo sobre fondo blanco. |
| `editorial-origen.jpg` | Franja "Del sur de Chile a tu mesa" | Otra pieza entera, presentada con la misma limpieza. |
| `editorial-preparacion.jpg` | Franja "Preparados especialmente para ti" | Un corte sobre tabla de madera o superficie de trabajo. |
| `cta-parrilla.jpg` | Sección final "Tu próxima parrilla comienza aquí" | La foto más dramática y apetitosa: corte grande, luz cálida. |

Cambiar la asignación es solo cambiar el nombre del archivo: si prefieres otra
foto en la portada, renómbrala a `hero-campo-sur.jpg` y listo.

## Formatos y peso

- `.jpg` para fotografías, `.png` para el logo (necesita transparencia).
- La portada conviene que tenga al menos 2000 px de ancho; las franjas
  editoriales, 1200 px.
- Exporta las fotos comprimidas: son lo único que puede volver lenta la página.

## Cómo están integradas hoy

| Archivo | Fotografía actual |
|---|---|
| `logo-huele-a-parrilla.png` | Logo oficial |
| `hero-campo-sur.jpg` | Entraña en plato, al aire libre |
| `editorial-cortes.jpg` | Entrecot con hueso |
| `editorial-origen.jpg` | Flat iron sobre mármol |
| `editorial-preparacion.jpg` | Tomahawk sobre tabla |
| `cta-parrilla.jpg` | Tomahawk sobre tabla |

Todas fueron reescaladas y recomprimidas: las originales sumaban unos 27 MB, lo
que habría hecho la página muy lenta. Al recodificarlas también se eliminó la
metadata de las fotos de teléfono, que incluía **coordenadas GPS** del lugar
donde fueron tomadas. Si más adelante reemplazas alguna, conviene repetir ese
paso antes de publicarla.

Cuando una foto vertical se muestra en una franja apaisada, el recorte se
controla con la propiedad `focus` del componente `EditorialImage`
(por ejemplo `focus="center 30%"` para que se vea la carne y no la tabla).

## Cómo se comportan las fotos en el diseño

Sobre cada fotografía se aplica un velo oscuro de la paleta de marca. Está
calibrado para que el texto blanco se lea **tanto sobre fotos claras** (un corte
sobre fondo blanco o mármol) **como sobre fotos oscuras** (una tabla de madera
sobre granito), y para que ambas convivan en la misma franja sin que una parezca
apagada al lado de la otra. No hace falta que edites las fotos para oscurecerlas.

## Reglas de uso

- **El catálogo no lleva fotografías.** Las imágenes de esta carpeta son
  material editorial de marca: no deben usarse como foto de un producto
  concreto ni como miniatura de una tarjeta.
- Si en el futuro se agregan fotos de producto, se cargan en `data/products.ts`
  cambiando `image: null` por la ruta del archivo. La interfaz ya está preparada
  para mostrarlas sin modificar ninguna otra lógica.
- El favicon se genera desde el logo oficial una vez que el archivo esté
  disponible.
