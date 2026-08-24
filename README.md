# Huele a Parrilla — Web V1

Carnicería digital chilena. La página permite descubrir la marca, explorar el
catálogo, armar un pedido, personalizar los cortes, obtener una cotización
aproximada, consultar las condiciones de despacho de la comuna, completar los
datos del cliente y enviar la solicitud estructurada por WhatsApp.

> **La web no procesa pagos.** Genera una **solicitud de pedido**: la
> confirmación y la coordinación de la jornada de despacho ocurren por WhatsApp.

---

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4** con design tokens propios
- **Vitest** para la lógica comercial
- Sin backend, sin base de datos y sin autenticación: la V1 funciona
  completamente del lado del cliente.

## Comandos

```bash
npm install       # instalar dependencias
npm run dev       # entorno de desarrollo en http://localhost:3000
npm run build     # build de producción
npm run start     # servir el build
npm run lint      # ESLint
npm run typecheck # TypeScript sin emitir
npm test          # pruebas de la lógica comercial
```

---

## Dónde editar cada cosa

Toda la información comercial vive en `data/`. **Ningún componente escribe
precios, productos, comunas ni condiciones a mano.**

| Qué quieres cambiar | Archivo |
|---|---|
| Productos, precios, pesos, modalidad de venta, disponibilidad | `data/products.ts` |
| Categorías del catálogo | `data/categories.ts` |
| Comunas y a qué zona pertenece cada una | `data/communes.ts` |
| Pedido mínimo y valor de despacho por zona | `data/zones.ts` |
| WhatsApp, días, horario, anticipación, redes sociales | `data/business.ts` |
| Preguntas frecuentes | `data/faq.ts` |
| Colores, tipografías y estilos base | `app/globals.css` |
| Logo y fotografías | `public/images/` (ver su `README.md`) |

### Cambiar un precio

```ts
// data/products.ts
piece({ id: "filete", name: "Filete", categoryId: "vacuno", price: 18990, ... })
```

Ese único cambio actualiza automáticamente el catálogo, el carrito, el
cotizador, el resumen final y el mensaje de WhatsApp.

### Cambiar las condiciones de una zona

```ts
// data/zones.ts
{ id: 2, internalName: "Zona 2", minimumOrder: 50000, shippingFee: 5990 }
```

Se aplica de inmediato a todas las comunas de esa zona. Para mover una comuna de
zona basta con cambiar su `zoneId` en `data/communes.ts`.

### Cambiar el número de WhatsApp

```ts
// data/business.ts
whatsapp: "56930169902",        // sin +, sin espacios, sin guiones
whatsappDisplay: "+56 9 3016 9902",
```

### Desactivar un producto temporalmente

Cambia `active: false`. El producto sigue registrado, aparece marcado como
**No disponible temporalmente** y no puede agregarse al pedido. Un producto con
`price: null` no se publica en absoluto.

### Agregar fotografías al catálogo (a futuro)

La V1 **no usa fotografías en las tarjetas**: es una decisión de diseño. La
arquitectura ya está lista, así que basta con reemplazar `image: null` por la
ruta del archivo y la tarjeta la mostrará sin tocar ninguna otra lógica.

---

## Modalidades de venta

El catálogo distingue entre **cómo se valoriza** un producto y **cómo puede
comprarlo el cliente**. El motor de cálculo delega en la modalidad declarada:

| Modalidad | Comportamiento | Ejemplo |
|---|---|---|
| `KG_STANDARD` | Se vende por kilogramo, desde 1 kg | Lomo Vetado |
| `PIECE_VARIABLE_WEIGHT` | Se vende por pieza, valorizada por kilogramo → rango | Filete, Estomaguillo |
| `KG_WITH_WHOLE_PIECE_REFERENCE` | Por kilogramo; al elegir *Pieza entera* pasa al rango real de la pieza | Asado de Tiras |
| `FIXED_UNIT` | Precio fijo por unidad | Pata de Vacuno |
| `FIXED_PACKAGE` | Presentación fija | Carbón (bolsa de 2,5 kg) |
| `PIECE_BY_WEIGHT_WITHOUT_CONFIRMED_RANGE` | Sin rango confirmado: muestra *Valor final según peso real* | Pollo Entero |

Reglas que el código protege explícitamente:

- **Nunca se promedia un rango.** Se suman por separado los extremos mínimo y
  máximo del pedido.
- **Un producto sin estimación posible jamás se muestra como `$0`.**
- **El despacho nunca sirve para completar el pedido mínimo:** el mínimo se
  valida solo contra el subtotal de productos.
- El monto faltante es siempre `pedidoMínimo − subtotalMínimo`, de modo que el
  mínimo quede asegurado incluso en el peor escenario de pesaje.
- La preparación (pieza entera / porcionado) **no modifica el precio**.

---

## Estructura del proyecto

