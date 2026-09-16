---
name: mejora_de_diapositivas
description: Guía y metodología para diseñar, maquetar, estructurar y optimizar presentaciones interactivas con Reveal.js para la UTN FRSF (cátedras AEDD, SAO, PBA, TUTI). Triggers when creating or improving web slides, presentations, or converting slides from PDFs/PowerPoints.
---

# Skill: Creación y Mejora de Diapositivas Educativas (UTN FRSF)

Esta skill define la arquitectura técnica, estándares de diseño, responsividad e interactividad para las presentaciones web de la **UTN Regional Santa Fe**.

> [!NOTE]
> Para las restricciones académicas específicas de cada materia (lenguaje, restricciones de código C++/Java, nómina de profesores y tutores), consultar los archivos de reglas de cátedra en cada subdirectorio:
> - Reglas globales: `deploy/AGENTS.md`
> - Cátedra AEDD (C++ / ISI): `deploy/aedd/AGENTS.md` $\rightarrow$ Tema: `aedd.css` | Plantilla: `template-aedd.html`
> - Cátedra SAO (Java / TUTI): `deploy/sao/AGENTS.md` $\rightarrow$ Tema: `tuti.css` | Plantilla: `template-tuti.html`
> - Cátedra PBA (Java / TUTI): `deploy/pba/AGENTS.md` $\rightarrow$ Tema: `tuti.css` | Plantilla: `template-tuti.html`

---

## 1. Stack Técnico y Arquitectura de Temas

