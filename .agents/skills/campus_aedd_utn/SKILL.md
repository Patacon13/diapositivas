---
name: campus_aedd_utn
description: Gestión, subida de calificaciones de TPs, entregas y alumnos en el Campus Virtual de Carreras de Grado de UTN FRSF (Ingeniería en Sistemas - cátedra AEDD, URL: https://campusvirtual.frsf.utn.edu.ar). NUNCA usar para TUTI (SAO/PBA), para TUTI usar sied_utn.
---

# Campus Virtual AEDD (Grado / ISI) - Calificaciones y Gestión

Esta skill proporciona herramientas, pautas y scripts para interactuar con el **Campus Virtual de Carreras de Grado de la UTN FRSF** (`https://campusvirtual.frsf.utn.edu.ar`), enfocado en la cátedra **AEDD (Algoritmos y Estructuras de Datos)** de Ingeniería en Sistemas de Información.

> [!CAUTION]
> **REGLA DE DESAMBIGUACIÓN OBLIGATORIA:**
> * **Esta skill (`campus_aedd_utn`)** es **EXCLUSIVA** para el **Campus Virtual de Grado** (`https://campusvirtual.frsf.utn.edu.ar`) y la cátedra **AEDD (ISI)**.
> * Si el usuario o tarea menciona **TUTI**, **SAO** o **PBA**, **NO USAR ESTA SKILL**. En su lugar, utilizar siempre `sied_utn` (`https://tuti.sied.utn.edu.ar`).

---

## 1. Ubicación de Recursos y Credenciales
Todos los scripts, configuraciones y credenciales locales se encuentran aislados en:
* `~/.gemini/antigravity/scratch/campus_aedd/`

Archivos clave:
* `.env`: Credenciales exclusivas del docente para este campus (`CAMPUS_AEDD_TOKEN`, `CAMPUS_AEDD_URL`, `CAMPUS_AEDD_PRIVATE_TOKEN`).
* `get_token.py`: Asistente interactivo seguro para solicitar y guardar el token vía Moodle Mobile Service (`moodle_mobile_app`).
* `test_conn.py`: Verificación de conectividad, datos de usuario docente y listado de cursos activos.
* `session_manager.py`: Administrador de sesión web persistente (`MoodleSessionManager`, Capa 2) para crear o editar módulos vía formularios web (`/course/modedit.php`), reutilizando `.moodle_cookies.txt`.
* `manage_grades.py`: Script integral para consultar tareas, listar entregas de alumnos y subir calificaciones de TPs (individual o por lote CSV) con modo seguro de simulación (`--dry-run`).

---

## 2. Información del Entorno y Cursos Habituales
* **Plataforma:** Moodle 4.5.12+ (Campus Virtual Grado UTN FRSF).
* **Docente:** Assenza Tomás (`ar42870604`, `userid: 20618`).
* **Cursos Clave de AEDD (Ingeniería en Sistemas):**
  * **AEDD 2026:** `courseid: 7472`
  * **AEDD 2025:** `courseid: 6902`
  * **AEDD 2024:** `courseid: 6628`
  * **AEDD 2023:** `courseid: 5848`
* **Tareas Frecuentes AEDD 2026:**
  * Trabajo práctico - Entrega etapa 1 (`assignid: 44280`)
  * Entrega TP Parte 1 - COM B + E (`assignid: 44378`)
  * Entrega TP Parte 1 - COM F (`assignid: 44379`)
  * Entrega TP Parte 1 - COM A (`assignid: 44531`)
  * Trabajo práctico - Entrega etapa 2 (`assignid: 44747`)
  * Entrega TP Parte 2 - COM B + E (`assignid: 44726`)
  * Entrega TP Parte 2 - COM F (`assignid: 44727`)

---

## 3. Obtención y Configuración del Token

El Campus Virtual de Grado opera sobre Moodle y tiene habilitada la API REST a través del servicio oficial `moodle_mobile_app`.

### Opción A: Obtención Rápida por Terminal (Recomendada)
Ejecutar el script interactivo que solicita credenciales sin guardarlas en el historial:
```bash
python3 ~/.gemini/antigravity/scratch/campus_aedd/get_token.py
```
O mediante llamada directa `curl`:
```bash
curl -s -X POST "https://campusvirtual.frsf.utn.edu.ar/login/token.php" \
  -d "username=TU_USUARIO" \
  -d "password=TU_PASSWORD" \
  -d "service=moodle_mobile_app"
```
La respuesta entregará:
```json
{
  "token": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "privatetoken": "yyyyyyyy"
}
```

### Opción B: Copiar Token desde la Web
1. Ingresar a `https://campusvirtual.frsf.utn.edu.ar/`
2. Ir a **Perfil (arriba a la derecha) -> Preferencias -> Claves de seguridad** (`/user/managetoken.php`).
3. Copiar la clave correspondiente a *Servicio web de Moodle para aplicaciones móviles* (`moodle_mobile_app`).

### Dónde colocarlo
En el archivo `~/.gemini/antigravity/scratch/campus_aedd/.env`:
```env
CAMPUS_AEDD_URL=https://campusvirtual.frsf.utn.edu.ar
CAMPUS_AEDD_TOKEN=tu_token_aqui
CAMPUS_AEDD_PRIVATE_TOKEN=tu_private_token_opcional
```

Verificar la conexión con:
```bash
python3 ~/.gemini/antigravity/scratch/campus_aedd/test_conn.py
```

---

## 3. Subida y Gestión de Calificaciones de TPs

El script `manage_grades.py` automatiza todo el ciclo de corrección de TPs:

### 3.1. Exploración y Mapeo
1. **Listar cursos asignados al docente:**
   ```bash
   python3 ~/.gemini/antigravity/scratch/campus_aedd/manage_grades.py --list-courses
   ```
2. **Listar TPs (assignments) del curso:**
   ```bash
   python3 ~/.gemini/antigravity/scratch/campus_aedd/manage_grades.py --course-id <ID_CURSO> --list-assignments
   ```
3. **Listar entregas y estado actual de alumnos:**
   ```bash
   python3 ~/.gemini/antigravity/scratch/campus_aedd/manage_grades.py --assign-id <ID_TAREA> --course-id <ID_CURSO> --list-submissions
   ```

### 3.2. Carga Masiva desde CSV
El CSV puede contener columnas con cualquiera de estos encabezados:
* **Identificación del alumno:** `legajo`, `username`, `email` o `nombre`.
* **Nota:** `nota`, `grade`, `calificacion` o `puntaje`.
* **Feedback / Devolución (opcional):** `feedback`, `comentario` o `devolucion`.

Ejemplo `notas_tp1.csv`:
```csv
legajo,nota,feedback
12345,9.50,"Excelente resolución del algoritmo de ordenamiento y modularización."
67890,7.00,"El código compila pero falta optimizar la complejidad temporal."
```

#### Paso 1: Simulación Segura (Dry Run por defecto)
```bash
python3 ~/.gemini/antigravity/scratch/campus_aedd/manage_grades.py \
  --course-id <ID_CURSO> \
  --assign-id <ID_TAREA> \
  --grade-file notas_tp1.csv
```
*Esto valida los IDs de los alumnos, compatibilidad de notas y muestra la previsualización sin alterar el Moodle.*

#### Paso 2: Aplicación en Vivo
Una vez verificado el resultado:
```bash
python3 ~/.gemini/antigravity/scratch/campus_aedd/manage_grades.py \
  --course-id <ID_CURSO> \
  --assign-id <ID_TAREA> \
  --grade-file notas_tp1.csv \
  --apply
```

### 3.3. Calificación Individual
Para asentar la nota de un alumno puntual:
```bash
python3 ~/.gemini/antigravity/scratch/campus_aedd/manage_grades.py \
  --assign-id <ID_TAREA> \
  --user-id <ID_USUARIO> \
  --grade 8.50 \
  --feedback "Buen TP, revisar manejo de punteros." \
  --apply
```

---

## 4. Arquitectura de Dos Capas (Lectura/Notas vs. Creación/Edición Web)

* **Capa 1 (API REST `moodle_mobile_app`):** Consultas (`core_course_get_contents`, `mod_assign_get_assignments`, `mod_assign_get_submissions`) y calificación (`mod_assign_save_grade`).
* **Capa 2 (Sesión Web Persistente vía `session_manager.py`):** La API REST móvil no permite crear ni modificar módulos/tareas. Para ello se utiliza `MoodleSessionManager`, que obtiene y persiste la cookie `MoodleSession` en `.moodle_cookies.txt`:
  ```python
  from session_manager import MoodleSessionManager
  manager = MoodleSessionManager()
  opener = manager.get_authenticated_opener()
  ```
  * **Regla sobre Autologin:** Moodle aplica `autologinkeygenerationlockout` (espera de 6 minutos entre solicitudes de llaves). Verificar siempre con `manager.is_session_valid()` y reutilizar `.moodle_cookies.txt` sin pedir llaves en bucle.

---

## 5. Endpoints y Funciones Moodle Involucradas
* `core_webservice_get_site_info`: Datos del docente y validación de token.
* `core_enrol_get_users_courses`: Cursos donde participa el usuario.
* `core_enrol_get_enrolled_users`: Padrón de alumnos con legajos, usernames y nombres.
* `mod_assign_get_assignments`: Tareas configuradas por curso.
* `mod_assign_get_submissions`: Estado de entregas de los estudiantes.
* `mod_assign_get_grades`: Calificaciones actuales registradas.
* `mod_assign_save_grade`: Envío de nota numérica y feedback HTML al libro de calificaciones.
