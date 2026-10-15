---
name: sied_utn
description: Automatización, gestión de aulas, foros, entregas, notas y contenidos de SIED Moodle UTN (TUTI, cátedras SAO, PBA, etc.). Se activa cuando el usuario consulta sobre SIED, Moodle UTN, gestión de materias de TUTI, foros, tareas pendientes o sincronización de materiales.
---

# SIED UTN - Moodle Automation & Management Skill

Esta skill proporciona conocimiento, herramientas y pautas para interactuar de forma programática con la plataforma Moodle de **SIED UTN** (`https://tuti.sied.utn.edu.ar`).

---

## 1. Ubicación de los Recursos del Proyecto
Todos los scripts, configuraciones y credenciales locales se encuentran en:
* **En Windows:** `C:\Users\tomya\.gemini\antigravity\scratch\sied\`
* **En Linux / Raspberry Pi:** `~/.gemini/antigravity/scratch/sied/`

Archivos clave en esa carpeta:
* `.env`: Contiene las credenciales y tokens (`SIED_TOKEN`, `SIED_PRIVATE_TOKEN`, `SIED_URL`).
* `.moodle_cookies.txt`: Cookies de sesión web persistentes en disco (`MozillaCookieJar`).
* `session_manager.py`: Administrador de sesión web unificado (`MoodleSessionManager`).
* `course_backup_pre_edit.json`: Snapshot de respaldo del aula virtual (SAO 2026).
* `scan_forums.py` / `analyze_pending_doubts.py`: Monitoreo y detección de consultas pendientes en foros.
* `verify_status.py`: Auditoría en vivo de integridad del curso y comparación con backups.
* `test_conn.py`: Verificación rápida de estado de conexión.

---

## 2. Información del Entorno y Cursos Habituales
* **Usuario:** Tomás Assenza (`userid: 255`, email: `tassenza@frsf.utn.edu.ar`).
* **Plataforma:** Moodle 4.5.8+ (SIED TUTI FRSF).
* **Cursos Frecuentes:**
  * **SAO 2026 - 2do. Cuat.:** `courseid: 90`
  * **PBA 2026 - 1er. Cuat.:** `courseid: 81`
  * **Exámenes Finales SAO:** `courseid: 60`
  * **Exámenes Finales PBA:** `courseid: 66`
  * **Aulas de años anteriores:** SAO 2025 (`id: 50`), SAO 2024 (`id: 37`), etc.

---

## 3. Arquitectura de Dos Capas (¡Crítico!)

Cualquier agente que trabaje con SIED debe respetar estrictamente esta separación:

### Capa 1: Web Services REST API (Lecturas, Auditoría, Calificaciones)
* Endpoint: `https://tuti.sied.utn.edu.ar/webservice/rest/server.php`
* Parámetros base: `wstoken={SIED_TOKEN}&moodlewsrestformat=json&wsfunction={FUNCION}`
* Uso:
  * Consultar contenidos: `core_course_get_contents`
  * Listar foros y discusiones: `mod_forum_get_forums_by_courses`, `mod_forum_get_discussion_posts`
  * Calificaciones y entregas: `mod_assign_get_submissions`, `gradereport_user_get_grades_table`
  * Listado de URLs del curso: `mod_url_get_urls_by_courses`

### Capa 2: Sesión Web Persistente (Edición y Creación de Módulos)
Moodle Web Services no permite crear/modificar recursos de tipo URL desde la API móvil. Por ello se utiliza la capa web:
* **Manejador:** Utilizar SIEMPRE `session_manager.py`:
  ```python
  from session_manager import MoodleSessionManager
  manager = MoodleSessionManager()
  opener = manager.get_authenticated_opener()
  ```
* **Regla de oro sobre Autologin:**
  * Moodle tiene una protección estricta del servidor: `autologinkeygenerationlockout` (impone 6 minutos de espera entre solicitudes de llaves de autologin).
  * **NUNCA** solicitar llaves en bucle ni descartar cookies válidas.
  * Siempre verificar `manager.is_session_valid()` antes de pedir cualquier llave nueva.
  * Las sesiones guardadas en `.moodle_cookies.txt` duran horas y deben reutilizarse para todas las operaciones.

---

## 4. Protocolo de Seguridad en Aulas Virtuales
Antes de realizar cualquier modificación en un aula virtual con alumnos activos:
1. **Crear Snapshot Previo:** Descargar el estado completo con `core_course_get_contents` y guardarlo en JSON.
2. **Modificación Unitaria:** Modificar de a un módulo a la vez, nunca cambios masivos a ciegas.
3. **Verificación Inmediata:** Correr `verify_status.py` para comparar el estado en vivo contra el snapshot y confirmar que la cantidad de módulos y secciones siga intacta.
