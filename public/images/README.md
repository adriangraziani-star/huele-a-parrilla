# Imágenes del sitio

Coloca aquí los archivos definitivos. Mientras un archivo no exista, la página
muestra automáticamente un respaldo con los colores de la marca: **nunca se
genera una imagen artificial ni se usa una fotografía de stock**.

| Archivo | Dónde aparece | Recomendación |
|---|---|---|
| `logo-huele-a-parrilla.png` | Header, hero, footer y páginas legales | PNG con fondo transparente. Sin este archivo se muestra el nombre en tipografía de marca. |
| `hero-campo-sur.jpg` | Fotografía principal del hero | Horizontal, mín. 2000 px de ancho. Corte real en primer plano con el campo del sur de fondo. Es la imagen más pesada del sitio: exportarla optimizada (idealmente `.webp`). |
| `editorial-cortes.jpg` | Franja "Cortes seleccionados" | Vertical u horizontal, mín. 1200 px. |
| `editorial-origen.jpg` | Franja "Del sur de Chile a tu mesa" | Ídem. |
| `editorial-preparacion.jpg` | Franja "Preparados especialmente para ti" | Ídem. |
| `cta-parrilla.jpg` | Sección final "Tu próxima parrilla comienza aquí" | Horizontal, mín. 1600 px. |

## Reglas de uso

- **El catálogo no lleva fotografías.** Las imágenes de esta carpeta son material
  editorial de marca: no deben usarse como foto de un producto concreto.
- Si en el futuro se agregan fotos de producto, se cargan en `data/products.ts`
  cambiando `image: null` por la ruta del archivo. La interfaz ya está preparada
  para mostrarlas sin modificar ninguna otra lógica.
- El favicon se genera desde el logo oficial una vez que el archivo esté
  disponible.
