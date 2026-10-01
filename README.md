# BioLab · publicación y registro de evaluación

Aplicación educativa estática en español. No necesita cuentas, contraseñas, un servidor propio, una base de datos ni instalación de paquetes. El navegador calcula la nota y la muestra inmediatamente. La conexión a Google Sheets es opcional y todavía no está configurada.

## 1. Publicar en GitHub Pages

1. Sitúa `index.html`, los estilos, scripts, el manifiesto y `sw.js` directamente en la raíz del repositorio. Conserva también `.nojekyll`, la guía y el ejemplo opcional `google-apps-script/`.
2. Usa `main` como rama principal.
3. En **Settings → Pages → Build and deployment**, selecciona **Source → Deploy from a branch**, **Branch → main** y **/(root)**.
4. Guarda la configuración. Cada cambio publicado en `main` actualiza la web mediante el flujo interno «pages build and deployment» de GitHub. Comprueba que finalice correctamente en **Actions**.

Pages sirve la aplicación estática desde la raíz; `.nojekyll` evita procesarla como un sitio Jekyll. Los archivos auxiliares no contienen resultados de estudiantes ni credenciales, y Apps Script no se ejecuta en GitHub. Los enlaces, estilos y scripts son relativos y funcionan bajo `/biolab/`. No hay compilación ni framework. Consulta la [guía oficial de publicación desde una rama](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 2. Utilizar la evaluación sin Google Sheets

En `config.js` deja:

```js
const GOOGLE_SCRIPT_URL = "";
```

La evaluación sigue funcionando: diez preguntas, un punto cada una, solo nombre, un intento en ese navegador y resultado inmediato sobre 10. Al entregar se guardan localmente nombre, respuestas, cantidad de aciertos, nota, porcentaje, fecha/hora, zona horaria y versión del examen. Aparece «Registro remoto aún no configurado».

El intento se conserva al recargar. Esto es una restricción sencilla por navegador, no por persona: otro dispositivo, otro navegador o borrar los datos del sitio permite otro intento. No se pretende proteger las respuestas ni verificar identidades. Los intentos anteriores no se borran al actualizar las preguntas.

## 3. Conectar Google Sheets después

1. Crea una hoja de cálculo de Google para la demostración. En sus ajustes, elige la zona horaria que quieras utilizar al mostrar las fechas.
2. Abre **Extensiones → Apps Script**. Pega el contenido de `google-apps-script/Code.gs` y completa `GOOGLE_SHEET_ID` con el ID de tu hoja (entre `/d/` y `/edit` en su URL).
3. El ejemplo crea una pestaña **Resultados** con estos encabezados si no existe. Si ya existe, debe tener exactamente esta cabecera:

   `Fecha | Nombre | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | Nota | Porcentaje`

   P1–P10 son las preguntas 1–10 del examen y almacenan letras A, B, C o D. **No son las etiquetas curriculares del método científico.** Nota es un número sobre 10; Porcentaje es de 0 a 100. Fecha incluye hora. La cantidad de aciertos también se envía; en este examen coincide con la nota porque cada pregunta vale un punto.
4. En Apps Script selecciona **Implementar → Nueva implementación → Aplicación web**. Ejecutar como: **tú (propietario)**. Acceso: **Cualquier persona**, incluida una persona sin cuenta de Google. Si tu institución no permite acceso anónimo, habrá que usar una cuenta que sí lo permita; no añadas autenticación a BioLab.
5. Autoriza el acceso del script a tu hoja y copia la URL de la aplicación web terminada en **`/exec`**, no `/dev`.
6. En `config.js`, edita una sola línea:

   ```js
   const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/TU_IMPLEMENTACION/exec";
   ```

7. Guarda ese cambio en GitHub para volver a publicar. Abre BioLab con conexión y recarga para obtener la configuración actualizada. Prueba con un nombre de demostración y comprueba la fila directamente en Google Sheets.

El script preparado evita nombres repetidos (ignorando mayúsculas y espacios repetidos). Puedes desactivarlo cambiando `RECHAZAR_NOMBRES_REPETIDOS` a `false`. El identificador del intento se conserva en una **nota de la celda Fecha**, no en otra columna: reenviar el mismo intento no duplica la fila. Dos personas con el mismo nombre pueden confundirse; para la demostración usa nombres distinguibles. Es un control simple, no autenticación.

La entrega utiliza un POST de formulario con un campo `payload` que contiene JSON. Ejemplo de datos enviados:

```json
{
  "intentoId": "identificador-del-intento",
  "nombre": "Estudiante de prueba",
  "respuestas": ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"],
  "correctas": 7,
  "nota": 7,
  "porcentaje": 70,
  "fechaHora": "2026-10-01T15:30:00.000Z",
  "zonaHoraria": "America/La_Paz",
  "versionEvaluacion": "biolab-biomolecules-v4"
}
```

La fecha enviada está en formato ISO; la hoja muestra la fecha y hora según su zona horaria. El ejemplo de Apps Script acepta la puntuación calculada por BioLab: no recalifica ni protege las respuestas.

### Qué significa el aviso de envío

La solicitud usa `no-cors` para un envío sencillo entre GitHub Pages y Apps Script, sin cabeceras personalizadas. El navegador no puede leer la respuesta de Google en ese modo. Por eso BioLab indica **«Solicitud de registro enviada; confirmación pendiente»**, no «guardado» sin comprobarlo. Revisa la fila en Sheets. El aviso del navegador tampoco puede confirmar un rechazo por nombre duplicado. Véanse las [aplicaciones web de Apps Script](https://developers.google.com/apps-script/guides/web) y las [redirecciones de Content Service](https://developers.google.com/apps-script/guides/content).

Sin conexión o con un problema de envío, la nota sigue disponible y el resultado permanece localmente. El botón **«Reintentar solo el registro»** vuelve a enviar ese mismo resultado: no permite repetir el examen ni modifica la nota. No hay reenvío automático de resultados antiguos. Un resultado obtenido antes de configurar la URL también puede enviarse después desde su pantalla de resultado.

## 4. Funcionamiento educativo offline

Todos los modelos y recursos educativos están incluidos junto a `index.html`; no dependen de imágenes, fuentes o librerías externas. Para usar la versión de Pages sin conexión, visita primero BioLab con conexión y deja que cargue sus archivos. El servicio de caché ofrece después los módulos y la evaluación local sin red. El registro en Sheets requiere conexión.

Para revisar el paquete desde una computadora sin publicar, sirve la raíz del proyecto con cualquier servidor estático local. Si ya tienes Node.js, el comando `node preview-server.mjs 4175` abre `http://127.0.0.1:4175/`. Abrir `index.html` como archivo no garantiza la caché offline ni las mismas funciones que localhost/HTTPS.

## 5. Alcance educativo

Aprende se centra exclusivamente en **carbohidratos, lípidos y proteínas**, con modelos, funciones, ejemplos, interacciones, comparación de las tres familias y modo proyección. La navegación es libre. Las enzimas aparecen como proteínas que actúan sobre los alimentos, no como un tema conceptual adicional.

El examen mantiene diez preguntas: dos sobre carbohidratos, dos sobre lípidos, dos sobre proteínas, tres sobre interpretación/procedimiento experimental y una integradora. Cada una vale un punto. La revisión de un intento anterior conserva la nota original y no muestra preguntas que hayan quedado fuera del alcance vigente.

Contenido científico de referencia: OpenStax Biology 2e · [Carbohidratos](https://openstax.org/books/biology-2e/pages/3-2-carbohydrates), [Lípidos](https://openstax.org/books/biology-2e/pages/3-3-lipids), [Proteínas](https://openstax.org/books/biology-2e/pages/3-4-proteins). Las representaciones son modelos simplificados, no estructuras a escala.

## Estado de esta entrega

Entrega estática para el repositorio [soyjhonatanyt-web/biolab](https://github.com/soyjhonatanyt-web/biolab), en la rama `main`. GitHub Pages publica directamente la raíz de `main` con «Deploy from a branch»; su estado se consulta en la pestaña Actions. La URL de registro sigue vacía y Apps Script no está desplegado ni conectado. Las pruebas locales no sustituyen una prueba real de guardado en tu hoja una vez que exista la URL.

El constructor y las tres pruebas químicas son funcionales. La investigación de muestra X utiliza esas pruebas y sus cuadernos. El simulador independiente de digestión/actividad enzimática y la mesa unificada de investigación todavía no están implementados en este prototipo; esta revisión conserva el resto del recurso sin añadir esas simulaciones.
