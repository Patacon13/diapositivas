---
name: omegaup_manager
description: Manage, upload, update, and orchestrate programming courses, assignments, and problems on omegaUp. Use when interacting with the omegaUp API, updating existing problems with new ZIP files, creating course assignments, assigning points, reordering exercises, or managing visibility.
---

# omegaUp Manager Skill

Esta skill proporciona conocimiento, herramientas y pautas operativas para interactuar de forma programática con la plataforma competitiva **omegaUp** (`https://omegaup.com`) utilizando la API oficial (`libomegaup`).

---

## 1. Herramienta CLI Principal (`omegaup_tool.py`)

La herramienta multiplataforma se ubica en el subdirectorio `scripts/` de esta skill:
* **En Windows:** `%USERPROFILE%\.gemini\config\skills\omegaup_manager\scripts\omegaup_tool.py`
* **En Linux / Raspberry Pi:** `~/.gemini/config\skills/omegaup_manager/scripts/omegaup_tool.py` (o en `.agents/skills/omegaup_manager/scripts/omegaup_tool.py`)

### Detección automática de credenciales:
El script detecta automáticamente el token de acceso buscando en este orden:
1. Variable de entorno: `os.environ["OMEGAUP_TOKEN"]`
2. `~/.omegaup.env`
3. Archivos locales `.env` o en `.gemini/antigravity/scratch/.omegaup.env`

---

## 2. Comandos Frecuentes

### Verificar Autenticación
```bash
python scripts/omegaup_tool.py test-auth
```

### Listar Cursos Administrados
```bash
python scripts/omegaup_tool.py list-courses
```

### Listar Tareas de un Curso
```bash
python scripts/omegaup_tool.py list-assignments --course aedd-coma-2026
```

### Crear una Nueva Tarea en un Curso
```bash
python scripts/omegaup_tool.py create-assignment \
  --course aedd-coma-2026 \
  --alias parcial-3-complementaria \
  --name "Parcial 3 - Práctica complementaria" \
  --description "Matrices y Recorridos Especiales"
```
*(Nota: El alias de la tarea NO debe superar los 32 caracteres).*

### Subir un Nuevo Problema desde un archivo ZIP
```bash
python scripts/omegaup_tool.py create-problem \
  --alias cosechadora-vaiven \
  --title "La Cosechadora en Vaivén" \
  --zip /ruta/al/archivo/cosechadora-vaiven.zip \
  --tag problemTagSimulation \
  --private
```

### Actualizar/Editar un Problema Existente (Reemplazar ZIP o enunciados)
Para modificar un problema ya creado en omegaUp (cambiar enunciado, casos de test o solución):
```bash
python scripts/omegaup_tool.py update-problem \
  --alias blindaje-fortaleza-anillos \
  --zip /ruta/al/nuevo/archivo.zip \
  --title "Blindaje de la Fortaleza" \
  --private
```

### Asignar un Problema a una Tarea del Curso
```bash
python scripts/omegaup_tool.py add-to-course \
  --course aedd-coma-2026 \
  --assignment parcial-3-complementaria \
  --problem cosechadora-vaiven \
  --points 100
```

### Reordenar Problemas en una Tarea
```bash
python scripts/omegaup_tool.py reorder-problems \
  --course aedd-coma-2026 \
  --assignment parcial-3-complementaria \
  --problems "reactor-nuclear-espiral,cosechadora-vaiven,conos-radar-aereo,ElsaPatito"
```

---

## 3. Cursos Habituales en UTN FRSF
* **AEDD 2026 - Comisión A:** `alias: aedd-coma-2026`
  * Tareas comunes:
    * `1. Arreglos Unidimensionales`: `arreglos` / `arreglos-complementaria`
    * `2. Búsqueda y ordenamiento`: `busqueda-ordenamiento` / `busqueda-coomplementaria`
    * `3. Arreglos Bidimensionales`: `arreglos-bidimensionales` / `matrices-complementaria`
    * `4. Estructuras`: `estructuras` / `estructuras-complementaria`
    * `Parcial 2 - Ejemplos`: `parcial-2-ejemplos`
    * `Parcial 3 - Ejemplos`: `parcial-3-ejemplos`
    * `Parcial 3 - Práctica complementaria`: `parcial-3-complementaria`

---

## 4. Reglas Críticas de la API de omegaUp (`libomegaup`)

1. **Límite de Longitud de Alias (32 Caracteres):**
   * Tanto el alias de un problema (`problem_alias`) como el alias de una tarea (`assignment_alias`) **no deben superar 32 caracteres**. Si tienen 33 o más, la API responde `HTTP 400 parameterStringTooLong`.

2. **El Bug de `overall_wall_time_limit`:**
   * En `client.problem.create` y `client.problem.update`, el backend PHP de omegaUp concatena `"{$params->overallWallTimeLimit}ms"`. Si este parámetro no se especifica explícitamente, se escribe `"ms"` sin número a la configuración de Git y arroja un error interno `HTTP 412 problemDeployerInternalError`.
   * **Solución obligatoria:** Pasar siempre `overall_wall_time_limit=60000`, `extra_wall_time=0`, `output_limit=10240`, `input_limit=10240`.

3. **Tags Públicos Obligatorios:**
   * Toda creación o actualización requiere al menos una etiqueta pública en formato JSON:  
     `selected_tags=json.dumps([{"tagname": "problemTagImplementation", "public": True}])`.

4. **Fecha de Fin de Tareas:**
   * La fecha de fin de una tarea (`finish_time`) **nunca puede ser posterior** a la fecha de fin del curso. Debe consultarse `course.finish_time` previamente.

5. **Estructura del ZIP:**
   * En la raíz del archivo ZIP deben residir estrictamente:
     * `statements/es.markdown`
     * `cases/` (con los pares `*.in` y `*.out`).
