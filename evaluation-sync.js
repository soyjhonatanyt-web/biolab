(() => {
  "use strict";

  const endpoint = () => String(window.BioLabConfig?.GOOGLE_SCRIPT_URL || "").trim();
  const payload = record => ({
    intentoId: record.attemptId,
    nombre: record.name,
    respuestas: record.answers.map(value => "ABCD"[value]),
    correctas: record.score,
    nota: record.grade ?? Number((record.score / record.total * 10).toFixed(2)),
    porcentaje: record.percentage ?? Math.round(record.score / record.total * 100),
    fechaHora: record.submittedAt,
    zonaHoraria: record.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    versionEvaluacion: record.assessmentVersion || "anterior"
  });

  async function send(record) {
    if (!endpoint()) return "not-configured";
    if (!navigator.onLine) return "offline";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      // A simple form POST avoids preflight. Apps Script returns an opaque
      // cross-origin response in this mode: it cannot confirm a saved row.
      const response = await fetch(endpoint(), {
        method: "POST",
        mode: "no-cors",
        redirect: "follow",
        signal: controller.signal,
        body: new URLSearchParams({ payload: JSON.stringify(payload(record)) })
      });
      if (response.type === "opaque") return "sent";
      // A same-origin test endpoint can provide an explicit confirmation.
      if (!response.ok) return "error";
      const reply = await response.json();
      if (reply.ok && reply.intentoId === record.attemptId) return "saved";
      return reply.status === "duplicate" ? "duplicate" : "error";
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
      saved: "Resultado registrado en Google Sheets.",
      sent: "Solicitud de registro enviada; confirmación pendiente. El docente puede comprobarla en Google Sheets.",
      offline: "Sin conexión: el resultado está guardado aquí, pero el registro remoto está pendiente.",
      error: "No se pudo confirmar el envío. Tu nota sigue guardada en este navegador.",
      duplicate: "Ya existe un resultado con este nombre en la hoja. No se añadió otro registro.",
      pending: "Tu nota está guardada aquí. El registro remoto está pendiente.",
      "not-configured": "La conexión ya está configurada. Puedes enviar este resultado sin repetir el examen."
    };
    return { kind, text: messages[kind] || messages.pending, retry: !["sending", "saved", "duplicate"].includes(kind) };
  }

  window.BioLabEvaluationSync = { endpoint, payload, send, status };
})();
