# Informe de Auditoría de Calidad Web y QA Automatizado
## Taller de STL 2026 — Algoritmos y Estructuras de Datos (AEDD)
**Universidad Tecnológica Nacional — Facultad Regional Santa Fe (UTN FRSF)**  
**Fecha:** 20 de Octubre de 2026  
**Entorno de Pruebas:** Chromium Headless (CDP Protocol), Node.js v24, Servidor Local HTTP `0.0.0.0:8080`

---

## 1. Resumen Ejecutivo del Estado General
- **Estado Global:** **APROBADO (100% de Calidad y Sin Errores)**
- **Consola JavaScript:** **0 errores, 0 excepciones no controladas** en todos los módulos y debugger.
- **Red y Recursos:** **0 fallas de red, 0 errores 404** (todos los enlaces institucionales, CDN y assets relativos resuelven con HTTP 200).
- **Tipografía y Renderizado:** Cero notación matemática LaTeX `$...$` escapada incorrectamente; bloques de código con fuente monoespaciada `Fira Code` nítida y contraste accesible.
- **Garantía Visual Anti-Solapamiento:** Cumplimiento estricto de la regla de canvas útil (< 520px) sin colisiones con el pie institucional `.branding-footer` ("AEDD / UTN SANTA FE").

---

## 2. Resultados de la Auditoría por Componente

### 2.1 Hub Principal (`aedd/2026/taller-stl/index.html`)
- **Estado:** ✅ **Aprobado**
- **Enlaces Auditados:** 10 enlaces internos verificados (Módulos 0 a 5, Debugger, templates y retornos). Todos responden `HTTP 200 OK`.
- **Adaptabilidad Responsive:** Verificado en Desktop (1920×1080) y Mobile (375×812). Las cards, badges de tiempo estimado y botones de acción se reordenan de forma fluida.
- **Capturas:** `qa_stl_report/hub_desktop.png`, `qa_stl_report/hub_mobile.png`.

### 2.2 Módulo 0: Intro e Iteradores (`modulo0-intro-iteradores/index.html`)
- **Slides:** 9 diapositivas (20 pasos de navegación total con fragmentos).
- **Consola:** 0 errores.
- **OneCompiler:** Integración sandbox en vivo operativa con botón de restauración.
- **Capturas:** `qa_stl_report/Módulo 0 (Intro e Iteradores)_slide_00.png`, `qa_stl_report/mod0_intro_iteradores.png`.

### 2.3 Módulo 1: Vector (`modulo1-vector/index.html`)
- **Slides:** 11 diapositivas (16 pasos de navegación).
- **Consola:** 0 errores.
- **Resolución Problema de la Mediana:** Maquetada en 2 columnas (`1. Carga y Ordenamiento` / `2. Cálculo de Mediana y Salida`).
- **OneCompiler:** Laboratorio interactivo con código inyectado y STDIN disponible.
- **Capturas:** `qa_stl_report/Módulo 1 (Vector)_slide_00.png`, `qa_stl_report/mod1_vector_res.png`.

### 2.4 Módulo 2: Map (`modulo2-map/index.html`)
- **Slides:** 9 diapositivas (16 pasos de navegación).
- **Consola:** 0 errores.
- **Resolución Tendencias / Frecuencias:** Maquetada en 2 columnas (`1. Carga y Conteo con []` / `2. Consultas`).
- **Capturas:** `qa_stl_report/Módulo 2 (Map)_slide_00.png`, `qa_stl_report/mod2_map_res.png`.

### 2.5 Módulo 3: Set (`modulo3-set/index.html`)
- **Slides:** 9 diapositivas (14 pasos de navegación).
- **Consola:** 0 errores.
- **Resolución Lista de Valentina:** Código limpio de unicidad y ordenamiento automático.
- **Capturas:** `qa_stl_report/Módulo 3 (Set)_slide_00.png`, `qa_stl_report/mod3_set_res.png`.

### 2.6 Módulo 4: Stack (`modulo4-stack/index.html`)
- **Slides:** 9 diapositivas (18 pasos de navegación).
- **Consola:** 0 errores.
- **Resolución Paréntesis Balanceados:** Maquetada en 2 columnas (`1. Lectura y Apilado` / `2. Verificación de Balance`).
- **Variante General:** Explicación y código para múltiples símbolos `()`, `[]`, `{}`.
- **Capturas:** `qa_stl_report/Módulo 4 (Stack)_slide_00.png`, `qa_stl_report/mod4_stack_res.png`.

### 2.7 Módulo 5: Queue y Deque (`modulo5-queue-deque/index.html`)
- **Slides:** 12 diapositivas (21 pasos de navegación).
- **Consola:** 0 errores.
- **Resolución Colectivero Misterioso (std::queue):** Maquetada en 2 columnas (función despachadora FIFO + `main`).
- **Resolución Centro de Monitoreo CME (std::deque):** Maquetada en 2 columnas (operaciones de cola doble + `main`).
- **Capturas:** `qa_stl_report/Módulo 5 (Queue y Deque)_slide_00.png`, `qa_stl_report/mod5_queue_res.png`, `qa_stl_report/mod5_deque_res.png`.

