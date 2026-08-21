export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
}

/**
 * Contenido definitivo de preguntas frecuentes.
 * No agregar preguntas ni respuestas que no provengan de información
 * comercial ya confirmada.
 */
export const faq: FaqEntry[] = [
  {
    id: "frescura",
    question: "¿La carne es fresca?",
    answer:
      "Sí. Trabajamos con pedidos programados: seleccionamos y preparamos los productos para cada jornada de despacho, en lugar de mantener stock permanente en vitrina.",
  },
  {
    id: "origen",
    question: "¿De dónde proviene la carne?",
    answer: "Nuestra carne de vacuno proviene del sur de Chile, principalmente de Osorno.",
  },
  {
    id: "porcionado",
    question: "¿Puedo pedir mis cortes porcionados?",
    answer:
      "Sí. En los productos personalizables puedes elegir “Porcionado” e indicarnos con tus propias palabras cómo quieres que lo preparemos, por ejemplo bistecs de aproximadamente dos dedos.",
  },
  {
    id: "pieza-entera",
    question: "¿Puedo pedir la pieza entera?",
    answer:
      "Sí. Puedes seleccionar “Pieza entera” y te entregamos el corte sin porcionar. En algunos productos te informaremos el peso aproximado de la pieza completa antes de agregarla.",
  },
  {
    id: "indicaciones",
    question: "¿Puedo dejar indicaciones especiales?",
    answer:
      "Sí. Cada producto personalizable tiene un campo opcional de indicaciones especiales para pedir cosas como poca grasa o dejar la grasa exterior. Haremos lo posible por respetarlas según las características de cada pieza disponible.",
  },
  {
    id: "anticipacion",
    question: "¿Con cuánto tiempo debo hacer mi pedido?",
    answer:
      "Si tu pedido incluye porcionado o alguna indicación especial, debe realizarse con al menos 14 horas de anticipación.",
  },
  {
    id: "dias",
    question: "¿Qué días despachan?",
    answer: "Realizamos repartos los días martes, jueves, viernes y sábado.",
  },
  {
    id: "horario",
    question: "¿En qué horario despachan?",
    answer: "Nuestros repartos se realizan aproximadamente entre las 13:00 y las 19:00 hrs.",
  },
  {
    id: "hora-exacta",
    question: "¿Puedo elegir una hora exacta de entrega?",
    answer:
      "No. La hora exacta puede variar según la ruta de despacho. Una vez enviada tu solicitud, coordinamos contigo por WhatsApp la jornada disponible.",
  },
  {
    id: "comunas",
    question: "¿A qué comunas despachan?",
    answer:
      "Despachamos a diferentes comunas de Santiago y sectores de la Región Metropolitana. Puedes consultar las condiciones exactas ingresando tu comuna en nuestro buscador de despacho.",
  },
  {
    id: "costo-despacho",
    question: "¿Cuánto cuesta el despacho?",
    answer:
      "El valor depende de tu comuna. Puedes consultarlo directamente antes de enviar tu pedido.",
  },
  {
    id: "minimo",
    question: "¿Existe pedido mínimo?",
    answer:
      "Sí. El pedido mínimo depende de la comuna de entrega y considera solamente el valor de los productos, sin incluir el despacho.",
  },
  {
    id: "local",
    question: "¿Tienen local físico?",
    answer:
      "No. Huele a Parrilla funciona exclusivamente mediante despacho a domicilio dentro de Santiago.",
  },
  {
    id: "pago",
    question: "¿Cómo puedo pagar?",
    answer: "Puedes pagar mediante transferencia o en efectivo, al recibir tu pedido.",
  },
  {
    id: "precios-aproximados",
    question: "¿Por qué algunos precios son aproximados?",
    answer:
      "Algunos cortes se comercializan por pieza completa. Como cada pieza tiene un peso diferente, calculamos un rango usando sus pesos aproximados. El monto definitivo se confirma según el peso real de los productos preparados para tu pedido.",
  },
];