```
app/            Rutas: página principal, legales y 404
components/
  layout/       Header, footer, logo
  sections/     Hero, propuesta, cómo funciona, franjas editoriales, FAQ, CTA
  catalog/      Catálogo, tarjeta de producto, panel de personalización
  cart/         Drawer del pedido, líneas, resumen de valores, barra móvil
  delivery/     Consulta de comuna y validación del mínimo
  forms/        Datos del cliente
  order/        Resumen final y envío a WhatsApp
  ui/           Modal, acordeón, selector de cantidad, avisos, toasts, iconos
data/           Fuente única de verdad comercial
lib/            Cálculo, despacho, formato, texto, teléfono, WhatsApp, analítica
store/          Estado del pedido y estado de interfaz
types/          Tipos del dominio
hooks/          Utilidades de React reutilizables
```

### Estado y persistencia

- **Carrito y comuna** → `localStorage` (`hap-cart-v1`, con número de versión
  para futuras migraciones).
- **Datos personales** → `sessionStorage`: no se conservan más allá de la sesión.
- El catálogo **no** se persiste. Al restaurar el pedido, cada línea se resuelve
  contra los datos vigentes, así que un cambio de precio se refleja de inmediato
  y un producto retirado se marca como no disponible.

---

## Pruebas

`npm test` cubre la lógica crítica (76 casos):

- **`pricing.test.ts`** — la auditoría matemática completa: Filete, Tomahawk,
  Vacío Argentino, Estomaguillo, Asado de Tiras por kilo y en pieza entera,
  Costillar Americano, Flat Iron, Punta de Ganso, Lengua, Carbón, Pata de
  Vacuno, Lomo Vetado, pedidos mixtos con y sin despacho, y productos sin
  estimación posible.
- **`delivery.test.ts`** — condiciones por zona, búsqueda sin tildes y los cinco
  estados de validación del mínimo (`EMPTY_CART`, `SAFE`, `UNCERTAIN`,
  `BELOW_MINIMUM`, `UNKNOWN_VALUE`).
- **`whatsapp.test.ts`** — estructura del mensaje, omisión de campos vacíos,
  codificación de tildes y ñ, normalización de teléfonos y saneamiento de texto.
- **`catalog.test.ts`** — integridad de los datos contra las tablas oficiales de
  precios y rangos.

---

## Analítica

`lib/analytics.ts` expone `trackEvent()` con los eventos del embudo ya
instrumentados. **No hay ningún proveedor conectado**: para habilitar Meta Pixel,
Google Analytics o GTM basta con llamar a `setAnalyticsSink()` con las
credenciales correspondientes. Nunca se envían datos personales.

---

---

## Publicar la página en internet

El proyecto está listo para Vercel sin configuración adicional: detecta Next.js
solo, y el repositorio tiene una única rama que además es la principal, así que
la toma automáticamente.

### Primera publicación

1. Entra a **vercel.com** e inicia sesión con la cuenta de GitHub.
2. **Add New → Project** e importa `adriangraziani-star/huele-a-parrilla`.
3. No cambies nada en la pantalla de configuración: el framework, el comando de
   compilación y la carpeta de salida se detectan solos.
4. **Deploy**. En un par de minutos queda en línea en una dirección terminada
   en `.vercel.app`.

Desde ahí, cada cambio que se suba a la rama principal se publica solo.

### Después de la primera publicación

Agrega la variable de entorno `NEXT_PUBLIC_SITE_URL` con la dirección
definitiva (**Settings → Environment Variables**) y vuelve a publicar. Es lo que
hace que, al pegar el enlace en WhatsApp o Instagram, aparezca la vista previa
con la fotografía en vez de un enlace pelado. También alimenta el `sitemap.xml`
que lee Google.

```
NEXT_PUBLIC_SITE_URL = https://hueleaparrilla.cl
```

### Dominio propio

En **Settings → Domains** se conecta el dominio y Vercel indica qué registros
DNS crear donde esté comprado. El certificado HTTPS lo emite y renueva solo.

### Verificado antes de publicar

Un clon limpio del repositorio instala con `npm ci` y compila con `npm run build`
sin errores ni advertencias, que es exactamente lo que ejecuta el servidor.

## Contenido pendiente

Estos elementos quedan intencionalmente a la espera de material oficial. La
página funciona sin ellos y los incorpora sin cambios de código:

- **Logo y fotografías** — ver `public/images/README.md`. Sin los archivos se
  muestra un respaldo tipográfico y de color; no se generan imágenes artificiales.
- **Descripciones de producto** — todos los productos nacen con
  `shortDescription: null`.
- **Textos legales definitivos** — las páginas de privacidad y términos describen
  el funcionamiento real y quedan marcadas como pendientes.
- **Redes sociales** — `data/business.ts` los tiene en `null`; el footer solo
  muestra los enlaces configurados.
- **Productos sin precio confirmado** — Tuétano, Charchas, Chunchules, Hígado,
  Entraña de Cerdo y Longaniza Ahumada están registrados con `active: false`.

## Fuera del alcance de la V1

Pago online, usuarios registrados, panel administrativo, reserva de horario,
inventario en tiempo real y programas de fidelización. La arquitectura permite
incorporarlos después sin rehacer el sitio.
