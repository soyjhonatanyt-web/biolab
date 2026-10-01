(() => {
  "use strict";

  // Coverage is design metadata; students are assessed through evidence and situations.
  const questions = [
    {
      id: "carb-condensation", category: "carbohidratos", visual: "condensation",
      context: "En el Constructor unes una glucosa y una fructosa. Las dos unidades quedan enlazadas y sale una molécula de agua.",
      q: "¿Qué transformación representa lo observado?",
      options: ["Una hidrólisis que separa un disacárido.", "Una condensación que forma un disacárido.", "La formación de una proteína a partir de aminoácidos.", "La formación de un triglicérido a partir de ácidos grasos."],
      answer: 1,
      why: "Dos monosacáridos pueden unirse para formar un disacárido. Al formarse el enlace por condensación se libera H₂O; en la hidrólisis, el agua se utiliza para separarlos."
    },
    {
      id: "carb-foods", category: "carbohidratos", visual: "foods",
      context: "Una fruta contiene azúcares sencillos y el arroz contiene almidón. Aunque parecen alimentos muy distintos, ambos aportan carbohidratos.",
      q: "¿Qué explicación relaciona mejor estos alimentos?",
      options: ["Todos sus carbohidratos son moléculas idénticas.", "El almidón es una proteína porque tiene muchas unidades.", "Solo las sustancias con sabor dulce pueden ser carbohidratos.", "Los azúcares y el almidón son carbohidratos que pueden aportar energía."],
      answer: 3,
      why: "Los carbohidratos incluyen azúcares sencillos y estructuras mayores, como el almidón. El organismo puede obtener energía de ambos; un alimento no necesita ser dulce para contener carbohidratos."
    },
    {
      id: "lipid-components", category: "lípidos", visual: "triglyceride",
      context: "Quieres completar el modelo de un triglicérido en el Constructor de BioLab.",
      q: "¿Qué conjunto de piezas necesitas?",
      options: ["Un glicerol y tres ácidos grasos.", "Un glicerol y tres aminoácidos.", "Tres glucosas y un ácido graso.", "Tres gliceroles y un monosacárido."],
      answer: 0,
      why: "Un triglicérido se compone de un glicerol unido a tres ácidos grasos. Es un ejemplo de lípido que puede almacenar energía; no todos los lípidos tienen esta misma estructura."
    },
    {
      id: "lipid-water", category: "lípidos", visual: "oil-water",
      context: "Mezclas aceite y agua, agitas el recipiente y lo dejas reposar. Vuelven a aparecer dos capas separadas.",
      q: "¿Qué propiedad de los lípidos explica mejor el resultado?",
      options: ["El aceite se convierte en azúcar al agitarlo.", "El agua rompe todos los enlaces del aceite por sí sola.", "Los lípidos del aceite son predominantemente hidrofóbicos y no se mezclan fácilmente con el agua.", "El aceite y el agua forman una sola sustancia permanente."],
      answer: 2,
      why: "Los lípidos del aceite tienen poca afinidad por el agua. La agitación puede dispersarlos por un momento, pero al reposar las fases vuelven a separarse."
    },
    {
      id: "protein-hydrolysis", category: "proteínas", visual: "peptide",
      context: "En el Constructor formas una cadena de cuatro aminoácidos y luego activas la hidrólisis completa de sus tres enlaces.",
      q: "¿Qué debe ocurrir en el modelo al entrar agua?",
      options: ["Los aminoácidos se convierten en ácidos grasos.", "Se rompen los enlaces peptídicos y se separan los aminoácidos.", "Se forman más enlaces peptídicos y sale agua.", "La cadena se transforma en un polisacárido."],
      answer: 1,
      why: "Las proteínas están formadas por aminoácidos unidos mediante enlaces peptídicos. La hidrólisis usa agua para romper esos enlaces; en el modelo de BioLab, las unidades vuelven a separarse."
    },
    {
      id: "protein-biuret", category: "proteínas", visual: "biuret-result",
      context: "Añades Biuret a una muestra de alimento. El reactivo pasa de azul a violeta; el control con agua permanece azul.",
      q: "¿Cuál es la conclusión mejor sustentada por esta observación?",
      options: ["La muestra contiene únicamente lípidos.", "La muestra no contiene biomoléculas.", "El color violeta permite identificar cualquier azúcar.", "La muestra contiene proteínas, aunque podría contener otras biomoléculas."],
      answer: 3,
      why: "El violeta de Biuret indica enlaces peptídicos, compatibles con la presencia de proteínas. La prueba no demuestra que las proteínas sean la única biomolécula del alimento."
    },
    {
      id: "experiment-question", category: "interpretación", visual: "research",
      context: "Observas una muestra de alimento con apariencia aceitosa. En BioLab tienes Sudan III y controles de agua y aceite.",
      q: "Antes de experimentar, ¿cuál sería una pregunta de investigación adecuada para este ensayo?",
      options: ["¿La muestra contiene lípidos?", "¿Cuál es la masa exacta de toda la grasa del alimento?", "¿Qué biomolécula es más importante para todas las personas?", "¿De qué alimento procede exactamente la muestra?"],
      answer: 0,
      why: "La apariencia aceitosa orienta una hipótesis, pero no demuestra la composición. Formula una pregunta que puedas comprobar con evidencias. Sudan III permite investigar la presencia de lípidos, no medir su masa exacta ni identificar por sí solo el alimento."
    },
    {
      id: "experiment-comparison", category: "interpretación", visual: "equal-volumes",
      context: "Quieres comparar dos muestras utilizando Biuret. Preparas ambos tubos con 2 mL de muestra, la misma cantidad de reactivo y el mismo tiempo de espera.",
      q: "¿Por qué conviene utilizar el mismo volumen de muestra en ambos tubos?",
      options: ["Para asegurar que ambas muestras tengan proteínas.", "Para que el reactivo identifique lípidos en lugar de proteínas.", "Para comparar bajo condiciones similares y evitar que el volumen altere el resultado.", "Para que cualquier cambio de color tenga siempre la misma intensidad."],
      answer: 2,
      why: "Mantener iguales el volumen, la cantidad de reactivo y el tiempo ayuda a comparar las muestras bajo condiciones similares. Estos controles no garantizan un positivo ni obligan a que los colores sean iguales."
    },
    {
      id: "experiment-heating", category: "interpretación", visual: "benedict-control",
      context: "Añades Benedict a una muestra y a un control de glucosa conocido. Sin calentar, ambos tubos permanecen azules.",
      q: "¿Qué decisión permite interpretar mejor este resultado?",
      options: ["Concluir que la muestra no contiene ningún carbohidrato.", "Repetir con calentamiento adecuado y controles antes de concluir si hay azúcares reductores.", "Concluir que el control de glucosa contiene proteínas.", "Añadir Sudan III al mismo tubo para que Benedict funcione."],
      answer: 1,
      why: "Benedict necesita calentamiento adecuado. Si el control de glucosa también permanece azul, el ensayo no ofrece una referencia positiva válida. Repite con calor y controles; además, un Benedict negativo no descarta todos los carbohidratos."
    },
    {
      id: "integrated-sample", category: "integradora", visual: "integrated-results",
      context: "Investigas el mismo alimento en tres tubos separados, siguiendo cada protocolo y con controles válidos. Observas estos resultados:",
      q: "¿Qué conclusión integra mejor las tres evidencias?",
      options: ["El alimento contiene solo proteínas porque Biuret fue positivo.", "Los tres reactivos detectan la misma biomolécula.", "El alimento se identifica con certeza como leche.", "Se detectaron azúcares reductores, lípidos y proteínas; el alimento puede contener las tres familias."],
      answer: 3,
      why: "Benedict positivo señala azúcares reductores, Sudan III revela una fracción lipídica teñida y Biuret violeta indica proteínas. Un alimento puede contener varias biomoléculas; este patrón no identifica por sí solo un alimento concreto."
    }
  ];

  // Keep feedback tied to historical attempts without regrading against the revised exam.
  const legacyReview = [
    { q: "Identificación con Benedict", answer: 1, why: "Benedict detecta azúcares reductores, como la glucosa, y no todos los carbohidratos." },
    { q: "Calentamiento con Benedict", answer: 2, why: "El calentamiento permite la reacción de Benedict. Sin condiciones adecuadas puede aparecer un falso negativo." },
    { q: "Interpretación del rojo ladrillo", answer: 0, why: "Con un procedimiento y controles adecuados, el rojo ladrillo indica una respuesta intensa a azúcares reductores. No es una medición exacta de su cantidad." },
    { q: "Identificación de lípidos", answer: 2, why: "Sudan III tiñe la fracción lipídica y permite investigar si hay grasas en una muestra." },
    { q: "Evidencia de Sudan III", answer: 0, why: "Una capa rojiza es una evidencia de lípidos al comparar con controles válidos." },
    { q: "Identificación con Biuret", answer: 3, why: "Biuret reacciona con los enlaces peptídicos de las proteínas." },
    { q: "Interpretación del violeta", answer: 0, why: "El violeta de Biuret indica proteínas; no excluye que existan otras biomoléculas." },
    { q: "Pregunta de investigación", answer: 1, why: "Antes de experimentar, formula una pregunta que pueda comprobarse mediante evidencias y una predicción sobre el resultado." },
    { q: "Comparación de muestras", answer: 0, why: "Utilizar el mismo volumen de muestra y la misma cantidad de reactivo ayuda a comparar los tubos bajo condiciones similares." },
    { q: "Conclusión sustentada", answer: 1, why: "Relaciona la conclusión con la evidencia: si una muestra cambia a violeta con Biuret y los controles son válidos, hay evidencia de proteínas." }
  ];

  const version = "biolab-biomolecules-v4";
  function reviewForAttempt(record) {
    const basis = Array.isArray(record.questionSnapshot) ? record.questionSnapshot
      : record.assessmentVersion === version ? questions
      : !record.assessmentVersion ? legacyReview : [];
    const activeIds = new Set(questions.map(item => item.id));
    // Keep original response indices and grades; omit content outside the current scope.
    return basis.map((item,index) => ({item,index})).filter(({item}) => basis === legacyReview || activeIds.has(item.id));
  }
  window.BioLabAssessment = { version, questions, legacyReview, reviewForAttempt };
})();
