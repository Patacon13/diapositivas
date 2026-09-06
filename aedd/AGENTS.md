# Reglas de Cátedra: Algoritmos y Estructuras de Datos (AEDD)

Este archivo define las restricciones académicas, pedagógicas y de estilo específicas para las diapositivas de **AEDD** (Ingeniería en Sistemas de Información - UTN Santa Fe).

## 1. Tema y Plantilla
- **Tema CSS oficial**: `<link rel="stylesheet" href="../../dist/theme/aedd.css" />` (extiende `utn-core.css`).
- **Plantilla base**: `deploy/templates/template-aedd.html`.
- **Footer Institucional**: `AEDD / UTN <span>SANTA FE</span>`.

## 2. Lenguaje y Plataforma
- **Lenguaje**: C++ (C++11/C++17/C++20 estándar).
- **Compilador interactivo**: OneCompiler C++ (`https://onecompiler.com/embed/cpp?listenToEvents=true&theme=dark&hideLanguageSelection=true&hideTitle=true`).
- **Juez de evaluación**: OmegaUp.
- **Docente a cargo**: Tomás Assenza.

## 3. Restricciones Académicas Estrictas
- **No usar operadores ternarios (`?:`)**: En AEDD no se enseña ni se permite el uso del operador ternario. Usar siempre estructuras `if-else` completas y legibles.
- **No usar `break` ni `continue` en bucles**: Prohibido el uso de `break` o `continue` dentro de bucles `for`, `while` o `do-while` para controlar la salida anticipada. Se debe estructurar la salida mediante condiciones de bucle compuestas y banderas lógicas (`bool encontrado`). La sentencia `break` solo se permite dentro del bloque `switch`.
- **Principio de Retorno Único (`single return`)**: Cada función debe tener un único punto de retorno al final. Prohibido colocar `return` dentro de bucles `for` o ramas intermedias.
- **Límite de 80 columnas**: Las líneas de código C++ deben respetar un ancho máximo de 80 caracteres para garantizar legibilidad óptima en proyectores y pantallas compartidas.
- **Entradas directas**: Usar lectura directa (`cin >> a >> b;`). Evitar envolver lecturas en condicionales como `if (cin >> x)` salvo que el problema exija explícitamente lectura hasta fin de archivo (EOF).
- **Código real en consolas**: En las consolas interactivas OneCompiler, no mockear datos fijos; el código debe reflejar exactamente el algoritmo teórico y procesar STDIN.

## 4. Componentes Visuales Habituales
- **Badges de incisos**: `.inciso-badge` (círculo dorado con letra para problemas de examen/práctica) y `.points-badge`.
- **Diagramas de arreglos**: Usar flexbox puro `.array-diagram` y `.array-cell` en lugar de capturas PNG.
- **Ventana de terminal**: `.terminal-window` con salida en Fira Code.
- **Puesta en común**: `.puesta-en-comun` para indicar revisión colectiva.
