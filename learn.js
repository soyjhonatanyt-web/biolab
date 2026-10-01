(() => {
  "use strict";
  let topic = "carb";
  let carbClass = "mono";
  let joined = false;
  let folded = true;
  let heated = false;
  let projection = false;
  let root;
  const topics = {
    carb: { title: "Carbohidratos", cue: "Energía · reserva · estructura", elements: ["C", "H", "O"], definition: "Biomoléculas que incluyen azúcares y cadenas de azúcares. Sus unidades más sencillas son los monosacáridos.", foods: ["Arroz", "Pan", "Papa", "Frutas", "Miel"], question: "¿Por qué tanto una fruta como el arroz contienen carbohidratos si parecen alimentos completamente diferentes?", discussion: "Compara sus moléculas: la fruta aporta azúcares sencillos; el arroz, almidón formado por muchas glucosas. Su aspecto y sabor no determinan su familia química.", lab: "benedict", labTitle: "Explorar con Benedict", labNote: "Detecta azúcares reductores, como la glucosa. No identifica todos los carbohidratos.", functions: [["01", "Energía inmediata", "La glucosa puede utilizarse para obtener energía en las células."], ["02", "Reserva", "Almidón en plantas; glucógeno en animales, sobre todo en hígado y músculos."], ["03", "Estructura", "La celulosa aporta resistencia a la pared de las células vegetales."]] },
    lipid: { title: "Lípidos", cue: "Reserva · membranas · protección", elements: ["C", "H", "O"], definition: "Familia diversa de biomoléculas predominantemente hidrofóbicas: tienen poca afinidad por el agua. No todas comparten la misma estructura.", foods: ["Aceite", "Aguacate", "Mantequilla", "Frutos secos"], question: "¿Por qué el aceite y el agua se separan aunque los mezclemos?", discussion: "La agitación dispersa el aceite temporalmente, pero no lo disuelve. Sus lípidos tienen poca afinidad por el agua y las fases vuelven a separarse al reposar.", lab: "sudan", labTitle: "Explorar con Sudan III", labNote: "Sudan III tiñe la fracción lipídica y permite observarla en una muestra.", functions: [["01", "Reserva energética", "Los triglicéridos almacenan energía a largo plazo."], ["02", "Membranas", "Los fosfolípidos forman la base de las membranas celulares."], ["03", "Protección y aislamiento", "El tejido adiposo amortigua golpes y reduce la pérdida de calor."], ["04", "Regulación", "Algunos lípidos participan en señales, como las hormonas esteroideas."]] },
    protein: { title: "Proteínas", cue: "Forma · función · actividad", elements: ["C", "H", "O", "N"], definition: "Cadenas de aminoácidos unidos por enlaces peptídicos. La cadena se pliega en una forma tridimensional relacionada con su función.", foods: ["Huevo", "Carne", "Pescado", "Leche", "Legumbres"], question: "¿Por qué la clara de huevo cambia permanentemente cuando la calentamos?", discussion: "El calor altera el plegamiento de sus proteínas. Estas se agregan y coagulan: la clara se vuelve opaca y firme. No se ha separado la cadena en aminoácidos.", lab: "biuret", labTitle: "Explorar con Biuret", labNote: "El violeta de Biuret revela enlaces peptídicos, compatibles con proteínas.", functions: [["01", "Estructura", "Colágeno: resistencia en piel, tendones y otros tejidos."], ["02", "Enzimas", "Amilasa: acelera la descomposición del almidón."], ["03", "Transporte", "Hemoglobina: transporta oxígeno en la sangre."], ["04", "Defensa", "Anticuerpos: reconocen elementos extraños."], ["05", "Movimiento", "Actina y miosina: participan en la contracción muscular."], ["06", "Regulación", "Insulina: interviene en la regulación de la glucosa."]] }
  };
  const ink = {"#c8d9ea":"#3d514b", "#f5fbff":"#233b34", "#9cb0c7":"#61736c", "#62e6ff":"#28665f", "#ffbd4b":"#906005", "#ff6b67":"#9b472c", "#a783ff":"#51578a", "#eaffff":"#f8fbf8"};
  const paintDiagram = body => body.replaceAll('#0b233d', '#fffdf7').replaceAll('#ffbd4b12', '#f3e6bc').replaceAll('fill="#ffbd4b"', 'fill="#e6bd62"').replaceAll('stroke="#ffbd4b"', 'stroke="#be8b29"').replaceAll('fill="#ff6b67"', 'fill="#db9a78"').replaceAll('stroke="#ff6b67"', 'stroke="#be7250"').replaceAll('fill="#a783ff"', 'fill="#c1bfdc"').replaceAll('stroke="#a783ff"', 'stroke="#7275a1"').replaceAll('#bea1ff', '#d1cfe5').replaceAll('#cfb9ff', '#dedced').replaceAll('fill="#62e6ff"', 'fill="#afd1d4"').replaceAll('stroke="#62e6ff"', 'stroke="#5d938d"');
  const label = (x, y, text, color = "#c8d9ea", size = 18, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" fill="${ink[color] || color}" font-size="${size}">${text}</text>`;
  const line = (x1, y1, x2, y2, color = "#62e6ff", extra = "") => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="4" ${extra}/>`;
  const unit = (x, y, text = "G", color = "#ffbd4b", radius = 25) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}"/>${label(x,y+6,text,"#091a30",17)}`;
  const sugar = (x, y, text, pentagon = false) => `<g>${pentagon ? `<polygon points="${x},${y-36} ${x+37},${y-12} ${x+23},${y+32} ${x-23},${y+32} ${x-37},${y-12}"` : `<polygon points="${x-25},${y-34} ${x+25},${y-34} ${x+44},${y} ${x+25},${y+34} ${x-25},${y+34} ${x-44},${y}"`} fill="#ffbd4b"/>${label(x,y+7,text,"#352300",21)}</g>`;
  const svg = (description, body, height = 300) => `<svg viewBox="0 0 700 ${height}" role="img" aria-label="${description}" xmlns="http://www.w3.org/2000/svg"><title>${description}</title>${paintDiagram(body)}</svg>`;
  const water = (x,y,text = "H₂O") => `<g class="learn-water">${unit(x,y,text,"#62e6ff",26)}</g>`;

  function glucoseDiagram() {
    return svg("Modelo de glucosa cíclica: cinco carbonos y un oxígeno en el anillo; un sexto carbono en el grupo CH₂OH exterior.", `<path d="M225 87 305 87 345 152 305 213 225 213 185 152Z" fill="#ffbd4b12" stroke="#ffbd4b" stroke-width="4"/>${[[225,87,"C"],[305,87,"O"],[345,152,"C"],[305,213,"C"],[225,213,"C"],[185,152,"C"]].map(([x,y,t]) => `<circle cx="${x}" cy="${y}" r="16" fill="#0b233d"/>${label(x,y+7,t,t === "O" ? "#62e6ff" : "#ffbd4b",22)}`).join("")}${line(225,72,225,38,"#ffbd4b")}${label(225,28,"CH₂OH","#ffbd4b",21)}${label(496,115,"GLUCOSA","#ffbd4b",22)}${label(496,153,"C₆H₁₂O₆","#f5fbff",34)}${label(496,195,"Un monosacárido")}${label(350,277,"Se omiten H y grupos OH para facilitar la lectura.","#9cb0c7",16)}`);
  }
  function disaccharideDiagram() {
    return svg("Glucosa y fructosa se unen para formar sacarosa; se libera una molécula de agua.", `<g class="${joined ? "learn-join-left" : ""}" transform="translate(${joined ? 62 : 0} 0)">${sugar(185,132,"G")}${label(185,212,"Glucosa")}</g><g class="${joined ? "learn-join-right" : ""}" transform="translate(${joined ? -62 : 0} 0)">${sugar(445,132,"F",true)}${label(445,212,"Fructosa")}</g>${joined ? `${line(291,132,345,132)}${label(319,105,"Enlace","#62e6ff",16)}${water(598,92)}${label(598,150,"Sale agua","#62e6ff")}` : label(315,142,"+","#62e6ff",30)}${label(350,274,joined ? "Sacarosa: dos unidades enlazadas" : "Dos monosacáridos separados", "#f5fbff",21)}`);
  }
  function polysaccharideDiagram() {
    const chain = (startX,y,count,spacing=58) => line(startX,y,startX+(count-1)*spacing,y,"#ffbd4b") + Array.from({length:count},(_,i)=>unit(startX+i*spacing,y,"G","#ffbd4b",18)).join("");
    return svg("Polisacáridos: almidón como cadena y ramificaciones, glucógeno más ramificado y celulosa en cadenas paralelas.", `${label(133,28,"Almidón","#ffbd4b",21)}${chain(40,87,4)}${line(98,87,127,132,"#ffbd4b")}${unit(127,132,"G","#ffbd4b",18)}${label(133,186,"Reserva vegetal", "#c8d9ea",16)}${label(350,28,"Glucógeno","#ffbd4b",21)}${chain(263,87,4)}${[292,350,408].map((x,i)=>line(x+29,87,x,132,"#ffbd4b")+unit(x,132,"G","#ffbd4b",18)+line(x+29,87,x,47,"#ffbd4b")+unit(x,47,"G","#ffbd4b",15)).join("")}${label(350,186,"Reserva animal", "#c8d9ea",16)}${label(572,28,"Celulosa","#ffbd4b",21)}${[65,107,149].map(y=>chain(492,y,4,53)).join("")}${label(572,186,"Pared celular vegetal", "#c8d9ea",16)}${label(350,245,"Cada G representa una unidad de glucosa.","#9cb0c7",17)}${label(350,272,"Cambian los enlaces y la organización, no solo la longitud.","#9cb0c7",16)}`);
  }
  function triglycerideDiagram() {
    return svg("Un glicerol y tres ácidos grasos forman un triglicérido por enlaces éster, liberando tres moléculas de agua en el modelo.", `<g class="${joined ? "learn-lipid-core" : ""}" transform="translate(${joined ? 30 : 0} 0)"><rect x="108" y="63" width="80" height="163" rx="16" fill="#1e6b69"/>${label(148,152,"Glicerol","#eaffff",16)}</g><g class="${joined ? "learn-lipid-tails" : ""}" transform="translate(${joined ? -30 : 0} 0)">${[83,145,207].map((y,i)=>`${line(268,y,525,y,"#ff6b67")}<path d="M268 ${y}h257" stroke="#ff6b67" stroke-width="26" stroke-linecap="round"/>${label(398,y+6,`Ácido graso ${i+1}`,"#300e20",18)}`).join("")}</g>${joined ? [83,145,207].map(y=>line(218,y,238,y,"#62e6ff")).join("") + water(623,143,"3H₂O") + label(623,198,"Salen","#62e6ff",17) : label(225,155,"+","#62e6ff",30)}${label(350,276,joined ? "Triglicérido · 3 enlaces éster" : "Componentes separados", "#f5fbff",22)}`);
  }
  function saturationDiagram() {
    return svg("Ácido graso saturado sin enlaces C=C; ácido graso insaturado cis con doble enlace C=C y un codo en la cadena.", `${label(45,37,"Saturado","#ff6b67",21,"start")}<path d="M55 80h548" stroke="#ff6b67" stroke-width="5"/>${[55,140,225,310,395,480,565].map(x=>unit(x,80,"C","#ff6b67",17)).join("")}${label(350,128,"Sin dobles enlaces C=C en la cadena", "#c8d9ea",18)}${label(45,174,"Insaturado (cis)","#ff6b67",21,"start")}<path d="M55 212h255l98 53h170" fill="none" stroke="#ff6b67" stroke-width="5"/>${line(223,220,310,220,"#62e6ff")}${[[55,212],[140,212],[225,212],[310,212],[408,265],[493,265],[578,265]].map(([x,y])=>unit(x,y,"C","#ff6b67",17)).join("")}${label(266,191,"C=C","#62e6ff",17)}${label(350,322,"Un doble enlace cis introduce un codo.","#c8d9ea",18)}`,350);
  }
  function membraneDiagram() {
    return svg("Fosfolípidos: cabezas con afinidad por el agua y dos colas hidrofóbicas. Se organizan en una bicapa.", `${label(350,28,"Medio acuoso","#62e6ff",18)}${[70,150,230,310,390,470,550,630].map(x=>`<path d="M${x-8} 77v63m16-63v63M${x-8} 226v-63m16 63v-63" stroke="#ff6b67" stroke-width="6" stroke-linecap="round"/><circle cx="${x}" cy="66" r="19" fill="#62e6ff"/><circle cx="${x}" cy="238" r="19" fill="#62e6ff"/>`).join("")}${label(350,300,"Cabezas polares afuera · colas hidrofóbicas adentro", "#c8d9ea",18)}`,330);
  }
  function structureContrast() {
    const chain = `<svg viewBox="0 0 400 150" role="img" aria-label="Carbohidrato: unidades de azúcar enlazadas"><title>Carbohidrato: unidades de azúcar enlazadas</title>${line(65,74,335,74,"#ffbd4b")}${[65,155,245,335].map(x=>unit(x,74,"G","#ffbd4b",26)).join("")}${label(200,136,"Unidades de glucosa","#c8d9ea",18)}</svg>`;
    const lipid = `<svg viewBox="0 0 400 150" role="img" aria-label="Triglicérido: glicerol unido a tres cadenas de ácidos grasos"><title>Triglicérido: glicerol unido a tres cadenas de ácidos grasos</title><rect x="60" y="24" width="50" height="88" rx="8" fill="#1e6b69"/>${label(85,76,"G","#eaffff",21)}${[37,68,99].map(y=>line(110,y,152,y)+line(152,y,345,y,"#ff6b67")).join("")}${label(85,140,"Glicerol","#c8d9ea",17)}${label(265,140,"3 ácidos grasos","#c8d9ea",17)}</svg>`;
    return `<div class="learn-contrast"><div><span>CARBOHIDRATO</span><div class="learn-mini-structure">${paintDiagram(chain)}</div><strong>Unidades de azúcar enlazadas</strong></div><b>≠</b><div><span>LÍPIDO · TRIGLICÉRIDO</span><div class="learn-mini-structure">${paintDiagram(lipid)}</div><strong>Glicerol con tres cadenas</strong></div></div>`;
  }
  function proteinChainDiagram() {
    return svg("Cinco aminoácidos se unen en una cadena por cuatro enlaces peptídicos; el modelo libera cuatro moléculas de agua.", `${joined ? `<path d="M95 151H605" stroke="#a783ff" stroke-width="6"/>` : ""}${[95,223,350,478,605].map((x,i)=>`<g class="${joined ? "learn-aa-join" : ""}" style="--piece-delay:${i*90}ms">${unit(x,151,["Gly","Ala","Ser","Val","Gly"][i],"#a783ff",33)}</g>`).join("")}${joined ? [159,287,414,542].map(x=>water(x,54)).join("") + label(350,230,"4 enlaces peptídicos · salen 4 H₂O","#62e6ff",19) : label(350,230,"Aminoácidos: unidades de la cadena", "#c8d9ea",20)}${label(350,277,joined ? "La secuencia de aminoácidos importa." : "Las abreviaturas nombran aminoácidos diferentes.","#9cb0c7",17)}`);
  }
  function foldingDiagram() {
    const normal = [[138,115],[193,60],[265,69],[288,143],[240,190],[181,183],[175,135],[234,124]];
    const unfolded = [[65,129],[144,139],[220,99],[296,119],[373,166],[449,133],[524,114],[600,139]];
    const points = folded && !heated ? normal : unfolded;
    return svg("La misma cadena puede estar plegada o extendida. El calor altera el plegamiento sin separar los aminoácidos.", `<polyline points="${points.map(p=>p.join(",")).join(" ")}" fill="none" stroke="#a783ff" stroke-width="9" stroke-linejoin="round" class="learn-fold-line"/>${points.map(([x,y],i)=>unit(x,y,String(i+1),["#a783ff","#bea1ff","#cfb9ff"][i%3],18)).join("")}${folded && !heated ? label(486,104,"Forma tridimensional","#a783ff",20) + label(486,145,"relacionada con la función","#c8d9ea",17) : ""}${label(350,269,heated ? "Desnaturalización: cambia el plegamiento, no se corta la cadena." : folded ? "Modelo esquemático de una proteína plegada" : "Misma secuencia, forma extendida", "#c8d9ea",17)}`);
  }
  function functionCards(data) {
    return `<section class="learn-section"><div class="learn-section-heading"><span>02 · FUNCIÓN</span><h3>¿Qué hacen en los seres vivos?</h3></div><div class="learn-functions">${data.functions.map(([n,title,copy])=>`<article><span>${n}</span><h4>${title}</h4><p>${copy}</p></article>`).join("")}</div></section>`;
  }
  function classControls() {
    return `<div class="learn-class-controls" role="group" aria-label="Clasificación de carbohidratos">${[["mono","1","Monosacáridos","Glucosa · fructosa"],["di","2","Disacáridos","Sacarosa"],["poly","n","Polisacáridos","Almidón · glucógeno · celulosa"]].map(([key,n,title,examples])=>`<button data-carb-class="${key}" aria-pressed="${carbClass === key}"><b>${n}</b><span><strong>${title}</strong><small>${examples}</small></span></button>`).join("")}</div>`;
  }
  function carbVisual() {
    const diagram = carbClass === "mono" ? glucoseDiagram() : carbClass === "di" ? disaccharideDiagram() : polysaccharideDiagram();
    return `<div id="learn-carb-diagram" class="learn-diagram">${diagram}</div><div id="learn-carb-note" class="learn-diagram-note" aria-live="polite">${carbClass === "mono" ? "Una unidad sencilla. Glucosa y fructosa tienen la misma fórmula, pero distinta estructura." : carbClass === "di" ? (joined ? "La condensación forma un enlace glucosídico. Glucosa + fructosa → sacarosa + H₂O." : "Dos unidades pueden enlazarse para formar un disacárido. Observa la condensación.") : "Muchas unidades enlazadas forman polisacáridos. Nuestras enzimas digestivas no descomponen la celulosa."}</div>${carbClass === "di" ? `<button class="learn-action" data-learn-action="carb-join">${joined ? "Repetir unión" : "Unir glucosa y fructosa"}</button>` : ""}`;
  }
  function bodyForTopic() {
    if (topic === "carb") return `<div class="learn-structure-controls">${classControls()}</div><div class="learn-main-visual" id="learn-structure">${carbVisual()}</div>`;
    if (topic === "lipid") return `<div class="learn-main-visual" id="learn-structure"><div class="learn-diagram">${triglycerideDiagram()}</div><div class="learn-diagram-note" aria-live="polite">${joined ? "Una condensación por cada unión: tres ácidos grasos se enlazan al glicerol y salen tres H₂O." : "Este es un triglicérido, un ejemplo de lípido. Sus componentes se unen mediante enlaces éster."}</div><button class="learn-action" data-learn-action="lipid-join">${joined ? "Repetir formación" : "Formar un triglicérido"}</button></div>`;
    return `<div class="learn-main-visual" id="learn-structure"><div class="learn-diagram">${proteinChainDiagram()}</div><div class="learn-diagram-note" aria-live="polite">${joined ? "Cada nuevo enlace peptídico libera una H₂O en este modelo de condensación." : "Cada círculo representa un aminoácido, no un átomo. Observa cómo forman una cadena."}</div><button class="learn-action" data-learn-action="protein-join">${joined ? "Repetir unión" : "Unir aminoácidos"}</button></div>`;
  }
  function extraForTopic() {
    if (topic === "carb") return `<div class="learn-insight"><b>Mismas unidades, distintas propiedades</b><p>Almidón, glucógeno y celulosa están construidos con glucosa. Sus enlaces y su organización explican sus diferentes funciones.</p></div>`;
    if (topic === "lipid") return `<section class="learn-section"><div class="learn-section-heading"><span>AMPLÍA LA ESTRUCTURA</span><h3>Un lípido no representa a todos</h3></div><div class="learn-detail-grid"><article class="learn-detail"><h4>Saturados e insaturados</h4><div class="learn-diagram">${saturationDiagram()}</div><p>El esquema muestra un fragmento de cada cadena. “Saturado” se refiere a la ausencia de enlaces C=C. Aquí se representa una insaturación <em>cis</em>.</p></article><article class="learn-detail"><h4>Fosfolípidos y membranas</h4><div class="learn-diagram">${membraneDiagram()}</div><p>Un fosfolípido típico tiene una cabeza polar y dos colas. Un triglicérido tiene tres ácidos grasos: no es la misma estructura.</p></article></div>${structureContrast()}</section>`;
    return `<section class="learn-section"><div class="learn-section-heading"><span>AMPLÍA LA ESTRUCTURA</span><h3>La forma también importa</h3></div><div class="learn-detail-grid"><article class="learn-detail"><h4>Una cadena, una forma tridimensional</h4><div id="learn-fold-diagram" class="learn-diagram">${foldingDiagram()}</div><button class="learn-action" data-learn-action="fold">${folded ? "Ver cadena extendida" : "Ver cadena plegada"}</button><p>La secuencia y el plegamiento determinan cómo puede actuar la proteína. No es solo una cadena de piezas.</p></article><article class="learn-detail"><h4>Cuando cocinamos la clara</h4><div class="learn-egg-evidence ${heated ? "is-heated" : ""}"><div><span>ANTES</span><b>Translúcida y fluida</b></div><div class="learn-heat-result"><span>${heated ? "DESPUÉS DEL CALOR" : "OBSERVACIÓN PENDIENTE"}</span><b>${heated ? "Opaca y firme" : "¿Qué cambiará?"}</b></div></div><button class="learn-action" data-learn-action="heat">${heated ? "Restablecer ejemplo" : "Observar efecto del calor"}</button><p id="learn-heat-note" aria-live="polite">${heated ? "Las proteínas se desnaturalizan y se agregan (coagulan). En la clara cocida, este cambio es irreversible en condiciones cotidianas. Los enlaces peptídicos se mantienen." : "Desnaturalizar significa alterar la forma de la proteína. No equivale a hidrolizarla: la cadena no se separa en aminoácidos."}</p></article></div></section>`;
  }
  function renderTopic() {
    const data = topics[topic];
    return `<div class="learn-topic-content" data-family="${topic}"><section class="learn-overview"><div class="learn-definition"><span class="learn-eyebrow">01 · ESTRUCTURA</span><h2>${data.title}</h2><p>${data.definition}</p><div class="learn-elements" aria-label="Elementos predominantes">${data.elements.map(el=>`<span>${el}</span>`).join("")}<small>${topic === "protein" ? "Algunas también contienen azufre." : "Composición predominante"}</small></div><p class="learn-model-note">Representaciones simplificadas para observar componentes y enlaces.</p></div><div class="learn-structure"><div class="learn-visual-heading"><span>EXPLORA LA ESTRUCTURA</span><small>${topic === "carb" ? "Elige una escala" : "Observa la unión"}</small></div>${bodyForTopic()}</div></section>${extraForTopic()}${functionCards(data)}<section class="learn-section learn-food-section"><div class="learn-section-heading"><span>03 · VIDA COTIDIANA</span><h3>También están en los alimentos</h3></div><div class="learn-foods">${data.foods.map(food=>`<span>${food}</span>`).join("")}</div><p>Un alimento puede aportar varias clases de biomoléculas; estos ejemplos no son sustancias puras.</p></section><section class="learn-class-question"><div><span>CONVERSA EN CLASE</span><h3>${data.question}</h3></div><details><summary>Mostrar pistas para la discusión</summary><p>${data.discussion}</p></details></section><div class="learn-lab-connection"><div><span>DE LA ESTRUCTURA A LA EVIDENCIA</span><p>${data.labNote}</p></div><div><button class="learn-action secondary" data-learn-destination="constructor">Abrir Constructor</button><button class="learn-action" data-learn-destination="${data.lab}">${data.labTitle}</button></div></div></div>`;
  }
  function renderComparison() {
    const rows = [
      ["Unidad o componentes", "Monosacáridos", "Varían según la clase. Triglicérido: glicerol + 3 ácidos grasos", "Aminoácidos"],
      ["Funciones destacadas", "Energía, reserva y estructura", "Reserva, membranas, protección y regulación", "Estructura, enzimas, transporte, defensa, movimiento y regulación"],
      ["Reserva energética", "Almidón en plantas; glucógeno en animales", "Triglicéridos: reserva a largo plazo", "No son la reserva energética especializada del cuerpo"],
      ["Ejemplos biológicos", "Glucosa · almidón · glucógeno · celulosa", "Triglicéridos · fosfolípidos · colesterol", "Colágeno · hemoglobina · anticuerpos · enzimas"],
      ["Alimentos ilustrativos", "Arroz · pan · papa · frutas · miel", "Aceite · aguacate · mantequilla · frutos secos", "Huevo · carne · pescado · leche · legumbres"]
    ];
    return `<section class="learn-comparison"><div class="learn-section-heading"><span>MIRA LAS TRES FAMILIAS A LA VEZ</span><h2>Compara componentes, funciones y ejemplos</h2><p>La estructura ayuda a explicar la función; una sola comida puede contener las tres familias.</p></div><div class="learn-table-wrap" tabindex="0" role="region" aria-label="Comparación de las tres biomoléculas; desplaza horizontalmente en pantallas pequeñas"><table><caption>Carbohidratos, lípidos y proteínas</caption><thead><tr><th scope="col">Qué comparamos</th><th scope="col" class="carb-col"><span class="compare-symbol">G—G</span>Carbohidratos</th><th scope="col" class="lipid-col"><span class="compare-symbol">Glicerol + 3 AG</span>Lípidos</th><th scope="col" class="protein-col"><span class="compare-symbol">AA—AA—AA</span>Proteínas</th></tr></thead><tbody>${rows.map(([title,...cells])=>`<tr><th scope="row">${title}</th>${cells.map((copy,i)=>`<td class="${["carb-col","lipid-col","protein-col"][i]}">${copy}</td>`).join("")}</tr>`).join("")}</tbody></table></div><div class="learn-insight"><b>Dos precauciones al comparar</b><p>No todos los lípidos se forman con glicerol y ácidos grasos. Las proteínas pueden aportar energía, pero no constituyen una reserva especializada como los triglicéridos.</p></div><section class="learn-class-question"><div><span>CIERRE DE LA EXPLICACIÓN</span><h3>¿Por qué no basta conocer el alimento para identificar todas sus biomoléculas?</h3></div><details><summary>Mostrar pistas para la discusión</summary><p>Los alimentos son mezclas. Para reconocer biomoléculas, relacionamos su estructura y función con las evidencias de pruebas específicas.</p></details></section></section>`;
  }
  function render() {
    root.innerHTML = `<div class="learn-toolbar"><div class="learn-intro"><span class="learn-eyebrow">APRENDE · BIOMOLÉCULAS Y BIOQUÍMICA</span><h2>Las moléculas detrás de la vida</h2><p>Las biomoléculas forman parte de los seres vivos. Explora cómo sus componentes y estructuras se relacionan con lo que hacen.</p></div><button id="learn-projection" class="projection-button" aria-pressed="${projection}">${projection ? "Salir de proyección" : "Modo proyección"}</button></div><div class="learn-topic-tabs" role="tablist" aria-label="Explorar biomoléculas">${Object.entries(topics).map(([key,data],i)=>`<button id="learn-tab-${key}" role="tab" aria-controls="learn-topic-panel" aria-selected="${topic === key}" tabindex="${topic === key ? 0 : -1}" data-learn-topic="${key}" data-family="${key}"><span class="learn-tab-number">0${i+1}</span><strong>${data.title}</strong><small>${data.cue}</small></button>`).join("")}<button id="learn-tab-compare" class="learn-compare-tab" role="tab" aria-controls="learn-topic-panel" aria-selected="${topic === "compare"}" tabindex="${topic === "compare" ? 0 : -1}" data-learn-topic="compare"><span aria-hidden="true">≡</span><strong>Comparación</strong><small>Las tres familias</small></button></div><div id="learn-topic-panel" role="tabpanel" aria-labelledby="learn-tab-${topic}">${topic === "compare" ? renderComparison() : renderTopic()}</div><footer class="learn-sources learn-secondary"><p>Química · 5.º grado · Segundo Ciclo de Secundaria · República Dominicana</p><details><summary>Referencias del contenido</summary><p><a href="https://ministeriodeeducacion.gob.do/docs/direccion-general-de-curriculo/IgwQ-adecuacion-curricular-nivel-secudariopdf.pdf#page=233" target="_blank" rel="noopener">MINERD · Adecuación Curricular del Nivel Secundario</a></p><p>Base científica: OpenStax Biology 2e · <a href="https://openstax.org/books/biology-2e/pages/3-2-carbohydrates" target="_blank" rel="noopener">Carbohidratos</a> · <a href="https://openstax.org/books/biology-2e/pages/3-3-lipids" target="_blank" rel="noopener">Lípidos</a> · <a href="https://openstax.org/books/biology-2e/pages/3-4-proteins" target="_blank" rel="noopener">Proteínas</a>. Las referencias requieren conexión; el contenido de Aprende está disponible offline.</p></details></footer>`;
  }
  function updateStructure() {
    const structure = root.querySelector("#learn-structure");
    if (topic === "carb") structure.innerHTML = carbVisual();
    else structure.outerHTML = bodyForTopic();
  }
  function updateProteinExamples() {
    root.querySelector("#learn-fold-diagram").innerHTML = foldingDiagram();
    root.querySelector('[data-learn-action="fold"]').textContent = folded ? "Ver cadena extendida" : "Ver cadena plegada";
    root.querySelector(".learn-egg-evidence").classList.toggle("is-heated",heated);
    root.querySelector(".learn-heat-result").innerHTML = `<span>${heated ? "DESPUÉS DEL CALOR" : "OBSERVACIÓN PENDIENTE"}</span><b>${heated ? "Opaca y firme" : "¿Qué cambiará?"}</b>`;
    root.querySelector("#learn-heat-note").textContent = heated ? "Las proteínas se desnaturalizan y se agregan (coagulan). En la clara cocida, este cambio es irreversible en condiciones cotidianas. Los enlaces peptídicos se mantienen." : "Desnaturalizar significa alterar la forma de la proteína. No equivale a hidrolizarla: la cadena no se separa en aminoácidos.";
    root.querySelector('[data-learn-action="heat"]').textContent = heated ? "Restablecer ejemplo" : "Observar efecto del calor";
  }
  function selectTopic(value, focus = false) {
    if (!topics[value] && value !== "compare") return;
    topic = value; joined = false; heated = false; folded = true;
    render();
    if (focus) root.querySelector(`#learn-tab-${topic}`).focus({preventScroll:true});
  }
  function setProjection(value) {
    projection = value;
    document.body.classList.toggle("learn-projection-mode", value);
    const button = root?.querySelector("#learn-projection");
    if (button) { button.textContent = value ? "Salir de proyección" : "Modo proyección"; button.setAttribute("aria-pressed", String(value)); }
  }
  function init() {
    root = document.querySelector("#learn-app");
    if (!root || root.dataset.ready) return;
    root.dataset.ready = "true";
    render();
    root.addEventListener("click", event => {
      const tab = event.target.closest("[data-learn-topic]");
      if (tab) { selectTopic(tab.dataset.learnTopic,true); return; }
      if (event.target.closest("#learn-projection")) { setProjection(!projection); return; }
      const classification = event.target.closest("[data-carb-class]");
      if (classification) {
        carbClass = classification.dataset.carbClass; joined = false;
        root.querySelectorAll("[data-carb-class]").forEach(button=>button.setAttribute("aria-pressed",String(button === classification)));
        updateStructure(); return;
      }
      const destination = event.target.closest("[data-learn-destination]");
      if (destination) { setProjection(false); window.BioLab.activateView(destination.dataset.learnDestination); return; }
      const actionButton = event.target.closest("[data-learn-action]");
      if (!actionButton) return;
      const action = actionButton.dataset.learnAction;
      if (action.endsWith("join")) { joined = true; updateStructure(); root.querySelector(`[data-learn-action="${action}"]`)?.focus({preventScroll:true}); }
      else if (action === "fold") {
        folded = !folded; heated = false;
        updateProteinExamples();
      } else if (action === "heat") {
        heated = !heated; folded = !heated;
        updateProteinExamples();
      }
    });
    root.addEventListener("keydown", event => {
      const tab = event.target.closest("[data-learn-topic]");
      if (!tab || !["ArrowRight","ArrowLeft","Home","End"].includes(event.key)) return;
      event.preventDefault();
      const keys = ["carb","lipid","protein","compare"], index = keys.indexOf(topic);
      const next = event.key === "Home" ? 0 : event.key === "End" ? keys.length-1 : (index + (event.key === "ArrowRight" ? 1 : -1) + keys.length) % keys.length;
      selectTopic(keys[next],true);
    });
    document.addEventListener("keydown", event => { if (event.key === "Escape" && projection) { setProjection(false); root.querySelector("#learn-projection").focus(); } });
  }
  window.BioLabLearn = { init, exitProjection: () => setProjection(false) };
})();
