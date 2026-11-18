# HUELE A PARRILLA — Proyecto maestro de base de datos de clientes e inteligencia comercial

> Documento de requisitos entregado por el dueño el 18-11-2026.
> Es la referencia para construir el CRM. **La construcción espera el archivo
> con los datos (conversaciones y registros de pedidos).**
> Requisito adicional del dueño: sistema fácil y cómodo de usar **desde el teléfono**.

- Fecha de referencia: 17 de noviembre de 2026
- Moneda: Peso chileno (CLP)
- Mercado: Santiago, Región Metropolitana, Chile

## 1. Objetivo del proyecto

Construir una base de datos histórica y actualizable de Huele a Parrilla, a partir de conversaciones y registros de pedidos.

El sistema debe permitir:

- Identificar clientes únicos.
- Registrar todas sus compras históricas.
- Calcular frecuencia y recurrencia.
- Calcular ticket promedio por cliente y general.
- Identificar cortes favoritos.
- Calcular kilos y facturación por producto.
- Analizar comunas y zonas de despacho.
- Segmentar clientes por valor y comportamiento.
- Detectar clientes inactivos.
- Identificar oportunidades de venta cruzada.
- Preparar campañas personalizadas de WhatsApp.
- Analizar evolución de ventas y retención.

**Principio fundamental:** no confundir pedidos, clientes únicos, cotizaciones, abonos, correcciones y pagos. Los datos deben ser verificables y trazables.

## 2. Información de la empresa

- Nombre: Huele a Parrilla.
- Modelo: carnicería virtual, sin tienda física.
- Operación: venta online con despacho a domicilio en Santiago de Chile.
- Origen de la carne: Osorno, sur de Chile.
- Propuesta comercial: carne fresca, cortes limpios, atención personalizada, puntualidad y confianza.
- Canales comerciales: WhatsApp, Instagram y Facebook.
- Categorías: vacuno, cerdo, pollo, embutidos y subproductos.

## 3. Indicadores históricos previamente analizados

Proceden de un análisis anterior: son una **muestra**, no un cierre actualizado a noviembre.

| Indicador | Valor |
|---|---|
| Tickets históricos analizados | 214 |
| Ventas asociadas | $26.201.106 |
| Ticket promedio | $122.435 |
| Ticket mediano | $98.231 |
| Pedidos con detalle de productos | 87 |
| Líneas de productos analizadas | 333 |
| Ventas de productos en esa muestra | $10.050.803 |
| Despachos asociados a la muestra | $396.006 |

**Importante:** no sumar estos resultados a nuevos pedidos sin verificar si existe superposición de registros.

## 4. Ranking histórico de productos por ingresos

| Producto | Ingresos | Apariciones | Kilos aprox. |
|---|---|---|---|
| Lomo vetado | $1.139.666 | 24 | 68,15 |
| Tomahawk | $968.026 | 19 | 64,61 |
| Filete | $813.998 | 15 | 45,56 |
| Entraña | $745.260 | 16 | 43,94 |
| Punta de ganso | $736.731 | 21 | 49,16 |
| Arrachera | $582.707 | 17 | 43,15 |
| Malaya de cerdo | $530.578 | 17 | 40,77 |
| Asado de tira | $509.111 | 18 | 42,55 |

Los ocho productos representaban ~60% de la facturación de productos de la muestra.

Participación histórica por familia (ingresos, no unidades): Vacuno 85,6% · Cerdo 10,1% · Pollo 2,5% · Embutidos 1,7%.

## 5. Arquitectura de la base de datos

Tablas relacionadas, no una sola hoja mezclada.

### CLIENTES
cliente_id (único y permanente), nombre_completo, nombre_normalizado, teléfono, teléfono_normalizado, dirección_principal, comuna, región, referencias_domicilio, fecha_primera_compra_confirmada, fecha_última_compra_confirmada, cantidad_pedidos_confirmados, facturación_acumulada, ticket_promedio, ticket_mediano, kilos_acumulados, producto_favorito_por_ingresos, producto_favorito_por_frecuencia, producto_favorito_por_kilos, categoría_favorita, método_pago_habitual, intervalo_promedio_entre_compras, días_desde_última_compra, segmento_RFM, estado_cliente, observaciones, fuente_registro, confianza_identificación, consentimiento_comercial.

