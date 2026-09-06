# Reglas de Cátedra: Sistema de Automatización de Oficinas (SAO - TUTI)

Este archivo define las restricciones académicas, de contenido y de identidad visual específicas para las diapositivas de **SAO** (Tecnicatura Universitaria en Tecnologías de la Información - UTN Santa Fe).

## 1. Tema y Plantilla
- **Tema CSS oficial**: `<link rel="stylesheet" href="../../dist/theme/tuti.css" />` (extiende `utn-core.css`).
- **Plantilla base**: `deploy/templates/template-tuti.html`.
- **Footer Institucional**: Fijo en `.branding-footer` con texto exacto: `TUTI / UTN <span>SANTA FE</span>`.

## 2. Lenguaje y Plataforma
- **Lenguaje**: Java (OpenJDK / NetBeans / IntelliJ IDEA).
- **Compilador interactivo**: OneCompiler Java (`https://onecompiler.com/embed/java?listenToEvents=true&theme=dark&hideLanguageSelection=true&hideTitle=true`).
- **Juez de evaluación**: OmegaUp.
- **Nómina Oficial del Equipo Docente**:
  - **Profesores**: Gastón Micheri, Tomás Assenza
  - **Tutores**: Agustín Ramello, Micaela Assenza, Lijandy Jimenez Armas, Macarena Moya

## 3. Identidad Visual y Estilo de Diapositivas
- **Subtítulos y destacados**: Utilizar la clase `.slide-subtitle` con acento cian (`--cyan-accent: #38bdf8;`).
- **Portada y Cierre**:
  - Layout dividido `.hero-container`:
    - Izquierda: Imagen representativa de alta calidad (Unsplash, desarrollo/tecnología).
    - Derecha: Título de la materia, nombre y número de unidad, y nómina docente/tutores completa.
- **Didáctica Visual (Cero PNGs borrosos de código)**:
  - Las variables y celdas de memoria deben representarse con HTML/CSS (etiquetas de tipo, identificador y valor en celdas coloreadas).
  - Emplear analogías visuales maquetadas en HTML (ej: cajas compartimentadas para variables, periódicos para casos de estudio como Y2K).
  - Tablas comparativas con filas alternadas (`zebra striping`) y contrastes nítidos.

## 4. Manejo de Código y Ejecución
- **Convenciones Java**: Respetar `camelCase` para variables y métodos, `PascalCase` para clases, y `SCREAMING_SNAKE_CASE` para constantes (`final`).
- **OneCompiler Java**:
  - Inyectar el código vía `sendCodeWithRetries(iframeId, javaCode, 'java')` en el evento `slidechanged`.
  - El código debe incluir siempre la clase pública `Main` con `public static void main(String[] args)` ejecutable.