- **Motor**: [Reveal.js](https://revealjs.com/) (distribuido localmente en `deploy/dist/`).
- **Sistema de Temas CSS en Capas**:
  - `dist/theme/utn-core.css`: Variables maestras UTN (`#002B5B`, `#FFC107`), tipografías, footer institucional, contenedores base, `.compiler-window` universal y reglas responsive.
  - `dist/theme/tuti.css`: Tema para la carrera **TUTI** (SAO, PBA). Agrega `--cyan-accent: #38bdf8`, layout Split Hero con fotos y listas de docentes/tutores.
  - `dist/theme/aedd.css`: Tema para la carrera **ISI** (AEDD). Agrega portadas oscuras con gradientes, badges de incisos (`.inciso-badge`, `.points-badge`), puestas en común y diagramas de memoria.
- **Plantillas listas para usar**:
  - `deploy/templates/template-tuti.html`: Boilerplate para unidades de SAO o PBA.
  - `deploy/templates/template-aedd.html`: Boilerplate para clases de AEDD.
- **Plugins Reveal.js**:
  - `RevealHighlight` (resaltado sintáctico con tema monokai en `deploy/plugin/highlight/`).
  - `RevealNotes` (notas de presentador).
- **Tipografías**: `'Poppins'` (títulos), `'Inter'` (cuerpo), `'Fira Code'` (código).
- **Iconografía**: FontAwesome 6.5.1.

---

## 2. Sistema de Diseño Visual y Maquetación

### Variables Institucionales (definidas en `utn-core.css`)
```css
:root {
    --utn-blue: #002B5B;      /* Azul institucional UTN */
    --utn-gold: #FFC107;      /* Amarillo / dorado de acento */
    --bg-neutral: #F8FAFC;    /* Fondo suave de contenedores */
    --text-main: #1E293B;     /* Slate oscuro de alta legibilidad */
    --text-light: #64748B;    /* Descripciones y subtítulos */
    --danger-red: #EF4444;    /* Advertencias y overflow */
    --success-green: #10B981; /* Salidas válidas */
}
```

### Reglas de Maquetación Clave
1. **Título (`.slide-title`)**: Poppins mayúsculas, borde izquierdo dorado de `10-12px`.
2. **Footer Institucional (`.branding-footer`)**: Posición fija a `bottom: 30px`.
   - **Regla de altura**: El contenido total de una diapositiva no debe superar los **~520px** de altura efectiva dentro del canvas base de 720px para evitar colisiones con el footer.
3. **Cero Capturas Rasterizadas para Código**: Diagramas de memoria, celdas RAM o arreglos se maquetan en **HTML y CSS puro** (`.array-diagram`, `.ram-cell`, etc.).

---

## 3. Arquitectura del Compilador Vertical (OneCompiler)

Navegación en dos ejes:
- **Eje Horizontal (`→` / `←`)**: Secuencia teórica y narrativa de la clase.
- **Eje Vertical (`↓`)**: Diapositiva interactiva con OneCompiler embebido pre-cargado.

### Configuración del Iframe
- Java: `https://onecompiler.com/embed/java?listenToEvents=true&theme=dark&hideLanguageSelection=true&hideTitle=true`
- C++: `https://onecompiler.com/embed/cpp?listenToEvents=true&theme=dark&hideLanguageSelection=true&hideTitle=true`

### Protocolo de Inyección con Reintentos
```javascript
function sendCode(iframeId, code, language = 'java', fileName = 'Main.java') {
    const iframe = document.getElementById(iframeId);
    if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
            eventType: 'populateCode',
            language: language,
            files: [{ name: fileName, content: code }]
        }, '*');
    }
}

function sendCodeWithRetries(iframeId, code, language = 'java', fileName = 'Main.java') {
    const send = () => sendCode(iframeId, code, language, fileName);
    send();
    setTimeout(send, 200);
    setTimeout(send, 500);
    setTimeout(send, 1000);
    setTimeout(send, 2000);
    setTimeout(send, 3500);
}
```

---

## 4. Dificultades Críticas y Soluciones de Ingeniería

### A) Orden de Ejecución para Móviles (Anti-Blank-Slide)
En dispositivos móviles (`< 768px`) o pantallas verticales, los iframes interactivos se deshabilitan.
- **REGLA FUNDAMENTAL**: La eliminación de `[id^="slide-compiler-"]` y el aplanamiento de `section > section` **debe realizarse sincrónicamente ANTES de invocar `Reveal.initialize()`**.
- Si se ejecuta después, Reveal.js ya habrá construido su matriz interna de índices 2D y el usuario caerá en una diapositiva en blanco al deslizar hacia abajo.

```javascript
// EJECUTAR ESTO ANTES DE Reveal.initialize()
const isMobilePortrait = window.innerWidth < 768 || (window.innerHeight > window.innerWidth);
if (isMobilePortrait) {
    document.querySelectorAll('[id^="slide-compiler-"]').forEach(el => el.remove());
    document.querySelectorAll('section > section').forEach(sec => {
        const parent = sec.parentNode;
        if (parent && parent.children.length === 1) {
            while (sec.firstChild) {
                parent.appendChild(sec.firstChild);
            }
            sec.remove();
        }
    });
}
```

### B) Ocultamiento de Ayudas de Navegación Vertical
En modo vertical/móvil, los botones `.down-arrow-hint` ("Presioná Flecha Abajo...") se ocultan mediante CSS con `display: none !important;` en `@media (max-aspect-ratio: 1/1)`.

### C) Canvas Adaptativo
```javascript
function getCanvasSize() {
    let isPortrait = window.innerHeight > window.innerWidth;
    return {
        width: isPortrait ? 720 : 1280,
        height: isPortrait ? 1280 : 720
    };
}
```
Reconfigurado en el evento `resize` con `Reveal.configure(...)`.

---

## 5. Reglas Didácticas y Estilo de Código (Cátedra AEDD - C++)
- **Modularización y Reutilización**: Descomponer la lógica en funciones auxiliares (`sumarFila`, `sumarColumna`, `buscarElemento`) en lugar de escribir funciones monolíticas con bucles anidados. Reutilizar estas funciones auxiliares en incisos posteriores para evitar duplicación de lógica.
- **Estructuras de Control Estrictas**:
  - Prohibido el operador ternario `?:` (usar siempre `if-else` legible).
  - Prohibido `break` y `continue` dentro de bucles (usar banderas booleanas como `bool encontrado` y condiciones compuestas en `while`).
  - Principio de Retorno Único (`single return` al final de la función).
- **Headers y Prototipos**: Comentar claramente prototipos de funciones o modularizaciones de archivos (`// Prototipo: esto iría en el .h`) para que los alumnos entiendan la separación conceptual aun usando consolas interactivas de archivo único.

---

## 6. Protocolo de Verificación Visual y QA (Quality Assurance)

Antes de dar por finalizada la creación o refactorización de presentaciones, diapositivas o portales:

1. **Verificación de Activos Estáticos**:
   - Comprobar que logos, imágenes y diagramas referenciados existan localmente (evitar URLs externas que puedan retornar 404 o bloquear hotlinks; preferir `dist/utnsantafe.png`).
2. **Escala y Proporciones del Canvas / Hub**:
   - Mantener tipografías y contenedores en escala balanceada (en Hubs: títulos ~28-32px, tarjetas con padding ~16-22px, botones compactos).
   - El viewport debe visualizarse completo a 100% de zoom en pantallas estándar (1080p/720p) sin saturar ni obligar a scrolling excesivo.
3. **Control Tipográfico y Fórmulas**:
   - En archivos HTML nativos sin KaTeX/MathJax, **NO** escribir sintaxis LaTeX cruda como `$\rightarrow$`. Utilizar siempre entidades HTML o caracteres Unicode directos (`&rarr;`, `→`, `&larr;`, `←`).
4. **Layout y Listas Seguras**:
   - Evitar `display: flex; gap: ...;` directo sobre `<li>` cuando contenga texto mezclado con etiquetas `<code>` o signos de puntuación, ya que los navegadores tratan cada nodo de texto como un ítem flex separado generando espaciados rotos. Estructurar siempre con un contenedor `<span>` para el texto.
5. **Chequeos de Renderizado Visual**:
   - Verificar visualmente el renderizado en navegador para confirmar que no haya colisiones de altura con el footer persistente (`.branding-footer`), imágenes caídas o desbordamientos en móvil y escritorio.
6. **Escape Obligatorio de Entidades en Bloques `<pre><code>`**:
   - En código Java, C++ o pseudocódigo que contenga operadores relacionales o lógicos (`<`, `>`, `&&`), escapar SIEMPRE como `&lt;`, `&gt;`, `&amp;&amp;`.
   - Si se escribe `<b` (por ejemplo `a < b`), el motor HTML lo parsea como la etiqueta `<b>` (bold), corrompiendo el cierre de `</section>`. Esto anida las diapositivas siguientes dentro de la actual y provoca que Reveal.js las renderice todas superpuestas ("una encima de la otra").
7. **Posicionamiento Global de `.branding-footer` (Estilo Unidad 0)**:
   - Ubicar `<div class="branding-footer">` **fuera de `.slides` y de `.reveal`** directamente en el `<body>`.
   - Estilar con `position: fixed !important; bottom: 24px; left: 35px; z-index: 9999; pointer-events: none;`.
   - Así se garantiza presencia institucional constante en todas las diapositivas sin restar altura al canvas ni invadir tarjetas internas.
8. **Maquetación Robusta de Cuadros Callout (`.callout-box`)**:
   - Aplicar siempre `align-items: flex-start !important; text-align: left !important;`. El icono debe tener `margin-top: 3px !important; flex-shrink: 0;`.
   - Estructurar el contenido en bloque: el título con `<strong style="display: block; margin-bottom: 2px;">` y la descripción en `<p style="margin: 0; text-align: left;">`.
   - Asegurar la regla CSS `.callout-box p strong { display: inline !important; }` para que cualquier texto en negrita dentro del párrafo no se quiebre en un renglón nuevo.
9. **Prevención de Saltos de Línea en Badges y Tablas (`nowrap`)**:
   - Asignar `white-space: nowrap; display: inline-block;` a la clase `.code-badge` y declarar anchos porcentuales o mínimos explícitos en las columnas de tablas para evitar que expresiones breves (ej: `boolean b = true;`, `* / %`, `char c = 'A';`) queden partidas en dos renglones.
10. **Navegación Vertical Orgánica (Cero Mensajes Explícitos)**:
    - **No incluir** botones, textos ni píldoras como `"Presioná Flecha Abajo"`, ni tampoco `"Probar en vivo"`.
    - La interfaz nativa de Reveal.js ilumina automáticamente la flecha inferior en los controles de navegación (esquina inferior derecha) cuando existe una diapositiva vertical secundaria (compilador o sandbox), siendo completamente suficiente, limpia y no invasiva.
11. **Navegación Fluida en Código (Fragmentos)**:
    - En diapositivas de desafíos o explicaciones completas, evitar dividir `data-line-numbers="line1|line2"` con barras verticales (`|`) salvo que sea estrictamente necesario un paso a paso fragmentado. Los pipes interceptan la flecha derecha (`→`), bloqueando el avance normal hacia la siguiente diapositiva.
12. **Limpieza Visual en Portada y Cierre**:
    - No colocar logotipos o badges redundantes (`TUTI / UTN`) por encima del título principal en la portada o en el slide de preguntas cuando ya existe el footer institucional persistente en la esquina inferior izquierda. Preservar la limpieza tipográfica de la Unidad 0.
13. **Estructura y Balance en Portales Hub**:
    - En los Hubs de unidad que incorporan múltiples recursos (clases teóricas, guías prácticas en PDF, simuladores/minijuegos), usar cuadrículas simétricas (ej: 4 columnas con `grid-template-columns: repeat(4, 1fr)` en desktop, 2 columnas en pantallas intermedias y 1 en móvil).
    - Mantener la misma cantidad de ítems de temario (bullet points) y estructura en todas las tarjetas para que sus alturas se mantengan visualmente equilibradas y alineadas horizontalmente.
    - Los enlaces a documentos externos (ej: PDFs en SIED / Moodle) deben abrirse en nueva pestaña con `target="_blank" rel="noopener noreferrer"` y contar con un botón distintivo con ícono `fa-arrow-up-right-from-square`.
14. **Consistencia Estricta de Portadas y Cierres en TUTI (`tuti.css`)**:
    - Vincular siempre `<link rel="stylesheet" href="../../../dist/theme/tuti.css" />` en todas las clases de TUTI (SAO y PBA).
    - **Portada Canónica**:
      - Fondo: `<section data-background-color="#F8FAFC">`.
      - Contenedor: `<div class="hero-container">` con `.hero-image` y `.hero-text`.
      - Título institucional: `<h1 class="hero-title" style="text-align: left; font-size: 44px !important; margin-bottom: 12px !important;">SISTEMA DE AUTOMATIZACIÓN DE OFICINAS</h1>`.
      - Subtítulo de unidad y clase: `<h3 style="font-size: 22px; color: var(--cyan-accent); font-weight: 600; margin-bottom: 24px; text-align: left;">Unidad #X - [Nombre Unidad] (Clase Y: [Tema])</h3>`.
      - Cero badges o etiquetas adicionales por encima del título (evitar `.hero-unit-tag`).
      - Nómina docente: Usar exclusivamente los bloques estándar `.staff-list` con `<h4>Profesores:</h4>` (subrayado dorado `var(--utn-gold)`) y `<h4>Tutores:</h4>` con viñetas doradas `•`. Prohibido inventar cajas o grillas grises comprimidas (`.staff-grid`).
    - **Cierre Canónico**:
      - Fondo: `<section data-background-color="#F8FAFC">`.
      - Título: `<h1 class="hero-title" style="font-size: 48px !important; text-align: left; margin-bottom: 10px !important;">¿PREGUNTAS?</h1>`.
      - Subtítulo: `<h3 style="font-size: 20px; color: var(--text-main); font-weight: 600; margin-bottom: 15px; text-align: left;">Espacio de consultas y dudas</h3>`.
      - Frase: `<p style="font-size: 16px; color: var(--text-light); text-align: left; margin-bottom: 20px;">¡Muchas gracias por su atención!</p>`.
      - Botones de acción: Fila flex con enlace al portal `Portal Unidad X` (`var(--utn-blue)`) y avance `Ir a Clase Y` (`var(--cyan-accent)`) si aplica.
      - Nómina docente: Mismos bloques `.staff-list` idénticos a la portada.
15. **Alineación Segura de Etiquetas y Tarjetas de Definición (Anti-Centrado en Reveal)**:
    - En Reveal.js, los slides y contenedores intermedios pueden heredar `text-align: center;`.
    - Toda etiqueta, badge o subtítulo dentro de un contenedor o tarjeta (ej: `<span>Etimología Latina</span>`, `<span>Analogía Cotidiana</span>`) debe llevar explícitamente `display: block; text-align: left;` para evitar que flote centrada como un elemento huérfano mientras el texto inferior se alinea a la izquierda.
    - Los bloques de definición/etimología deben tener un `max-width` armónico (~960-1000px), márgenes balanceados y resaltar la definición central mediante una cita o caja con acento visual en lugar de franjas vacías y achatadas.
16. **Checklist de Refinamiento Slide por Slide**:
    - Inspeccionar cada diapositiva en navegador o capturas headless a resolución estándar (1366x768 / 1920x1080).
    - Verificar que los encabezados `h4` o `h3` dentro de tarjetas tengan `text-align: left !important;`.
    - Asegurar que no existan saltos de línea indeseados en badges de código, operadores o asignaciones.
    - Confirmar que ningún slide contenga mensajes redundantes ("presioná flecha", "probar en vivo").
17. **Nómina Docente Oficial (Cátedra SAO) y Unificación de Hubs**:
    - **Róster Oficial SAO (Vigente)**:
      - **Profesores**: Gastón Micheri, Tomás Assenza.
      - **Tutores**: Agustín Ramello, Micaela Assenza, Lijandy Jimenez Armas, Macarena Moya.
      - *Restricción estricta*: Patricia Torresan **NO** forma más parte de la cátedra; no debe incluirse bajo ninguna circunstancia en diapositivas ni portales de SAO.
    - **Formato en Hubs de Unidad**:
      - La sección `.staff-section` debe presentarse en **una sola línea horizontal** en vistas de escritorio (`justify-content: space-around;` o `center` con separación clara entre Profesores y Tutores), manteniendo total uniformidad visual entre todas las unidades (ej: Unidad 2 y Unidad 3).
18. **Arquitectura Modular en Hubs de Unidad (Secciones Jerárquicas)**:
    - Para evitar sobrecargar la grilla principal de clases o romper la simetría de tarjetas interactivas, los portales se estructuran en secciones temáticas con separadores elegantes (`.section-header` con línea divisoria y badge contador):
      1. **Clases & Práctica Interactiva**: Tarjetas verticales completas para las clases Reveal.js y minijuegos interactivos.
      2. **Documentación & Material de Estudio**: Tarjetas horizontales compactas (`.docs-grid`) para el apunte de Teoría (`Apunte • PDF`) y la Guía de Práctica (`Guía de Ejercicios • PDF`) con botones de apertura externa.
      3. **Videos**: Fila de tarjetas interactivas (`.videos-grid`) que albergan píldoras de YouTube y grabaciones de clase en Microsoft SharePoint/Stream, identificadas con tags de plataforma (`YouTube • CÁTEDRA SAO` / `SharePoint • CÁTEDRA SAO`).
