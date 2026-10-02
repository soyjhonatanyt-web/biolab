(() => {
  "use strict";

  const endpoint = () => String(window.BioLabConfig?.GOOGLE_SCRIPT_URL || "").trim();
  const payload = record => ({
    nombre: record.name,
    respuestas: record.answers.map(value => "ABCD"[value]),
    nota: record.grade ?? Number((record.score / record.total * 10).toFixed(2)),
    porcentaje: record.percentage ?? Math.round(record.score / record.total * 100)
  });

  async function send(record) {
    if (!endpoint()) return "not-configured";
    if (!navigator.onLine) return "offline";
    // Preserve the original question order, including for a manual retry.
    // Never submit an incomplete or incompatible historical attempt.
    if (record.total !== 10 || !Array.isArray(record.answers) || record.answers.length !== 10 ||
        !record.answers.every(value => Number.isInteger(value) && value >= 0 && value <= 3) ||
        typeof record.name !== "string" || !record.name.trim()) return "error";
    const data = payload(record);
    if (!Number.isFinite(data.nota) || data.nota < 0 || data.nota > 10 ||
        !Number.isFinite(data.porcentaje) || data.porcentaje < 0 || data.porcentaje > 100) return "error";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      // The body is raw JSON. A safelisted text/plain content type avoids
      // preflight; CORS keeps the redirected Apps Script reply readable.
      const response = await fetch(endpoint(), {
        method: "POST",
        mode: "cors",
        credentials: "omit",
        redirect: "follow",
        headers: { "Content-Type": "text/plain;charset=UTF-8" },
        signal: controller.signal,
        body: JSON.stringify(data)
      });
      if (!response.ok) return "error";
      const reply = await response.json();
      if (reply?.duplicado === true) return "duplicate";
      return reply?.ok === true ? "saved" : "error";
    } catch (_) {
      // The local grade is never lost or blocked by a remote failure.
      return "error";
    } finally {
      clearTimeout(timeout);
    }
  }

  function status(record) {
    if (!endpoint()) return { kind: "not-configured", text: "Registro remoto aún no configurado. Tu nota está guardada en este navegador.", retry: false };
    const kind = record.remoteStatus || "pending";
    const messages = {
      sending: "Enviando el resultado. Tu nota ya está disponible.",
      saved: "Evaluación registrada correctamente.",
      sent: "Tu nota está guardada aquí. El registro remoto está pendiente de confirmación.",
      offline: "No se pudo registrar el resultado.",
      error: "No se pudo registrar el resultado.",
      duplicate: "Ya existe una evaluación registrada con este nombre.",
      pending: "Tu nota está guardada aquí. El registro remoto está pendiente.",
      "not-configured": "La conexión ya está configurada. Puedes enviar este resultado sin repetir el examen."
    };
    return { kind, text: messages[kind] || messages.pending, retry: !["sending", "saved", "duplicate"].includes(kind) };
  }

  window.BioLabEvaluationSync = { endpoint, payload, send, status };
})();
