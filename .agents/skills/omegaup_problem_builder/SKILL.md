---
name: omegaUp Problem Builder
description: Creates, tests, and packages programming problems for the omegaUp platform. Triggers when the user asks to create an omegaUp problem, generate test cases, or build a .zip package for omegaUp.
---

# omegaUp Problem Builder Skill

You are an expert at creating problem packages for the omegaUp competitive programming platform.

## 1. Directory Structure
When starting a new problem, create a dedicated directory for it. The typical structure inside this directory should be:
- `solucion.cpp` or `solucion.py` (The reference solution)
- `statements/es.markdown` (The problem statement in Spanish, written in Markdown with LaTeX)
- `generador.py` (Script to generate all test cases)
- `make_zip.py` (Script to compile, verify, and compress the problem)
- `cases/` (Will be populated by `generador.py` with `.in` and `.out` files)

## 2. Test Case Generation (`generador.py`)
- You must create a Python script that generates exactly 10 test cases (or the number the user requests) inside the `cases/` folder.
- Test case files must be named logically, e.g., `01_ejemplo.in`, `02_small.in`, `10_large.in`.
- Every `.in` file MUST have a corresponding `.out` file. 
- You can compute the `.out` files directly inside `generador.py` using a Python reference implementation, which avoids compilation issues during generation.

## 3. Reference Solution (`solucion.cpp` / `solucion.py`)
- Always write a highly optimized reference solution.
- C++ is preferred for performance, but Python is acceptable for simple logic or generating test cases.

## 4. Problem Statement (`statements/es.markdown`)
- Must contain sections: Description, Input, Output, Example, Limits.
- Use the following omegaUp standard markdown format for examples:
```markdown
||input
1 2
||output
3
||description
Explanation of the example.
||end
```
- Use LaTeX inline (`$x$`) or display (`$$x$$`) for mathematical variables and formulas.

## 5. Zipping and Verification (`make_zip.py`)
- Provide a script that:
  1. Creates the `cases/` and `statements/` folders if they don't exist.
  2. Compresses the contents directly into the root of a `.zip` file (do NOT include intermediate parent directories). The `cases/` and `statements/` folders should be at the root of the zip archive.
  3. (Optional) Verifies the `solucion.cpp` output against the generated `.out` files.

## 6. Workflow
1. Analyze the user's problem logic.
2. Create the workspace.
3. Write the solution, statement, and generator scripts.
4. Run `generador.py`.
5. Run `make_zip.py`.
6. Inform the user of the location of the generated `.zip` file.

## 7. omegaUp API & Automation Tool (`libomegaup`)

The environment includes the official `omegaup` Python client library (`libomegaup`) and a dedicated CLI helper script located at:
📂 `C:\Users\tomya\.gemini\antigravity\scratch\omegaup_tool.py`

### Credentials Setup:
Credentials can be set via environment variables or stored in:
`C:\Users\tomya\.gemini\antigravity\scratch\.omegaup.env`
Format:
```env
OMEGAUP_TOKEN=your_api_token_here
# O de forma alternativa:
# OMEGAUP_USERNAME=tomyassenza
# OMEGAUP_PASSWORD=secret
```
Or configured directly via:
```bash
python C:\Users\tomya\.gemini\antigravity\scratch\omegaup_tool.py set-credentials --token <API_TOKEN>
```

### Automation Commands:
* **Verificar Conexión / Sesión:**
  `python omegaup_tool.py test-auth`
* **Listar Cursos Administrados:**
  `python omegaup_tool.py list-courses`
* **Listar Tareas de un Curso:**
  `python omegaup_tool.py list-assignments --course <course_alias>`
* **Crear Problema desde un ZIP:**
  `python omegaup_tool.py create-problem --alias <alias> --title "<Title>" --zip <path_to_zip>`
* **Asociar Problema a una Tarea/Curso:**
  `python omegaup_tool.py add-to-course --course <course_alias> --assignment <assignment_alias> --problem <alias> --points 100`
* **Carga Masiva (Batch):**
  `python omegaup_tool.py batch-triangular --course <course_alias> --assignment <assignment_alias>`

## 8. Critical API Quirks & Best Practices (libomegaup)
- **`overall_wall_time_limit` Bug:** In `problem.create`, when setting `memory_limit`, omegaUp backend PHP concatenates `OverallWallTimeLimit = "{$params->overallWallTimeLimit}ms"`. If `overall_wall_time_limit` is omitted or None, it writes `"ms"` to git config and causes `HTTP 412 problemDeployerInternalError`. Always pass `overall_wall_time_limit=60000`, `extra_wall_time=0`, `output_limit=10240`, `input_limit=10240`.
- **Public Tags Mandatory:** `problem.create` requires at least one public tag. Provide `selected_tags=json.dumps([{"tagname": "problemTagImplementation", "public": True}])` (or other valid tags like `problemTagSorting`, `problemTagSimulation`).
- **Visibility:** Use `visibility="private"` (or `0`) for unpublished/classroom problems.
- **Zip format:** Root of zip must contain `cases/` (`.in` and `.out`) and `statements/es.markdown`.

