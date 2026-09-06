# Reglas Globales del Repositorio de Diapositivas (UTN FRSF)

Este archivo define las directrices arquitectónicas, de maquetación y de control de versiones para todas las diapositivas del repositorio (`aedd`, `sao`, `pba`).

## 1. Motor y Arquitectura de Temas
- **Framework oficial**: Reveal.js (alojado en `deploy/dist/` y `deploy/plugin/`).
- **Sistema de Temas CSS en Capas**:
  - `dist/theme/utn-core.css`: Base institucional compartida (colores `#002B5B`, `#FFC107`, fuentes Poppins/Inter/Fira Code, footer, OneCompiler).
  - `dist/theme/tuti.css`: Tema oficial para la carrera **TUTI** (cátedras **SAO** y **PBA**). Incluye portada Split Hero, acento cian (`--cyan-accent: #38bdf8`), nómina de profesores y tutores.
  - `dist/theme/aedd.css`: Tema oficial para la carrera **ISI** (cátedra **AEDD**). Incluye portadas oscuras con gradientes, badges de incisos (`.inciso-badge`, `.points-badge`), puestas en común y diagramas de memoria.
- **Plantillas base listas para duplicar**:
  - `deploy/templates/template-tuti.html` $\rightarrow$ Para nuevas clases de SAO o PBA.
  - `deploy/templates/template-aedd.html` $\rightarrow$ Para nuevas clases de AEDD.
- **Evitar solapamiento con el Footer**:
  - El footer institucional `.branding-footer` (`TUTI / UTN SANTA FE` o `AEDD / UTN SANTA FE`) se fija a `bottom: 30px`.
  - La altura útil del contenido de cualquier diapositiva no debe superar los **~520px** dentro del canvas estándar (720px) para evitar colisiones visuales.

## 2. Soporte Móvil y Orientación Vertical (Portrait)
- **Orden de ejecución crítico (Anti-Blank-Slide)**:
  - La eliminación de compiladores interactivos (`[id^="slide-compiler-"]`) y el aplanamiento de diapositivas anidadas (`section > section`) en pantallas móviles (`< 768px`) debe ejecutarse **sincrónicamente ANTES de invocar `Reveal.initialize()`**.
  - Si se ejecuta después, Reveal.js preserva el índice 2D en memoria y genera una diapositiva en blanco al deslizar hacia abajo.
- **Ocultamiento de ayudas verticales**:
  - En modo vertical (`@media (max-aspect-ratio: 1/1)` o móvil), ocultar siempre los botones `.down-arrow-hint` ("Presioná Flecha Abajo...") ya que los compiladores anidados están deshabilitados.
- **Flujos adaptables**:
  - Diagramas o pasos secuenciales horizontales (`flex-direction: row`) deben adaptarse a columna (`flex-direction: column`) y rotar flechas indicadoras a 90 grados (`transform: rotate(90deg)`) en pantallas móviles/verticales.

## 3. Convención de Commits Semánticos
Para mantener un historial limpio en el monorepo, los commits deben seguir el formato:
- `feat(sao):` Nueva unidad o diapositiva de SAO.
- `feat(aedd):` Nueva clase o diapositiva de AEDD.
- `feat(pba):` Nueva clase o diapositiva de PBA.
- `fix(responsive):` Correcciones de visualización en dispositivos móviles o vertical.
- `fix(sao):`, `fix(aedd):` Correcciones de contenido específico.
- `style(theme):` Mejoras en temas (`utn-core.css`, `tuti.css`, `aedd.css`).
- `docs(agents):` Actualizaciones en reglas, skills o plantillas.
