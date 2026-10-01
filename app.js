(() => {
  "use strict";

  const STORAGE = {
    support: "biolab:support-mode",
    attempt: "biolab:evaluation-attempt-v1",
    outbox: "biolab:evaluation-outbox-v1"
  };

  const { questions, version: assessmentVersion } = window.BioLabAssessment;

  const labModels = {
    benedict: {
      samples: { glucose: [1, "glucosa"], apple: [.75, "jugo de manzana"], milk: [.45, "leche"], starch: [0, "almidón"], water: [0, "agua"], unknown: [.68, "muestra desconocida"] },
      colors: ["#2487e8", "#62bf64", "#e7cf42", "#ef8a2f", "#c9482f"]
    },
    sudan: {
      samples: { oil: [1, "aceite vegetal"], avocado: [.82, "palta"], milk: [.36, "leche"], juice: [.04, "jugo de fruta"], water: [0, "agua"], unknown: [.66, "muestra desconocida"] }
    },
    biuret: {
      samples: { egg: [1, "clara de huevo"], milk: [.58, "leche"], beans: [.78, "extracto de legumbres"], oil: [0, "aceite"], water: [0, "agua"], unknown: [.63, "muestra desconocida"] },
      colors: ["#2387d8", "#7f62c9", "#7740b8", "#5f259f"]
    }
  };

  const mysteryProfiles = {
    honey: { name: "miel diluida", benedict: .95, sudan: .01, biuret: .02 },
    milk: { name: "leche", benedict: .45, sudan: .36, biuret: .58 },
    oil: { name: "aceite vegetal", benedict: 0, sudan: 1, biuret: 0 },
    egg: { name: "clara de huevo", benedict: 0, sudan: .02, biuret: 1 },
    peanut: { name: "crema de maní", benedict: .12, sudan: .78, biuret: .74 }
  };
  let mysteryKey = sessionStorage.getItem("biolab:mystery-key");
  if (!mysteryProfiles[mysteryKey]) {
    const keys = Object.keys(mysteryProfiles);
    mysteryKey = keys[Math.floor(Math.random() * keys.length)];
    sessionStorage.setItem("biolab:mystery-key", mysteryKey);
  }
  const mysteryProfile = mysteryProfiles[mysteryKey];
  labModels.benedict.samples.unknown = [mysteryProfile.benedict, "muestra X"];
  labModels.sudan.samples.unknown = [mysteryProfile.sudan, "muestra X"];
  labModels.biuret.samples.unknown = [mysteryProfile.biuret, "muestra X"];

  let activeView = "inicio";
  let activeRegistration = null;
  let lastExperiment = null;
  const procedureState = { benedict: 0, sudan: 0, biuret: 0 };
  const labLogs = { benedict: [], sudan: [], biuret: [] };
  const mysteryResults = { benedict: false, sudan: false, biuret: false };
  const builderModes = {
    carbohydrate: {
      mission: "Forma un disacárido",
      missionCopy: "Une al menos dos monosacáridos mediante una reacción de condensación.",
      required: 2,
      max: 6,
      pieces: [
        { type: "glucose", label: "Glucosa", symbol: "G", detail: "monosacárido", shape: "carb" },
        { type: "fructose", label: "Fructosa", symbol: "F", detail: "monosacárido", shape: "carb" },
        { type: "galactose", label: "Galactosa", symbol: "Ga", detail: "monosacárido", shape: "carb" }
      ],
      formula: "monosacárido + monosacárido",
      product: "disacárido + H₂O",
      hint: "Añade dos monosacáridos",
      bondName: "enlace glucosídico"
    },
    protein: {
      mission: "Forma una cadena peptídica",
      missionCopy: "Combina cuatro aminoácidos y observa cada enlace peptídico.",
      required: 4,
      max: 6,
      pieces: [
        { type: "glycine", label: "Glicina", symbol: "Gly", detail: "aminoácido", shape: "protein" },
        { type: "alanine", label: "Alanina", symbol: "Ala", detail: "aminoácido", shape: "protein" },
        { type: "serine", label: "Serina", symbol: "Ser", detail: "aminoácido", shape: "protein" },
        { type: "valine", label: "Valina", symbol: "Val", detail: "aminoácido", shape: "protein" }
      ],
      formula: "aminoácidos libres",
      product: "péptido + H₂O",
      hint: "Añade al menos dos aminoácidos",
      bondName: "enlace peptídico"
    },
    lipid: {
      mission: "Forma un triglicérido",
      missionCopy: "Combina un glicerol con tres ácidos grasos.",
      required: 4,
      max: 4,
      pieces: [
        { type: "glycerol", label: "Glicerol", symbol: "Gli", detail: "1 disponible", placed: "esqueleto de 3 C", shape: "glycerol" },
        { type: "fatty", label: "Ácido graso", symbol: "AG", detail: "añade 3", placed: "cadena lipídica", shape: "fatty" }
      ],
      formula: "glicerol + 3 ácidos grasos",
      product: "triglicérido + 3 H₂O",
      hint: "Añade 1 glicerol y 3 ácidos grasos",
      bondName: "enlace éster"
    }
  };
  const builderStates = Object.fromEntries(Object.keys(builderModes).map(mode => [mode, { pieces: [], bonded: false, bonds: 0, water: 0 }]));
  let builderMode = "carbohydrate";
  let builderPieceId = 0;
  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  function toast(message) {
    const el = $("#toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  function activateView(name, updateHash = true) {
    const target = $("#view-" + name);
    if (!target) return;
    if (name !== "aprende") window.BioLabLearn?.exitProjection();
    activeView = name;
    $$(".view").forEach(view => view.classList.toggle("active", view === target));
    $$(".side-nav [data-view]").forEach(button => {
      const selected = button.dataset.view === name;
      button.classList.toggle("active", selected);
      if (selected) button.setAttribute("aria-current", "page"); else button.removeAttribute("aria-current");
    });
    $$(".mobile-nav [data-view]").forEach(button => {
      const selected = button.dataset.view === name || (button.dataset.view === "benedict" && ["benedict", "sudan", "biuret"].includes(name));
      button.classList.toggle("active", selected);
    });
    $("#page-title").textContent = target.dataset.title;
    document.title = `${target.dataset.title} · BioLab`;
    $(".sidebar").classList.remove("open");
    $("#mobile-menu").setAttribute("aria-expanded", "false");
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (updateHash) history.replaceState(null, "", `#${name}`);
    if (name === "evaluacion") hydrateAttempt();
  }

  function setupNavigation() {
    $$('[data-view]').forEach(button => button.addEventListener("click", () => activateView(button.dataset.view)));
    $$('[data-go]').forEach(button => button.addEventListener("click", () => activateView(button.dataset.go)));
    $("#mobile-menu").addEventListener("click", () => {
      const sidebar = $(".sidebar");
      const open = sidebar.classList.toggle("open");
      $("#mobile-menu").setAttribute("aria-expanded", String(open));
    });
    const hashView = location.hash.slice(1);
    if ($(`#view-${hashView}`)) activateView(hashView, false);
  }

  function setupSupportMode() {
    const button = $("#support-toggle");
    const saved = localStorage.getItem(STORAGE.support) === "true";
    document.body.classList.toggle("support-mode", saved);
    button.setAttribute("aria-pressed", String(saved));
    button.addEventListener("click", () => {
      const enabled = !document.body.classList.contains("support-mode");
      document.body.classList.toggle("support-mode", enabled);
      button.setAttribute("aria-pressed", String(enabled));
      localStorage.setItem(STORAGE.support, String(enabled));
      toast(enabled ? "Modo apoyo activado" : "Modo apoyo desactivado");
    });
  }

  function setupLearningTabs() {
    window.BioLabLearn.init();
  }

  function setupBuilder() {
    $$("[data-builder-mode]").forEach(button => button.addEventListener("click", () => switchBuilderMode(button.dataset.builderMode)));
    $("#builder-reset").addEventListener("click", resetBuilder);
    $("#condense-button").addEventListener("click", condenseBuilder);
    $("#hydrolyze-button").addEventListener("click", hydrolyzeBuilder);
    const canvas = $("#builder-canvas");
    canvas.addEventListener("dragover", event => { event.preventDefault(); canvas.classList.add("drag-ready"); });
    canvas.addEventListener("dragleave", () => canvas.classList.remove("drag-ready"));
    canvas.addEventListener("drop", event => {
      event.preventDefault(); canvas.classList.remove("drag-ready");
      const type = event.dataTransfer.getData("text/biolab-piece");
      if (!type) return;
      const rect = canvas.getBoundingClientRect();
      addBuilderPiece(type, { x: (event.clientX - rect.left) / rect.width * 100, y: (event.clientY - rect.top) / rect.height * 100 });
    });
    renderBuilderPalette(); renderBuilder();
  }

  function switchBuilderMode(mode) {
    if (!builderModes[mode]) return;
    builderMode = mode;
    $$("[data-builder-mode]").forEach(button => {
      const selected = button.dataset.builderMode === mode;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-selected", String(selected));
    });
    renderBuilderPalette(); renderBuilder();
    const names = { carbohydrate: "carbohidratos", protein: "proteínas", lipid: "lípidos" };
    explainBuilder(`Construye ${names[mode]}`, mode === "lipid" ? "Reúne un glicerol y tres ácidos grasos. Después forma enlaces éster por condensación." : "Añade unidades básicas, muévelas en la mesa y usa condensación para enlazarlas.");
  }

  function renderBuilderPalette() {
    const config = builderModes[builderMode];
    const palette = $("#builder-palette");
    palette.innerHTML = config.pieces.map(piece => `<button class="palette-piece" draggable="true" data-piece-type="${piece.type}"><span class="piece-shape ${piece.shape}">${piece.symbol}</span><span><strong>${piece.label}</strong><small>${piece.detail}</small></span></button>`).join("");
    $$("[data-piece-type]", palette).forEach(button => {
      button.addEventListener("click", () => addBuilderPiece(button.dataset.pieceType));
      button.addEventListener("dragstart", event => {
        event.dataTransfer.effectAllowed = "copy";
        event.dataTransfer.setData("text/biolab-piece", button.dataset.pieceType);
      });
    });
  }

  function addBuilderPiece(type, position) {
    const state = builderStates[builderMode];
    const config = builderModes[builderMode];
    const definition = config.pieces.find(piece => piece.type === type);
    if (!definition) return;
    if (state.bonded) { toast("Usa hidrólisis antes de añadir más piezas"); return; }
    if (state.pieces.length >= config.max) { toast("La mesa ya tiene el máximo de piezas para este modelo"); return; }
    if (builderMode === "lipid") {
      const count = state.pieces.filter(piece => piece.type === type).length;
      if ((type === "glycerol" && count >= 1) || (type === "fatty" && count >= 3)) { toast(type === "glycerol" ? "Solo necesitas un glicerol" : "Un triglicérido usa tres ácidos grasos"); return; }
    }
    const index = state.pieces.length;
    state.pieces.push({ ...definition, id: ++builderPieceId, x: position?.x ?? 18 + (index % 4) * 21, y: position?.y ?? 34 + (index % 2) * 30 });
    renderBuilder();
    explainBuilder(`${definition.label} añadida`, `Esta pieza es una unidad de construcción. Añade las unidades necesarias y luego ejecuta la condensación.`);
  }

  function builderReady() {
    const state = builderStates[builderMode];
    if (builderMode !== "lipid") return state.pieces.length >= 2;
    return state.pieces.filter(piece => piece.type === "glycerol").length === 1 && state.pieces.filter(piece => piece.type === "fatty").length === 3;
  }

  function renderBuilder() {
    const state = builderStates[builderMode];
    const config = builderModes[builderMode];
    if (state.bonded) layoutBondedPieces();
    const piecesRoot = $("#builder-pieces");
    piecesRoot.innerHTML = state.pieces.map(piece => `<div class="builder-piece ${state.bonded ? "bonded" : ""}" data-builder-id="${piece.id}" data-piece-type="${piece.type}" style="--x:${piece.x}%;--y:${piece.y}%"><button class="remove-piece" data-remove-piece="${piece.id}" aria-label="Quitar ${piece.label}">×</button><span class="piece-shape ${piece.shape}">${piece.symbol}</span><strong>${piece.label}</strong><small>${piece.placed || piece.detail}</small></div>`).join("");
    renderBuilderBonds();
    $$('[data-remove-piece]', piecesRoot).forEach(button => button.addEventListener("click", event => { event.stopPropagation(); removeBuilderPiece(+button.dataset.removePiece); }));
    $$("[data-builder-id]", piecesRoot).forEach(enablePieceDrag);
    $("#builder-hint").classList.toggle("hidden", state.pieces.length > 0);
    $("#builder-hint strong").textContent = config.hint;
    $("#builder-mission").textContent = config.mission;
    $("#builder-mission-copy").textContent = config.missionCopy;
    $("#builder-formula").textContent = config.formula;
    $("#builder-product").textContent = config.product;
    $("#stat-units").textContent = state.pieces.length;
    $("#stat-bonds").textContent = state.bonds;
    $("#stat-water").textContent = state.water;
    const progress = builderMode === "lipid" ? (state.pieces.some(piece => piece.type === "glycerol") ? 1 : 0) + state.pieces.filter(piece => piece.type === "fatty").length : Math.min(state.pieces.length, config.required);
    $("#mission-progress").style.width = `${Math.min(100, progress / config.required * 100)}%`;
    $("#mission-status").textContent = state.bonded ? "Misión lograda · prueba ahora la hidrólisis" : `${progress} de ${config.required} piezas`;
    $("#condense-button").disabled = state.bonded || !builderReady();
    $("#hydrolyze-button").disabled = !state.bonded;
    $("#reaction-arrow").textContent = state.bonded ? "MOLÉCULA → UNIDADES" : "UNIDADES → MOLÉCULA";
    $("#builder-molecule-name").textContent = moleculeName(state);
  }

  function moleculeName(state) {
    if (!state.bonded) return state.pieces.length ? "Unidades aún sin enlazar" : "Molécula sin formar";
    if (builderMode === "lipid") return "Triglicérido formado";
    if (builderMode === "protein") return state.pieces.length === 2 ? "Dipéptido formado" : state.pieces.length === 3 ? "Tripéptido formado" : `Péptido de ${state.pieces.length} aminoácidos`;
    return state.pieces.length === 2 ? "Disacárido formado" : state.pieces.length <= 5 ? `Oligosacárido de ${state.pieces.length} unidades` : "Cadena corta de polisacárido";
  }

  function layoutBondedPieces() {
    const state = builderStates[builderMode];
    if (builderMode === "lipid") {
      const glycerol = state.pieces.find(piece => piece.type === "glycerol");
      if (glycerol) { glycerol.x = 27; glycerol.y = 50; }
      state.pieces.filter(piece => piece.type === "fatty").forEach((piece, index) => { piece.x = 70; piece.y = 25 + index * 25; });
      return;
    }
    const step = state.pieces.length > 1 ? 78 / (state.pieces.length - 1) : 0;
    state.pieces.forEach((piece, index) => { piece.x = 11 + step * index; piece.y = 49; });
  }

  function renderBuilderBonds() {
    const state = builderStates[builderMode];
    const root = $("#builder-bonds");
    if (!state.bonded) { root.innerHTML = ""; return; }
    if (builderMode === "lipid") {
      root.innerHTML = [25,50,75].map((y, index) => `<i class="molecular-bond" style="left:27%;top:${y}%;width:43%;--rotate:rotate(0deg)"></i>${index === 1 ? `<span class="bond-label" style="left:49%;top:44%">3 enlaces éster</span>` : ""}`).join("");
    } else {
      root.innerHTML = state.pieces.slice(0,-1).map((piece, index) => {
        const next = state.pieces[index + 1];
        return `<i class="molecular-bond" style="left:${piece.x + 5}%;top:${piece.y}%;width:${Math.max(3,next.x - piece.x - 10)}%;--rotate:rotate(0deg)"></i>${index === 0 ? `<span class="bond-label" style="left:${(piece.x + next.x) / 2}%;top:${piece.y - 10}%">${builderModes[builderMode].bondName}</span>` : ""}`;
      }).join("");
    }
  }

  function enablePieceDrag(element) {
    const state = builderStates[builderMode];
    if (state.bonded) return;
    const piece = state.pieces.find(item => item.id === +element.dataset.builderId);
    if (!piece) return;
    element.addEventListener("pointerdown", event => {
      if (event.target.closest("button")) return;
      element.setPointerCapture(event.pointerId);
      const canvas = $("#builder-canvas");
      const move = moveEvent => {
        const rect = canvas.getBoundingClientRect();
        piece.x = Math.max(7, Math.min(93, (moveEvent.clientX - rect.left) / rect.width * 100));
        piece.y = Math.max(10, Math.min(90, (moveEvent.clientY - rect.top) / rect.height * 100));
        element.style.setProperty("--x", `${piece.x}%`); element.style.setProperty("--y", `${piece.y}%`);
      };
      const end = () => { element.removeEventListener("pointermove", move); element.removeEventListener("pointerup", end); };
      element.addEventListener("pointermove", move); element.addEventListener("pointerup", end);
    });
  }

  function removeBuilderPiece(id) {
    const state = builderStates[builderMode];
    if (state.bonded) return;
    state.pieces = state.pieces.filter(piece => piece.id !== id);
    renderBuilder(); explainBuilder("Pieza retirada", "La mesa vuelve a mostrar solo las unidades que participarán en la reacción.");
  }

  function condenseBuilder() {
    const state = builderStates[builderMode];
    if (!builderReady() || state.bonded) return;
    state.bonded = true;
    state.bonds = builderMode === "lipid" ? 3 : state.pieces.length - 1;
    state.water = state.bonds;
    renderBuilder(); animateWater("out", state.water);
    $("#builder-canvas").classList.add("reaction-active"); setTimeout(() => $("#builder-canvas").classList.remove("reaction-active"), 850);
    const unit = builderMode === "protein" ? "aminoácidos" : builderMode === "lipid" ? "componentes del lípido" : "monosacáridos";
    explainBuilder("Condensación completada", `Se formaron ${state.bonds} ${state.bonds === 1 ? "enlace" : "enlaces"} entre los ${unit}. Por cada enlace salió una molécula de H₂O.`);
  }

  function hydrolyzeBuilder() {
    const state = builderStates[builderMode];
    if (!state.bonded) return;
    const waterCount = state.bonds;
    animateWater("in", waterCount);
    state.bonded = false; state.bonds = 0; state.water = 0;
    state.pieces.forEach((piece, index) => { piece.x = 18 + (index % 4) * 21; piece.y = 34 + (index % 2) * 30; });
    setTimeout(renderBuilder, 360);
    explainBuilder("Hidrólisis completada", `Entraron ${waterCount} ${waterCount === 1 ? "molécula" : "moléculas"} de H₂O y se rompieron los enlaces. Las unidades básicas vuelven a estar separadas.`);
  }

  function animateWater(direction, count) {
    const root = $("#water-events");
    root.innerHTML = Array.from({ length: count }, (_, index) => `<span class="water-token ${direction}" style="--offset:${(index - (count - 1) / 2) * 58}px;animation-delay:${index * .12}s">H₂O</span>`).join("");
    setTimeout(() => root.innerHTML = "", 2100);
  }

  function explainBuilder(title, text) {
    $("#builder-explanation").innerHTML = `<span>¿QUÉ ESTÁ OCURRIENDO?</span><h3>${title}</h3><p>${text}</p>`;
  }

  function resetBuilder() {
    builderStates[builderMode] = { pieces: [], bonded: false, bonds: 0, water: 0 };
    $("#water-events").innerHTML = ""; renderBuilder();
    explainBuilder("Mesa reiniciada", "Añade las unidades básicas y decide cuándo ejecutar la condensación.");
  }

  function updateOutput(id, suffix) {
    const input = $("#" + id);
    const output = $("#" + id + "-out");
    if (!input || !output) return;
    const render = () => output.textContent = `${input.value} ${suffix}`;
    input.addEventListener("input", render); render();
  }

  function setupLabControls() {
    ["benedict", "sudan", "biuret"].forEach(lab => {
      const simulator = $(`.simulator[data-lab="${lab}"]`);
      $$(".choice-chip", simulator).forEach(button => button.addEventListener("click", () => {
        $$(".choice-chip", simulator).forEach(item => item.classList.remove("selected"));
        button.classList.add("selected");
        simulator.dataset.prediction = button.dataset.predict;
        resetProcedure(lab, true);
        setRail(lab, 2);
      }));
      const guide = $(`.procedure-guide[data-procedure="${lab}"]`);
      $$("[data-step]", guide).forEach(button => button.addEventListener("click", () => advanceProcedure(lab, +button.dataset.step)));
      $$(`select, input[type="range"]`, simulator).forEach(control => control.addEventListener("change", () => {
        if (procedureState[lab] > 0) {
          resetProcedure(lab, Boolean(simulator.dataset.prediction));
          toast("Cambió una variable: repite el protocolo");
        }
      }));
    });
    updateOutput("benedict-concentration", "%"); updateOutput("benedict-temp", "°C"); updateOutput("benedict-time", "min");
    updateOutput("sudan-concentration", "%"); updateOutput("sudan-reagent", "gotas"); updateOutput("sudan-time", "s");
    updateOutput("biuret-concentration", "%"); updateOutput("biuret-reagent", "gotas"); updateOutput("biuret-time", "min");
    $$('[data-run]').forEach(button => button.addEventListener("click", () => runExperiment(button.dataset.run)));
    $$('[data-reset]').forEach(button => button.addEventListener("click", () => resetLab(button.dataset.reset)));
    $("#check-mystery").addEventListener("click", checkMystery);
  }

  function resetProcedure(lab, predictionReady = false) {
    procedureState[lab] = 0;
    const buttons = $$(`[data-step]`, $(`.procedure-guide[data-procedure="${lab}"]`));
    buttons.forEach((button, index) => {
      button.classList.remove("done", "next");
      button.querySelector("span").textContent = String(index + 1);
      button.disabled = true;
      if (predictionReady && index === 0) { button.disabled = false; button.classList.add("next"); }
    });
    $(`[data-run="${lab}"]`).disabled = true;
  }

  function advanceProcedure(lab, step) {
    if (step !== procedureState[lab]) return;
    const buttons = $$(`[data-step]`, $(`.procedure-guide[data-procedure="${lab}"]`));
    const button = buttons[step];
    button.classList.remove("next"); button.classList.add("done"); button.disabled = true;
    button.querySelector("span").textContent = "✓";
    procedureState[lab] += 1;
    if (procedureState[lab] < buttons.length) {
      buttons[procedureState[lab]].disabled = false;
      buttons[procedureState[lab]].classList.add("next");
    } else {
      $(`[data-run="${lab}"]`).disabled = false;
      toast("Protocolo completo: observa el resultado");
    }
    const stage = $(`#view-${lab} .tube-stage`);
    stage.dataset.protocolStage = String(procedureState[lab]);
  }

  function completeProcedure(lab) {
    const simulator = $(`.simulator[data-lab="${lab}"]`);
    if (!simulator.dataset.prediction) simulator.dataset.prediction = "unsure";
    const buttons = $$(`[data-step]`, $(`.procedure-guide[data-procedure="${lab}"]`));
    buttons.forEach(button => { button.classList.add("done"); button.classList.remove("next"); button.disabled = true; button.querySelector("span").textContent = "✓"; });
    procedureState[lab] = buttons.length;
    $(`[data-run="${lab}"]`).disabled = false;
  }

  function setRail(lab, completed) {
    const rail = $(`#view-${lab} .p-rail`);
    const steps = $$('span', rail);
    steps.forEach((step, index) => {
      step.classList.toggle("done", index < completed);
      step.classList.toggle("current", index === completed && completed < steps.length);
    });
  }

  function predictionFeedback(simulator, isPositive) {
    const prediction = simulator.dataset.prediction;
    if (!prediction || prediction === "unsure") return "Ahora compara esta evidencia con tu predicción.";
    const matches = (prediction === "yes") === isPositive;
    return matches ? "La evidencia coincide con tu predicción." : "La evidencia no coincide con tu predicción: una hipótesis puede corregirse.";
  }

  function describeLevel(value, levels) {
    if (value < .06) return levels[0];
    if (value < .2) return levels[1];
    if (value < .42) return levels[2];
    if (value < .65) return levels[3];
    return levels[4] || levels[3];
  }

  async function runExperiment(lab, fromTool = false) {
    const simulator = $(`.simulator[data-lab="${lab}"]`);
    const button = $(`[data-run="${lab}"]`);
    if (fromTool) completeProcedure(lab);
    if (procedureState[lab] < 3) { toast("Completa primero el protocolo"); return null; }
    simulator.classList.add("running");
    button.disabled = true;
    $(`#${lab}-state`).textContent = "Reacción en curso…";
    setRail(lab, 3);
    await new Promise(resolve => setTimeout(resolve, fromTool ? 120 : 1050));

    let result;
    if (lab === "benedict") result = finishBenedict(simulator);
    if (lab === "sudan") result = finishSudan(simulator);
    if (lab === "biuret") result = finishBiuret(simulator);
    simulator.classList.remove("running");
    button.disabled = false;
    setRail(lab, 4);
    lastExperiment = { lab, ...result };
    updateSignal(lab, result.value, result.level);
    appendNotebook(lab, lastExperiment);
    if (result.sample === "unknown") updateMysteryProgress(lab);
    return lastExperiment;
  }

  function updateSignal(lab, value, level) {
    $(`#${lab}-signal`).style.width = `${Math.max(2, Math.min(100, value))}%`;
    $(`#${lab}-signal-out`).textContent = level;
  }

  function appendNotebook(lab, result) {
    const entries = labLogs[lab];
    entries.push(result);
    if (entries.length > 5) entries.shift();
    const tbody = $(`#${lab}-log`);
    tbody.innerHTML = entries.map((entry, index) => `<tr><td data-label="Ensayo">${index + 1}</td><td data-label="Muestra">${entry.label}</td><td data-label="Condiciones">${entry.conditions}</td><td data-label="Evidencia"><span class="${entry.positive ? "evidence-positive" : "evidence-negative"}">${entry.evidence}</span></td><td data-label="Conclusión">${entry.conclusion}</td></tr>`).join("");
  }

  function updateMysteryProgress(lab) {
    mysteryResults[lab] = true;
    $(`[data-mystery-lab="${lab}"]`).classList.add("complete");
    const complete = Object.values(mysteryResults).every(Boolean);
    $("#check-mystery").disabled = !complete;
    $("#mystery-feedback").textContent = complete ? "Ya tienes las tres evidencias. Formula tu conclusión." : "Buen avance: aún faltan pruebas con la muestra X.";
  }

  function checkMystery() {
    const answer = $("#mystery-answer").value;
    const feedback = $("#mystery-feedback");
    feedback.className = "";
    if (!answer) { feedback.textContent = "Selecciona una conclusión antes de comprobar."; feedback.classList.add("retry"); return; }
    if (answer === mysteryKey) {
      feedback.textContent = `Correcto: la muestra X era ${mysteryProfile.name}. Tu conclusión integra las tres evidencias.`;
      feedback.classList.add("success");
    } else {
      feedback.textContent = "Esa conclusión no coincide con el patrón. Revisa qué pruebas fueron positivas y su intensidad.";
      feedback.classList.add("retry");
    }
  }

  function finishBenedict(simulator) {
    const sampleKey = $("#benedict-sample").value;
    const [base, label] = labModels.benedict.samples[sampleKey];
    const concentration = +$("#benedict-concentration").value / 100;
    const temp = +$("#benedict-temp").value;
    const time = +$("#benedict-time").value;
    const heatEfficiency = temp < 50 ? .08 : Math.min(1, (temp - 40) / 45);
    const timeEfficiency = Math.min(1, time / 4);
    const value = base * concentration * heatEfficiency * timeEfficiency;
    const level = describeLevel(value, ["negativo", "bajo", "medio", "alto", "muy alto"]);
    const index = ["negativo", "bajo", "medio", "alto", "muy alto"].indexOf(level);
    const isPositive = index > 0;
    $("#benedict-liquid").style.background = labModels.benedict.colors[index];
    $("#benedict-state").textContent = isPositive ? `Positivo · nivel ${level}` : "Negativo";
    const explanation = base > 0 && !isPositive ? "Las condiciones de calentamiento fueron insuficientes; repite con más temperatura o tiempo." : "El color se compara con los controles y la escala de referencia.";
    renderLabResult("benedict", isPositive, isPositive ? `Resultado ${level}: hay azúcares reductores` : "No se detectaron azúcares reductores", `En ${label}, ${explanation} ${predictionFeedback(simulator, isPositive)}`);
    return { sample: sampleKey, label, positive: isPositive, level, value: Math.round(value * 100), conditions: `${Math.round(concentration * 100)} % · ${temp} °C · ${time} min`, evidence: `Color ${level}`, conclusion: isPositive ? "Azúcares reductores presentes" : "No detectados en estas condiciones" };
  }

  function finishSudan(simulator) {
    const sampleKey = $("#sudan-sample").value;
    const [base, label] = labModels.sudan.samples[sampleKey];
    const concentration = +$("#sudan-concentration").value / 100;
    const reagent = Math.min(1, +$("#sudan-reagent").value / 4);
    const mixing = .7 + Math.min(.3, +$("#sudan-time").value / 30);
    const value = base * concentration * reagent * mixing;
    const isPositive = value >= .08;
    const level = value < .08 ? "negativo" : value < .3 ? "débil" : value < .65 ? "positivo" : "intenso";
    const layer = $("#sudan-layer");
    layer.classList.toggle("visible", isPositive);
    layer.style.setProperty("--layer-height", `${Math.round(16 + value * 43)}px`);
    $("#sudan-liquid").style.background = isPositive ? "linear-gradient(#efb57d,#d58f58)" : "linear-gradient(#d9bd8e,#b99466)";
    $("#sudan-state").textContent = isPositive ? `Positivo · ${level}` : "Negativo";
    renderLabResult("sudan", isPositive, isPositive ? "Se formó una capa rojiza: hay lípidos" : "No se detectó una capa lipídica", `La muestra de ${label} produjo un resultado ${level}. ${predictionFeedback(simulator, isPositive)}`);
    return { sample: sampleKey, label, positive: isPositive, level, value: Math.round(value * 100), conditions: `${Math.round(concentration * 100)} % · ${$("#sudan-reagent").value} gotas · ${$("#sudan-time").value} s`, evidence: isPositive ? `Capa ${level}` : "Sin capa roja", conclusion: isPositive ? "Lípidos presentes" : "Lípidos no detectados" };
  }

  function finishBiuret(simulator) {
    const sampleKey = $("#biuret-sample").value;
    const [base, label] = labModels.biuret.samples[sampleKey];
    const concentration = +$("#biuret-concentration").value / 100;
    const reagent = Math.min(1, +$("#biuret-reagent").value / 4);
    const wait = Math.min(1, +$("#biuret-time").value / 2);
    const value = base * concentration * reagent * wait;
    const level = describeLevel(value, ["negativo", "débil", "positivo", "intenso"]);
    const index = ["negativo", "débil", "positivo", "intenso"].indexOf(level);
    const isPositive = index > 0;
    $("#biuret-liquid").style.background = labModels.biuret.colors[index];
    $("#biuret-state").textContent = isPositive ? `Positivo · ${level}` : "Negativo";
    const explanation = base > 0 && !isPositive ? "La cantidad o el tiempo fueron insuficientes para observar el violeta." : "El tono violeta evidencia enlaces peptídicos y se compara con el control positivo.";
    renderLabResult("biuret", isPositive, isPositive ? "Cambio a violeta: hay proteínas" : "No se detectaron proteínas", `En ${label}, ${explanation} ${predictionFeedback(simulator, isPositive)}`);
    return { sample: sampleKey, label, positive: isPositive, level, value: Math.round(value * 100), conditions: `${Math.round(concentration * 100)} % · ${$("#biuret-reagent").value} gotas · ${$("#biuret-time").value} min`, evidence: `Color ${level}`, conclusion: isPositive ? "Proteínas presentes" : "No detectadas en estas condiciones" };
  }

  function renderLabResult(lab, positive, title, text) {
    const box = $(`#${lab}-result`);
    box.className = `result-box ${positive ? "positive" : "negative"}`;
    box.innerHTML = `<span>P4 · RESULTADO</span><h3>${title}</h3><p>${text}</p><p><strong>P5:</strong> formula una conclusión que incluya la muestra, el resultado y la evidencia.</p>`;
  }

  function resetLab(lab) {
    const defaults = lab === "benedict" ? [["concentration",60],["temp",80],["time",4]] : lab === "sudan" ? [["concentration",60],["reagent",5],["time",5]] : [["concentration",60],["reagent",5],["time",3]];
    defaults.forEach(([id, value]) => {
      const input = $(`#${lab}-${id}`); input.value = value; input.dispatchEvent(new Event("input"));
    });
    const simulator = $(`.simulator[data-lab="${lab}"]`);
    delete simulator.dataset.prediction;
    $$(".choice-chip", simulator).forEach(button => button.classList.remove("selected"));
    resetProcedure(lab, false);
    delete $(`#view-${lab} .tube-stage`).dataset.protocolStage;
    $(`#${lab}-state`).textContent = "Sin ejecutar";
    $(`#${lab}-signal`).style.width = "0";
    $(`#${lab}-signal-out`).textContent = "Sin lectura";
    $(`#${lab}-result`).className = "result-box";
    $(`#${lab}-result`).innerHTML = "<span>P4 · RESULTADO</span><h3>Configura y ejecuta el ensayo</h3><p>La interpretación aparecerá aquí.</p>";
    if (lab === "benedict") $("#benedict-liquid").style.background = "linear-gradient(180deg,#45aaff,#1674cc)";
    if (lab === "sudan") { $("#sudan-layer").classList.remove("visible"); $("#sudan-liquid").style.background = "linear-gradient(180deg,#45aaff,#1674cc)"; }
    if (lab === "biuret") $("#biuret-liquid").style.background = "linear-gradient(180deg,#45aaff,#1674cc)";
    setRail(lab, 1);
  }

  function setupQuiz() {
    $("#start-quiz").addEventListener("click", startQuiz);
    $("#quiz-form").addEventListener("change", updateQuizProgress);
    $("#quiz-form").addEventListener("submit", submitQuiz);
    hydrateAttempt();
  }

  function renderQuestionVisual(item) {
    const text = (x, y, content, color = "#334843") => `<text x="${x}" y="${y}" fill="${({"#62e6ff":"#28665f","#ffbd4b":"#906005"})[color] || color}" font-size="16" text-anchor="middle">${content}</text>`;
    const sugar = (x, label) => `<polygon points="${x-26},49 ${x+26},49 ${x+40},76 ${x+26},103 ${x-26},103 ${x-40},76" fill="#ffbd4b"/>${text(x,82,label,"#352400")}`;
    const tube = (x, label, color, caption, layered = false) => `<path d="M${x-22} 20v75a22 22 0 0 0 44 0V20" fill="#112c48" stroke="#afcce0" stroke-width="3"/><path d="M${x-17} 61v33a17 17 0 0 0 34 0V61Z" fill="${color}"/>${layered ? `<rect x="${x-17}" y="55" width="34" height="17" rx="3" fill="#e75748"/>` : ""}<path d="M${x-27} 20h54" stroke="#afcce0" stroke-width="4" stroke-linecap="round"/>${text(x,143,label)}${text(x,166,caption)}`;
    let body = "";
    let description = "";
    switch (item.visual) {
      case "condensation":
        description = "Glucosa y fructosa separadas; después aparecen unidas y se libera H₂O.";
        body = sugar(75,"G") + text(145,82,"+") + sugar(215,"F") + text(305,82,"→","#62e6ff") + sugar(388,"G") + `<line x1="428" y1="76" x2="447" y2="76" stroke="#62e6ff" stroke-width="4"/>` + sugar(487,"F") + text(590,82,"H₂O","#62e6ff") + text(145,145,"Unidades separadas") + text(438,145,"Unidades enlazadas") + text(590,145,"Sale agua");
        break;
      case "foods":
        description = "La fruta contiene azúcares sencillos. El arroz contiene cadenas de almidón; los alimentos no son sustancias puras.";
        body = sugar(125,"G") + text(125,145,"Fruta: azúcares") + `<path d="M320 76h244" stroke="#62e6ff" stroke-width="4"/>` + [330,390,450,510,570].map(x => `<circle cx="${x}" cy="76" r="21" fill="#ffbd4b"/>${text(x,82,"G","#352400")}`).join("") + text(450,145,"Arroz: almidón");
        break;
      case "triglyceride":
        description = "Modelo de triglicérido con un componente central y tres componentes laterales por identificar.";
        body = `<rect x="120" y="34" width="95" height="115" rx="15" fill="#1a665f"/>${text(168,96,"?")}<path d="M215 54h80M215 91h80M215 128h80" stroke="#62e6ff" stroke-width="4"/>` + [54,91,128].map(y => `<rect x="295" y="${y-15}" width="215" height="30" rx="15" fill="#6a334b"/>${text(403,y+6,"?")}`).join("");
        break;
      case "oil-water":
        description = "Después de agitar y dejar reposar, se observan una capa superior de aceite y una capa inferior de agua.";
        body = `<path d="M185 18v130h140V18" fill="#112c48" stroke="#afcce0" stroke-width="3"/><rect x="190" y="48" width="130" height="40" fill="#e1ac4d"/><rect x="190" y="88" width="130" height="55" fill="#247db3"/>${text(447,75,"Aceite: capa superior")}<path d="M326 70h30" stroke="#e1ac4d" stroke-width="2"/>${text(447,121,"Agua: capa inferior")}<path d="M326 115h30" stroke="#62e6ff" stroke-width="2"/>`;
        break;
      case "peptide":
        description = "Cuatro aminoácidos enlazados y tres moléculas de agua que entran para la hidrólisis completa.";
        body = `<path d="M110 99h420" stroke="#a783ff" stroke-width="5"/>` + [110,250,390,530].map((x,i) => `<circle cx="${x}" cy="99" r="29" fill="#a783ff"/>${text(x,105,["Gly","Ala","Ser","Val"][i],"#21113e")}`).join("") + [180,320,460].map(x => text(x,38,"H₂O","#62e6ff") + `<path d="M${x} 49v25m-5-5 5 5 5-5" stroke="#62e6ff" stroke-width="2" fill="none"/>`).join("") + text(320,158,"Cadena de aminoácidos antes de la hidrólisis");
        break;
      case "biuret-result":
        description = "Con Biuret, la muestra adquiere color violeta y el control con agua permanece azul.";
        body = tube(205,"Muestra","#8a53d0","Violeta") + tube(435,"Control: agua","#2487e8","Azul");
        break;
      case "research":
        description = "Mesa de investigación: muestra aceitosa, Sudan III y controles de agua y aceite.";
        body = `<rect x="22" y="29" width="596" height="117" rx="14" fill="#102e4c" stroke="#284566"/>${["Muestra aceitosa","Sudan III","Control: agua","Control: aceite"].map((label,i) => `<circle cx="${96+i*150}" cy="69" r="18" fill="${["#c4a364","#e75748","#2487e8","#e1ac4d"][i]}"/>${text(96+i*150,116,label)}`).join("")}`;
        break;
      case "equal-volumes":
        description = "Dos tubos, A y B, con igual volumen de muestra: 2 mL en cada uno, igual reactivo y tiempo.";
        body = tube(190,"Muestra A","#5784a2","2 mL") + tube(450,"Muestra B","#5784a2","2 mL") + text(320,53,"=") + text(320,83,"Igual reactivo") + text(320,106,"Igual espera");
        break;
      case "benedict-control":
        description = "Benedict sin calentamiento: la muestra y el control de glucosa permanecen azules. Se trabajó a 20 °C.";
        body = tube(160,"Muestra","#2487e8","Azul") + tube(420,"Control: glucosa","#2487e8","Azul") + text(585,71,"20 °C","#ffbd4b") + text(585,101,"Sin calor");
        break;
      case "integrated-results":
        description = "Tres tubos separados del mismo alimento: Benedict con precipitado naranja, Sudan III con capa roja y Biuret violeta.";
        body = tube(110,"Benedict","#ef8a2f","Precipitado naranja") + tube(320,"Sudan III","#d8ab79","Capa roja",true) + tube(530,"Biuret","#8a53d0","Violeta");
        break;
    }
    const paperVisual = body.replaceAll("#112c48", "#f7f9f6").replaceAll("#102e4c", "#edf1eb").replaceAll("#afcce0", "#708b83").replaceAll("#284566", "#c8d3cd").replaceAll("#62e6ff", "#5d938d").replaceAll("#1a665f", "#acc9bf").replaceAll("#6a334b", "#dea17d");
    return `<div class="question-visual"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 180" role="img" aria-label="${escapeHtml(description)}" style="font-family:inherit"><title>${escapeHtml(description)}</title>${paperVisual}</svg></div>`;
  }

  function startQuiz() {
    if (localStorage.getItem(STORAGE.attempt)) { hydrateAttempt(); return; }
    const name = $("#student-name").value.trim();
    if (name.length < 2) { $("#name-error").textContent = "Escribe tu nombre para continuar."; $("#student-name").focus(); return; }
    $("#name-error").textContent = "";
    $("#quiz-student").textContent = name;
    $("#quiz-form").dataset.student = name;
    $("#questions").innerHTML = questions.map((item, index) => `
      <fieldset class="question-card">
        <legend><span class="question-number">${index + 1}</span>${item.q}</legend>
        <div class="question-scenario"><p class="scenario-context">${item.context}</p>${renderQuestionVisual(item)}</div>
        ${item.options.map((option, choice) => `<label class="answer-option"><input type="radio" name="q${index}" value="${choice}" required><span class="answer-letter" aria-hidden="true">${"ABCD"[choice]}</span><span>${option}</span></label>`).join("")}
      </fieldset>`).join("");
    $("#quiz-start").hidden = true;
    $("#quiz-form").hidden = false;
    $("#quiz-result").hidden = true;
    updateQuizProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateQuizProgress() {
    const answers = questions.map((_, index) => $(`input[name="q${index}"]:checked`)).filter(Boolean);
    $("#quiz-counter").textContent = `${answers.length} de ${questions.length} respondidas`;
    $("#quiz-progress-bar").style.width = `${answers.length / questions.length * 100}%`;
    $("#submit-quiz").disabled = answers.length !== questions.length;
  }

  async function submitQuiz(event) {
    event.preventDefault();
    if (localStorage.getItem(STORAGE.attempt)) { hydrateAttempt(); return; }
    const selections = questions.map((_, index) => $(`input[name="q${index}"]:checked`));
    if (selections.some(selection => !selection)) { toast("Responde las 10 preguntas antes de entregar"); return; }
    const answers = selections.map(selection => Number(selection.value));
    const score = answers.reduce((sum, answer, index) => sum + Number(answer === questions[index].answer), 0);
    const record = {
      attemptId: crypto.randomUUID?.() || `biolab-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: $("#quiz-form").dataset.student,
      answers,
      score,
      total: questions.length,
      grade: Number((score / questions.length * 10).toFixed(2)),
      percentage: Math.round(score / questions.length * 100),
      submittedAt: new Date().toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      remoteStatus: "pending",
      source: "biolab-prototype",
      assessmentVersion,
      questionIds: questions.map(item => item.id),
      questionSnapshot: questions.map(({ id, q, options, answer, why }) => ({ id, q, options, answer, why }))
    };
    localStorage.setItem(STORAGE.attempt, JSON.stringify(record));
    renderQuizResult(record);
    await persistEvaluationRecord(record);
  }

  async function persistEvaluationRecord(record) {
    const sync = window.BioLabEvaluationSync;
    record.attemptId ||= crypto.randomUUID?.() || `biolab-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    activeRegistration = record.attemptId;
    record.remoteStatus = sync.endpoint() ? "sending" : "not-configured";
    localStorage.setItem(STORAGE.attempt, JSON.stringify(record));
    updateRemoteStatus(record);
    record.remoteStatus = await sync.send(record);
    activeRegistration = null;
    localStorage.setItem(STORAGE.attempt, JSON.stringify(record));
    updateRemoteStatus(record);
    return record.remoteStatus;
  }

  function updateRemoteStatus(record) {
    const panel = $("#remote-registration");
    if (!panel) return;
    const state = window.BioLabEvaluationSync.status(record);
    panel.dataset.state = state.kind;
    panel.innerHTML = `<p role="status">${escapeHtml(state.text)}</p>${state.retry ? '<button class="text-button" id="retry-registration" type="button">Reintentar solo el registro</button><small>No repite el examen ni cambia tu nota.</small>' : ""}`;
    $("#retry-registration")?.addEventListener("click", () => persistEvaluationRecord(record));
  }

  function hydrateAttempt() {
    const raw = localStorage.getItem(STORAGE.attempt);
    if (!raw) return;
    try {
      const record = JSON.parse(raw);
      // A page closed during a POST no longer has a live request after reload.
      if (record.remoteStatus === "sending" && activeRegistration !== record.attemptId) {
        record.remoteStatus = "pending";
        localStorage.setItem(STORAGE.attempt, JSON.stringify(record));
      }
      renderQuizResult(record);
    } catch (_) { /* Ignore corrupted local data. */ }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" })[char]);
  }

  function renderQuizResult(record) {
    $("#quiz-start").hidden = true;
    $("#quiz-form").hidden = true;
    const result = $("#quiz-result");
    const percentage = Math.round(record.score / record.total * 100);
    const message = percentage >= 80 ? "Dominio logrado" : percentage >= 60 ? "Buen avance" : "Sigue investigando";
    const date = new Intl.DateTimeFormat("es", { dateStyle: "medium", timeStyle: "short" }).format(new Date(record.submittedAt));
    const historicalAttempt = record.assessmentVersion !== assessmentVersion;
    const reviewEntries = window.BioLabAssessment.reviewForAttempt(record);
    result.innerHTML = `
      <div class="score-hero">
        <div class="score-ring" style="--score:${percentage}%"><div><strong>${record.grade ?? record.score}/10</strong><small>${percentage} %</small></div></div>
        <span class="section-kicker">INTENTO FINALIZADO</span><h2>${message}</h2>
        <p>${escapeHtml(record.name)}, tu nota se calculó y guardó inmediatamente.</p>
      </div>
      <div class="result-summary"><div><strong>${record.score}</strong><span>respuestas correctas</span></div><div><strong>${record.total - record.score}</strong><span>por revisar</span></div><div><strong>1/1</strong><span>intento utilizado</span></div></div>
      <div class="remote-registration" id="remote-registration"></div>
      ${historicalAttempt ? '<p class="legacy-attempt-note">Este resultado corresponde a una evaluación anterior. Conservamos tu nota y tu intento, sin recalificarlos. La retroalimentación muestra solo preguntas dentro del alcance actual.</p>' : ""}
      <div class="review-list"><h3>Retroalimentación</h3>${reviewEntries.length ? reviewEntries.map(({item, index}) => {
        const correct = record.answers[index] === item.answer;
        const chosen = item.options?.[record.answers[index]];
        const expected = item.options?.[item.answer];
        return `<div class="review-item ${correct ? "correct" : "incorrect"}"><strong>${correct ? "✓" : "×"} ${index + 1}. ${correct ? "Correcta" : "Para seguir aprendiendo"}</strong><h4 class="review-question">${escapeHtml(item.q)}</h4>${chosen ? `<p class="review-answer"><b>Tu respuesta:</b> ${escapeHtml(chosen)}</p>` : ""}${!correct && expected ? `<p class="review-answer"><b>Respuesta correcta:</b> ${escapeHtml(expected)}</p>` : ""}<p>${escapeHtml(item.why)}</p></div>`;
      }).join("") : '<p>La nota original se conserva; no hay una revisión compatible disponible para este intento anterior.</p>'}</div>
      <div class="save-note">Intento finalizado · ${date}<br><small>Tu resultado queda disponible en este dispositivo.</small></div>`;
    result.hidden = false;
    updateRemoteStatus(record);
  }

  function setupSpeech() {
    const button = $("#sound-button");
    if (!("speechSynthesis" in window)) { button.hidden = true; return; }
    button.addEventListener("click", () => {
      if (speechSynthesis.speaking) { speechSynthesis.cancel(); button.textContent = "♪"; return; }
      const view = $("#view-" + activeView);
      const text = view.innerText.replace(/\s+/g, " ").slice(0, 2500);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES"; utterance.rate = .95;
      utterance.onend = () => button.textContent = "♪";
      button.textContent = "■"; speechSynthesis.speak(utterance);
    });
  }

  function setupConnectivity() {
    const badge = $("#connection-badge");
    const render = () => {
      const offline = !navigator.onLine;
      badge.textContent = offline ? "● Modo sin conexión" : "● En línea";
      badge.classList.toggle("offline", offline);
    };
    addEventListener("online", render); addEventListener("offline", render); render();
    if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").then(registration => registration.update()).catch(() => {}));
  }

  function setupWebMCP() {
    const context = document.modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = tool => Promise.resolve(context.registerTool(tool, { signal: lifecycle.signal })).catch(() => {});
    register({
      name: "open_biolab_section",
      title: "Abrir sección de BioLab",
      description: "Navega a una sección educativa o laboratorio visible de BioLab.",
      inputSchema: { type: "object", properties: { section: { type: "string", enum: ["inicio","aprende","constructor","metodo","benedict","sudan","biuret","evaluacion"] } }, required: ["section"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) { if (!input || !$("#view-" + input.section)) throw new Error("Sección no válida"); activateView(input.section); return { section: input.section, title: $("#page-title").textContent }; }
    });
    register({
      name: "run_biolab_simulation",
      title: "Ejecutar simulación de BioLab",
      description: "Configura y ejecuta una de las tres pruebas, actualizando el mismo laboratorio que ve el estudiante.",
      inputSchema: { type: "object", properties: { lab: { type: "string", enum: ["benedict","sudan","biuret"] }, sample: { type: "string" }, concentration: { type: "number", minimum: 10, maximum: 100 } }, required: ["lab","sample"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      async execute(input) {
        if (!labModels[input.lab]?.samples[input.sample]) throw new Error("Muestra no válida para este laboratorio");
        activateView(input.lab);
        $("#" + input.lab + "-sample").value = input.sample;
        if (input.concentration != null) { const field = $("#" + input.lab + "-concentration"); field.value = input.concentration; field.dispatchEvent(new Event("input")); }
        return await runExperiment(input.lab, true);
      }
    });
    register({
      name: "configure_biomolecule_builder",
      title: "Configurar el constructor de biomoléculas",
      description: "Abre el constructor, elige una biomolécula y añade un conjunto de piezas a la mesa visible.",
      inputSchema: { type: "object", properties: { mode: { type: "string", enum: ["carbohydrate","protein","lipid"] }, pieces: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 6 } }, required: ["mode","pieces"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (!builderModes[input.mode]) throw new Error("Modo de construcción no válido");
        activateView("constructor"); switchBuilderMode(input.mode); resetBuilder();
        input.pieces.forEach(type => addBuilderPiece(type));
        return { mode: builderMode, pieces: builderStates[builderMode].pieces.map(piece => piece.type), readyToCondense: builderReady() };
      }
    });
    register({
      name: "run_builder_reaction",
      title: "Ejecutar reacción del constructor",
      description: "Ejecuta condensación o hidrólisis sobre las piezas que ya están en la mesa.",
      inputSchema: { type: "object", properties: { reaction: { type: "string", enum: ["condensation","hydrolysis"] } }, required: ["reaction"], additionalProperties: false },
      annotations: { readOnlyHint: false, untrustedContentHint: false },
      execute(input) {
        if (input.reaction === "condensation") { if (!builderReady() || builderStates[builderMode].bonded) throw new Error("La mesa no está lista para condensación"); condenseBuilder(); }
        else { if (!builderStates[builderMode].bonded) throw new Error("No hay enlaces que hidrolizar"); hydrolyzeBuilder(); }
        const state = builderStates[builderMode];
        return { mode: builderMode, reaction: input.reaction, bonded: state.bonded, bonds: state.bonds, water: state.water, molecule: moleculeName(state) };
      }
    });
    addEventListener("beforeunload", () => lifecycle.abort(), { once: true });
  }

  window.BIOLAB_CONFIG = window.BIOLAB_CONFIG || { evaluationEndpoint: "" };
  window.BioLab = { activateView, runExperiment, getLastExperiment: () => lastExperiment };
  setupNavigation();
  setupSupportMode();
  setupLearningTabs();
  setupBuilder();
  setupLabControls();
  setupQuiz();
  setupSpeech();
  setupConnectivity();
  setupWebMCP();
})();
