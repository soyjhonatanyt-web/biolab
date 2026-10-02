# BioLab · publicación y registro de evaluación

Aplicación educativa estática en español. No necesita cuentas, contraseñas, un servidor propio, una base de datos ni instalación de paquetes. El navegador calcula la nota y la muestra inmediatamente. El registro remoto está conectado al Web App de Google Apps Script configurado en `config.js`.

## 1. Publicar en GitHub Pages

1. Sitúa `index.html`, los estilos, scripts, el manifiesto y `sw.js` directamente en la raíz del repositorio. Conserva también `.nojekyll`, la guía y el ejemplo opcional `google-apps-script/`.
2. Usa `main` como rama principal.
3. En **Settings → Pages → Build and deployment**, selecciona **Source → Deploy from a branch**, **Branch → main** y **/(root)**.
4. Guarda la configuración. Cada cambio publicado en `main` actualiza la web mediante el flujo interno «pages build and deployment» de GitHub. Comprueba que finalice correctamente en **Actions**.

Pages sirve la aplicación estática desde la raíz; `.nojekyll` evita procesarla como un sitio Jekyll. Los archivos auxiliares no contienen resultados de estudiantes ni credenciales, y Apps Script no se ejecuta en GitHub. Los enlaces, estilos y scripts son relativos y funcionan bajo `/biolab/`. No hay compilación ni framework. Consulta la [guía oficial de publicación desde una rama](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

## 2. Utilizar la evaluación sin Google Sheets

Si quieres desactivar el registro remoto, en `config.js` deja:

```js
const GOOGLE_SCRIPT_URL = "";
```

La evaluación sigue funcionando: diez preguntas, un punto cada una, solo nombre, un intento en ese navegador y resultado inmediato sobre 10. Al entregar se guardan localmente nombre, respuestas, cantidad de aciertos, nota, porcentaje, fecha/hora, zona horaria y versión del examen. Aparece «Registro remoto aún no configurado».

El intento se conserva al recargar. Esto es una restricción sencilla por navegador, no por persona: otro dispositivo, otro navegador o borrar los datos del sitio permite otro intento. No se pretende proteger las respuestas ni verificar identidades. Los intentos anteriores no se borran al actualizar las preguntas.

## 3. Registro remoto con Google Apps Script

`GOOGLE_SCRIPT_URL`, en `config.js`, contiene la URL pública del Web App terminado en `/exec`. Si cambia el despliegue, actualiza esa constante y publica el cambio en `main`. No hace falta instalar paquetes ni añadir un servidor a BioLab.

Al entregar, BioLab envía un POST con un cuerpo JSON de **exactamente cuatro campos**. `respuestas` contiene diez letras A, B, C o D, en el orden original del examen:

```json
{
  "nombre": "Estudiante de prueba",
  "respuestas": ["A", "B", "C", "D", "A", "B", "C", "D", "A", "B"],
  "nota": 7,
  "porcentaje": 70
}
```

El cuerpo es JSON crudo, no un formulario ni un campo `payload`. Su cabecera es `Content-Type: text/plain;charset=UTF-8` para evitar una preconsulta del navegador. Apps Script debe analizar `JSON.parse(e.postData.contents)` y devolver JSON legible mediante Content Service. BioLab sigue las redirecciones de Google y utiliza CORS, no una respuesta opaca.

El servicio ya desplegado es responsable de guardar los datos, generar la fecha/hora del registro y comprobar nombres duplicados. Los encabezados previstos son `Fecha | Nombre | P1 | P2 | P3 | P4 | P5 | P6 | P7 | P8 | P9 | P10 | Nota | Porcentaje`. P1–P10 aquí son las diez preguntas, **no las etiquetas curriculares del método científico**. El archivo `google-apps-script/Code.gs` se conserva como ejemplo anterior con otro contrato: no representa ni debe reemplazar automáticamente el servicio actualmente desplegado.

### Qué significa el aviso de envío

BioLab lee la respuesta del servidor: `ok: true` muestra **«Evaluación registrada correctamente.»**; `duplicado: true` muestra **«Ya existe una evaluación registrada con este nombre.»**. Una respuesta con duplicado tiene prioridad aunque también incluya `ok: true`. Un fallo de conexión, tiempo de espera, respuesta no válida o error HTTP muestra **«No se pudo registrar el resultado.»**. No se afirma que el registro se guardó sin una confirmación explícita. Véanse las [aplicaciones web de Apps Script](https://developers.google.com/apps-script/guides/web) y las [redirecciones de Content Service](https://developers.google.com/apps-script/guides/content).

Sin conexión o con un problema de envío, la nota y las respuestas permanecen localmente. El botón **«Intentar enviar nuevamente»** envía ese mismo resultado: no permite repetir el examen ni modifica la nota. Se impiden envíos simultáneos. No hay reenvío automático de resultados antiguos ni envíos de intentos que no tengan exactamente diez respuestas válidas. Un resultado compatible obtenido antes de configurar la URL puede enviarse manualmente desde su pantalla de resultado.

## 4. Funcionamiento educativo offline

Todos los modelos y recursos educativos están incluidos junto a `index.html`; no dependen de imágenes, fuentes o librerías externas. Para usar la versión de Pages sin conexión, visita primero BioLab con conexión y deja que cargue sus archivos. El servicio de caché ofrece después los módulos y la evaluación local sin red. El registro en Sheets requiere conexión.

Para revisar el paquete desde una computadora sin publicar, sirve la raíz del proyecto con cualquier servidor estático local. Si ya tienes Node.js, el comando `node preview-server.mjs 4175` abre `http://127.0.0.1:4175/`. Abrir `index.html` como archivo no garantiza la caché offline ni las mismas funciones que localhost/HTTPS.

## 5. Alcance educativo

Aprende se centra exclusivamente en **carbohidratos, lípidos y proteínas**, con modelos, funciones, ejemplos, interacciones, comparación de las tres familias y modo proyección. La navegación es libre. Las enzimas aparecen como proteínas que actúan sobre los alimentos, no como un tema conceptual adicional.

El examen mantiene diez preguntas: dos sobre carbohidratos, dos sobre lípidos, dos sobre proteínas, tres sobre interpretación/procedimiento experimental y una integradora. Cada una vale un punto. La revisión de un intento anterior conserva la nota original y no muestra preguntas que hayan quedado fuera del alcance vigente.

Contenido científico de referencia: OpenStax Biology 2e · [Carbohidratos](https://openstax.org/books/biology-2e/pages/3-2-carbohydrates), [Lípidos](https://openstax.org/books/biology-2e/pages/3-3-lipids), [Proteínas](https://openstax.org/books/biology-2e/pages/3-4-proteins). Las representaciones son modelos simplificados, no estructuras a escala.

## Estado de esta entrega

Entrega estática para el repositorio [soyjhonatanyt-web/biolab](https://github.com/soyjhonatanyt-web/biolab), en la rama `main`. GitHub Pages publica directamente la raíz de `main` con «Deploy from a branch»; su estado se consulta en la pestaña Actions. La URL de Apps Script está configurada; una entrega muestra la nota local antes de esperar la confirmación del registro remoto.

El constructor y las tres pruebas químicas son funcionales. La investigación de muestra X utiliza esas pruebas y sus cuadernos. El simulador independiente de digestión/actividad enzimática y la mesa unificada de investigación todavía no están implementados en este prototipo; esta revisión conserva el resto del recurso sin añadir esas simulaciones.