Nunca usar únicamente el nombre como identificador único.

### PEDIDOS
pedido_id, cliente_id, fecha_pedido, fecha_despacho, estado_pedido, comuna_entrega, dirección_entrega, subtotal_productos, descuentos, costo_despacho, total_final, abonos, saldo_pendiente, monto_pagado, medio_pago, estado_pago, observaciones, fuente_original, identificador_fuente, fecha_extracción, estado_validación.

Distinguir fecha de pedido de fecha efectiva de despacho. No marcar un pedido como entregado o pagado solo porque tiene un total calculado.

### DETALLE DE PEDIDOS (una fila por producto dentro de cada pedido)
detalle_id, pedido_id, producto_id, nombre_original_producto, producto_normalizado, familia, peso_kg, cantidad_unidades, formato, precio_unitario, subtotal_línea, descuento_línea, es_regalo, especificaciones_corte, observaciones, estado_validación_precio.

Especificaciones a conservar siempre (ejemplos): filete entero; lomo vetado en medallones; asado de tira ventana; molida porcionada en 500 g; pollo sin hueso; corte limpio; tomahawk por pieza; punta de ganso por pieza.

### PRODUCTOS
producto_id, nombre_estandarizado, familia, subcategoría, sinónimos, unidad_base, venta_por_pieza_o_kilo, precio_vigente, fecha_vigencia_precio, costo_proveedor (si existe), margen_estimado (si existe).

Normalización:
- "Tomahawks" / "Tomahawk" → Tomahawk.
- "Punta picana" → Punta picana (no mezclar con punta de ganso).
- "Pollo barriga" → corte de **vacuno**, no pollo.
- "Entrecot" → Entrecot.
- "Asado de tira ventana" → variante ventana del asado de tira.
- "Molida tártaro" → Molida tártaro.
- "Malaya de cerdo" y "malaya de vacuno" → productos diferentes.

### PAGOS
pago_id, pedido_id, fecha_pago, importe, tipo_pago (abono, pago parcial, pago final, devolución), medio_pago, referencia_pago, estado_conciliación.

### INTERACCIONES COMERCIALES
interacción_id, cliente_id, fecha, canal, motivo, producto_consultado, respuesta, resultado, seguimiento_pendiente, fecha_próximo_contacto. Incluye conversaciones y oportunidades que no terminaron en venta.

## 6. Reglas críticas de extracción y validación

1. Un pedido repetido en una conversación no equivale a una nueva compra.
2. Una corrección de precio actualiza el pedido original.
3. Un abono no es un descuento ni una nueva venta.
4. El despacho se registra separado del valor de los productos.
5. Los regalos se registran con importe cobrado cero.
6. Las cotizaciones no se incluyen como ventas confirmadas.
7. Los pedidos pendientes conservan su estado.
8. No inferir fechas exactas si solo aparece el día de la semana.
9. No inventar teléfonos, direcciones, precios ni pesos.
10. Conservar el texto original para auditoría.
11. Registrar diferencias entre total declarado y total recalculado.
12. Pedidos con mismo cliente, productos, pesos y montos pueden ser duplicados: investigar antes de consolidar.
13. Pedidos de una empresa y de una persona deben poder vincularse sin confundir identidades.
14. Nombres similares solo se fusionan con evidencia suficiente.
15. Mantener historial de modificaciones.
16. No almacenar información sensible innecesaria para el análisis comercial.
17. El uso de teléfonos para campañas respeta permisos y preferencias del cliente.

## 7. Métricas comerciales obligatorias

