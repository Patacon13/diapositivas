---
name: mejora_de_diapositivas
description: Guía y metodología para diseñar, maquetar, estructurar y optimizar presentaciones interactivas con Reveal.js para la UTN FRSF (cátedras AEDD, SAO, PBA, TUTI). Triggers when creating or improving web slides, presentations, or converting slides from PDFs/PowerPoints.
---

# Skill: Creación y Mejora de Diapositivas Educativas (UTN FRSF)

Esta skill define la arquitectura técnica, estándares de diseño, responsividad e interactividad para las presentaciones web de la **UTN Regional Santa Fe**.

> [!NOTE]
> Para las restricciones académicas específicas de cada materia (lenguaje, restricciones de código C++/Java, nómina de profesores y tutores), consultar los archivos de reglas de cátedra en cada subdirectorio:
> - Reglas globales: `deploy/AGENTS.md`
> - Cátedra AEDD (C++): `deploy/aedd/AGENTS.md`
> - Cátedra SAO (Java): `deploy/sao/AGENTS.md`
> - Cátedra PBA (Java): `deploy/pba/AGENTS.md`

---

## 1. Stack Técnico

- **Motor**: [Reveal.js](https://revealjs.com/) (distribuido localmente en `deploy/dist/`).
- **Tema común**: `deploy/dist/theme/utn-frsf.css` (estilos institucionales, componentes y media queries).
- **Plugins Reveal.js requeridos**:
  - `RevealHighlight` (resaltado de sintaxis con tema monokai en `deploy/plugin/highlight/`).
  - `RevealNotes` (notas para el presentador).
- **Tipografías (Google Fonts)**:
  - Títulos: `'Poppins', sans-serif` (pesos 600, 700).
  - Texto / Listados: `'Inter', sans-serif` (pesos 400, 500, 600).
  - Código fuente: `'Fira Code', 'Ubuntu Mono', monospace`.
- **Iconografía**: FontAwesome 6.5.1 (`https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`).

---

## 2. Sistema de Diseño Visual y Maquetación

### Variables Institucionales (definidas en `utn-frsf.css`)
```css
:root {
    --utn-blue: #002B5B;      /* Azul institucional UTN */
    --utn-gold: #FFC107;      /* Amarillo / dorado de acento */
    --bg-neutral: #F8FAFC;    /* Fondo suave de contenedores */
    --text-main: #1E293B;     /* Slate oscuro de alta legibilidad */
    --text-light: #64748B;    /* Descripciones y subtítulos */
    --cyan-accent: #38bdf8;   /* Azul cielo / cian para subtítulos */
    --danger-red: #EF4444;    /* Advertencias y overflow */
    --success-green: #10B981; /* Salidas válidas */
}
```

### Componentes de UI Reutilizables
1. **Título (`.slide-title`)**: Poppins mayúsculas, borde izquierdo dorado de `10-12px`.
2. **Subtítulo (`.slide-subtitle`)**: Color `--cyan-accent`.
3. **Footer Institucional (`.branding-footer`)**: Posición fija absoluta a `bottom: 30px`.
   - **Regla de altura**: El contenido total de una diapositiva no debe superar los **~520px** de altura efectiva dentro del canvas base de 720px para evitar colisiones con el footer.
4. **Portada / Hero Split (`.hero-container`)**:
   - Izquierda: Imagen de alta calidad (`.hero-image`) con border-radius 20px.
   - Derecha: Título (`.hero-title`), materia, unidad y nómina docente (`.staff-list`).
5. **Cero Capturas Rasterizadas para Código**: Diagramas de memoria, celdas RAM o arreglos se maquetan en **HTML y CSS puro** (`.array-diagram`, `.ram-cell`, etc.).

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