### 2.8 Visualizador y Debugger Interactivo (`aedd/2026/taller-stl/debugger/index.html`)
- **Estado:** ✅ **Aprobado**
- **Escenarios Verificados (6 de 6):**
  1. `vector`: Animación de redimensionamiento dinámico y ordenamiento `std::sort`.
  2. `map`: Árbol balanceado / pares clave-valor y conteo de frecuencias.
  3. `set`: Eliminación automática de duplicados y orden lexicográfico en memoria.
  4. `stack`: Animación LIFO (push / pop) con indicador de puntero de tope.
  5. `deque`: Manipulación en ambos extremos (`push_front` y descarte con `pop_back`).
  6. `iteradores`: Avance bidireccional y punteros `begin()`, `end()`, `lower_bound()`.
- **Interacciones Probadas:** Conmutación de escenarios, pulsación secuencial de "Siguiente Paso" (Step Forward), actualización fluida del canvas de memoria sin leaks ni desfasajes.
- **Capturas:** `qa_stl_report/debugger_<scenario>_init.png` y `qa_stl_report/debugger_<scenario>_step2.png` para cada estructura.

---

## 3. Observaciones Detectadas y Mejoras Implementadas

Durante el barrido estático exhaustivo con DevTools Protocol se identificaron dos detalles de maquetación que fueron corregidos y verificados:

1. **Recorte de Código por Regla de Reveal.js (`max-height: 400px`):**
   - *Diagnóstico:* En diapositivas con programas de C++ de más de 20 líneas, la regla por defecto de Reveal.js (`reveal.css`) aplicaba `max-height: 400px; overflow: auto;` al elemento `code`. Dado que `.reveal pre` posee `overflow: hidden;` para prevenir fantasmeo visual, las líneas finales de las resoluciones quedaban ocultas bajo el corte del contenedor.
   - *Corrección:* Se añadió en `dist/theme/utn-core.css` la regla `max-height: none !important;` para permitir que el bloque de código se dimensione naturalmente.

2. **Solapamiento con el Footer Institucional en Códigos Extensos:**
   - *Diagnóstico:* Al desbloquear la altura natural, programas de 25-34 líneas en una sola columna vertical superaban la cota útil de 520px, extendiéndose hacia el pie fijo (`.branding-footer`).
   - *Corrección:* Se reestructuraron las diapositivas de resolución en una maquetación moderna de **dos columnas** (`.two-column` con cards `.tile`):
     - **Módulo 1:** Columna izquierda (Carga y `sort`) + Columna derecha (Cálculo de mediana y salida).
     - **Módulo 2:** Columna izquierda (Carga de frecuencias) + Columna derecha (Consultas).
     - **Módulo 4:** Columna izquierda (Lectura y apilado) + Columna derecha (Verificación de balance).
     - **Módulo 5 (Queue):** Columna izquierda (Función `coleMisterioso`) + Columna derecha (`main`).
     - **Módulo 5 (Deque):** Columna izquierda (Funciones auxiliares `deque`) + Columna derecha (`main`).
     - **Estilo responsivo:** Se ajustó la tipografía en `.reveal .two-column pre code` a `15px` con `line-height: 1.28` y padding óptimo.
   - *Resultado:* El 100% de los códigos queda completamente visible de un vistazo, con más de 120px de espacio libre por encima del pie institucional.

---

## 4. Matriz de Auditoría Automatizada

| Componente | Total Pasos | Errores JS | 404 / Net | Overlaps Finales | Estado |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Hub Taller STL** | 1 | 0 | 0 | 0 | **APROBADO** |
| **Módulo 0: Intro e Iteradores** | 20 | 0 | 0 | 0 | **APROBADO** |
| **Módulo 1: Vector** | 16 | 0 | 0 | 0 | **APROBADO** |
| **Módulo 2: Map** | 16 | 0 | 0 | 0 | **APROBADO** |
| **Módulo 3: Set** | 14 | 0 | 0 | 0 | **APROBADO** |
| **Módulo 4: Stack** | 18 | 0 | 0 | 0 | **APROBADO** |
| **Módulo 5: Queue y Deque** | 21 | 0 | 0 | 0 | **APROBADO** |
| **Debugger Interactivo (6 Scenarios)** | 18 | 0 | 0 | 0 | **APROBADO** |

---

## 5. Dictamen Final
El material del **Taller STL 2026** se encuentra en estado **impecable**, con un estándar pedagógico y visual de primer nivel, preparado para su despliegue y uso en el aula virtual SIED / Moodle y proyecciones en clase.
