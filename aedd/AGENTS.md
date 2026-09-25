# Reglas de Cátedra: Algoritmos y Estructuras de Datos (AEDD)

Este archivo define las restricciones académicas, pedagógicas y de estilo específicas para las diapositivas de **AEDD** (Ingeniería en Sistemas de Información - UTN Santa Fe).

## 1. Tema y Plantilla
- **Estructura oficial**: `deploy/aedd/<año>/clase<N>/` (ej: `deploy/aedd/2026/clase8/`).
- **Tema CSS oficial**: `<link rel="stylesheet" href="../../../dist/theme/aedd.css" />` (extiende `utn-core.css`).
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
- **Modularización y Funciones Auxiliares**: Evitar funciones monolíticas con bucles anidados que resuelvan más de una responsabilidad. Cuando un problema requiera procesar una fila/columna de una matriz (ej. sumatoria o promedio) o buscar un elemento en un arreglo, se debe extraer dicha subtarea a una función auxiliar (`sumarFila`, `sumarColumna`, `buscarElemento`). Estas funciones auxiliares deben ser luego **reutilizadas** en los incisos posteriores para evitar duplicación de lógica.
- **Separación Estricta de TDAs en `.h` y `.cpp`**: Todo Tipo de Dato Abstracto (TDA) debe enseñarse y presentarse separando rigurosamente su **interfaz / especificación** (`.h`) de su **implementación** (`.cpp`). En las diapositivas, se deben utilizar **slides separados**: uno para la interfaz (`.h`) conteniendo constantes, la definición del `struct` y los prototipos de las primitivas; y otro slide para la implementación (`.cpp`) con `#include "<nombre>.h"` y la codificación de cada primitiva. En OneCompiler y archivos de código, delimitar claramente los bloques con comentarios de encabezado correspondientes a cada archivo.
- **Límite de 80 columnas**: Las líneas de código C++ deben respetar un ancho máximo de 80 caracteres para garantizar legibilidad óptima en proyectores y pantallas compartidas.
- **Entradas directas**: Usar lectura directa (`cin >> a >> b;`). Evitar envolver lecturas en condicionales como `if (cin >> x)` salvo que el problema exija explícitamente lectura hasta fin de archivo (EOF).
- **Código real en consolas**: En las consolas interactivas OneCompiler, no mockear datos fijos; el código debe reflejar exactamente el algoritmo teórico y procesar STDIN.

## 4. Componentes Visuales Habituales
- **Badges de incisos**: `.inciso-badge` (círculo dorado con letra para problemas de examen/práctica) y `.points-badge`.
- **Diagramas de arreglos**: Usar flexbox puro `.array-diagram` y `.array-cell` en lugar de capturas PNG.
- **Ventana de terminal**: `.terminal-window` con salida en Fira Code.
- **Puesta en común**: `.puesta-en-comun` para consignas de debate o revisión colectiva. Prohibido utilizarlo para mensajes redundantes de navegación como "Presioná Flecha Abajo...".