- **Ventas:** facturación total; sin despacho; por mes; por día de despacho; por comuna; por categoría; por producto.
- **Clientes:** clientes únicos; nuevos por mes; recurrentes; tasa de recompra; frecuencia media; ticket promedio por cliente; facturación acumulada por cliente; días desde última compra; tiempo promedio entre compras; clientes que no volvieron.
- **Productos:** kilos por producto; facturación por producto; pedidos que contienen cada corte; clientes únicos por corte; precio promedio real por kilo; combinaciones compradas juntas; productos que generan tickets más altos.
- **Logística:** pedidos por comuna; ingresos por despacho; despacho promedio; entregas por zona; días de mayor actividad.
- **Finanzas:** ventas brutas; descuentos; abonos; saldos pendientes; ventas efectivamente cobradas; costos de proveedor (si existen); margen bruto real (solo con costos conocidos).

## 8. Segmentación RFM

Recencia, Frecuencia, Valor monetario. Segmentos dinámicos:
VIP · Frecuentes · Nuevos · Potenciales VIP · En crecimiento · En riesgo · Inactivos · Recuperados.

Umbrales calibrados con la distribución real de frecuencia, ticket y recencia — no arbitrarios.

## 9. Personalización comercial

Preferencias construidas desde compras observadas (son **hipótesis**, no declaraciones confirmadas):
- Entrecot frecuente → ofertas de entrecot y cortes relacionados.
- Tomahawk → campañas premium parrilleras.
- Filete y lomo liso → cortes magros o preparaciones específicas.
- Asado de tira y costillar → parrilla familiar.
- Pollo y carne molida → abastecimiento semanal.

## 10. Paneles de control

- **Ejecutivo:** ventas, pedidos, ticket promedio, clientes únicos, recompra, crecimiento mensual.
- **Clientes:** ranking por facturación, frecuencia, ticket, recencia, segmentos RFM.
- **Productos:** ranking por ingresos, kilos, frecuencia, compradores y combinaciones.
- **Geográfico:** comunas, clientes, pedidos, ingresos, costo de despacho.
- **Retención:** cohortes de primera compra, segunda compra, tiempo de recompra, clientes en riesgo.
- **Calidad de datos:** duplicados, sin fecha, pedidos incompletos, precios inconsistentes, totales pendientes.

## 11. Entregables esperados

1. Base de clientes únicos.
2. Historial maestro de pedidos.
3. Detalle completo de productos por pedido.
4. Catálogo normalizado.
5. Historial de pagos y abonos.
6. Ranking de clientes por frecuencia y valor.
7. Ranking de productos por facturación, kilos y compradores.
8. Segmentación RFM.
9. Panel de indicadores comerciales.
10. Registro de errores y datos pendientes de validación.
11. Sistema de actualización de nuevos pedidos sin duplicarlos.

## 12. Política de confiabilidad

Cada dato se distingue como: **Confirmado** (explícito en la fuente) · **Calculado** (derivado de confirmados) · **Inferido** (interpretación pendiente de validación) · **Pendiente** (información insuficiente) · **Corregido** (actualizado por instrucción posterior).

Nunca presentar una inferencia como dato confirmado.

## 13. Resultado final buscado

Un CRM comercial y plataforma de inteligencia de ventas que responda, entre otras:

- ¿Quiénes son mis 20 clientes más valiosos?
- ¿Cuántas veces compró cada cliente?
- ¿Quiénes compraban mensualmente y dejaron de hacerlo?
- ¿Qué cortes prefiere cada cliente?
- ¿Cuánto dinero ha generado cada cliente desde su primera compra?
- ¿Cuánto tarda un cliente en hacer su segunda compra?
- ¿Qué productos suelen comprarse juntos?
- ¿Qué comuna tiene el mejor ticket promedio?
- ¿Qué porcentaje de ventas proviene de clientes recurrentes?
- ¿Qué clientes tienen mayor probabilidad de volver a comprar?

Objetivo: decisiones de ventas, fidelización, marketing y abastecimiento basadas en información histórica verificable.
