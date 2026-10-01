// Ejemplo preparado para instalar después en Google Apps Script.
// Copia el ID que aparece entre /d/ y /edit en la URL de tu Google Sheet.
const GOOGLE_SHEET_ID = "";
const NOMBRE_HOJA = "Resultados";
const RECHAZAR_NOMBRES_REPETIDOS = true;
const COLUMNAS = ["Fecha", "Nombre", "P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "Nota", "Porcentaje"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    if (!GOOGLE_SHEET_ID.trim()) throw new Error("Falta configurar GOOGLE_SHEET_ID.");
    const datos = JSON.parse(e && e.parameter && e.parameter.payload || "{}");
    validar(datos);
    // Evita que dos entregas simultáneas con el mismo nombre añadan dos filas.
    lock.waitLock(20000);
    const libro = SpreadsheetApp.openById(GOOGLE_SHEET_ID);
    const hoja = libro.getSheetByName(NOMBRE_HOJA) || libro.insertSheet(NOMBRE_HOJA);
    if (hoja.getLastRow() === 0) {
      hoja.appendRow(COLUMNAS);
      hoja.setFrozenRows(1);
    } else {
      const cabecera = hoja.getRange(1, 1, 1, COLUMNAS.length).getDisplayValues()[0];
      if (hoja.getLastColumn() !== COLUMNAS.length || cabecera.some((valor, i) => valor !== COLUMNAS[i])) {
        throw new Error("Las columnas de Resultados no coinciden. Usa una hoja vacía o los encabezados indicados.");
      }
    }

    const nombre = datos.nombre.trim().replace(/\s+/g, " ");
    const claveNombre = normalizarNombre(nombre);
    const marca = "BioLab intento: " + datos.intentoId;
    const ultimaFila = hoja.getLastRow();
    if (ultimaFila > 1) {
      const rango = hoja.getRange(2, 1, ultimaFila - 1, 2);
      const filas = rango.getDisplayValues();
      const notas = rango.getNotes();
      for (let i = 0; i < filas.length; i++) {
        // Reenviar el mismo intento no crea otra fila. El ID está en una nota,
        // por lo que la hoja conserva exactamente las 14 columnas solicitadas.
        if (notas[i][0] === marca) return respuesta({ ok: true, status: "saved", intentoId: datos.intentoId });
        if (normalizarNombre(filas[i][1]) !== claveNombre) continue;
        if (RECHAZAR_NOMBRES_REPETIDOS) return respuesta({ ok: false, status: "duplicate", intentoId: datos.intentoId });
      }
    }
    // Los datos se califican en BioLab; aquí no hay autenticación ni examen secreto.
    // Una comilla inicial hace que un nombre que empiece por = se guarde como texto.
    const nombreParaHoja = nombre.startsWith("=") ? "'" + nombre : nombre;
    hoja.appendRow([new Date(datos.fechaHora), nombreParaHoja, ...datos.respuestas, datos.nota, datos.porcentaje]);
    const fila = hoja.getLastRow();
    hoja.getRange(fila, 1).setNumberFormat("dd/MM/yyyy HH:mm:ss").setNote(marca);
    hoja.getRange(fila, 13).setNumberFormat("0.##");
    hoja.getRange(fila, 14).setNumberFormat('0"%"');
    return respuesta({ ok: true, status: "saved", intentoId: datos.intentoId });
  } catch (error) {
    return respuesta({ ok: false, status: "error", message: String(error.message || error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function validar(datos) {
  if (typeof datos.nombre !== "string" || !datos.nombre.trim() || datos.nombre.length > 100) throw new Error("Nombre no válido.");
  if (typeof datos.intentoId !== "string" || !datos.intentoId || datos.intentoId.length > 200) throw new Error("Falta el identificador del intento.");
  if (!Array.isArray(datos.respuestas) || datos.respuestas.length !== 10 || datos.respuestas.some(letra => !/^[ABCD]$/.test(letra))) throw new Error("Se necesitan diez respuestas, de A a D.");
  if (!Number.isInteger(datos.correctas) || datos.correctas < 0 || datos.correctas > 10) throw new Error("Cantidad de respuestas correctas no válida.");
  if (!Number.isFinite(datos.nota) || datos.nota < 0 || datos.nota > 10) throw new Error("Nota no válida.");
  if (!Number.isFinite(datos.porcentaje) || datos.porcentaje < 0 || datos.porcentaje > 100) throw new Error("Porcentaje no válido.");
  if (typeof datos.fechaHora !== "string" || !Number.isFinite(Date.parse(datos.fechaHora))) throw new Error("Fecha y hora no válidas.");
}

function normalizarNombre(nombre) {
  return String(nombre).normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function respuesta(datos) {
  return ContentService.createTextOutput(JSON.stringify(datos)).setMimeType(ContentService.MimeType.JSON);
}
