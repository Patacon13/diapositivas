"""
omegaUp Automation Tool (CLI / Library)
Cross-platform tool for managing problems and courses in omegaUp.
Compatible with Windows, Linux and Raspberry Pi.
"""

import os
import sys
import json
import argparse
import datetime
from pathlib import Path
import omegaup.api as oapi

def find_env_file():
    candidates = [
        Path.home() / ".omegaup.env",
        Path(__file__).resolve().parent.parent / ".omegaup.env",
        Path.cwd() / ".omegaup.env",
        Path.cwd() / ".env",
    ]
    if sys.platform == "win32":
        candidates.append(Path(os.environ.get("USERPROFILE", "")) / ".gemini" / "antigravity" / "scratch" / ".omegaup.env")
    else:
        candidates.append(Path.home() / ".gemini" / "antigravity" / "scratch" / ".omegaup.env")

    for p in candidates:
        if p and p.exists():
            return p
    return None

def load_credentials():
    token = os.environ.get("OMEGAUP_TOKEN")
    username = os.environ.get("OMEGAUP_USERNAME")
    password = os.environ.get("OMEGAUP_PASSWORD")

    env_file = find_env_file()
    if env_file and env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                if "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip('"').strip("'")
                    if k == "OMEGAUP_TOKEN" and not token:
                        token = v
                    elif k == "OMEGAUP_USERNAME" and not username:
                        username = v
                    elif k == "OMEGAUP_PASSWORD" and not password:
                        password = v

    return token, username, password

def get_client(token=None, username=None, password=None):
    env_token, env_user, env_pass = load_credentials()
    token = token or env_token
    username = username or env_user
    password = password or env_pass

    if token:
        if username:
            return oapi.Client(username=username, api_token=token)
        return oapi.Client(api_token=token)
    elif username and password:
        return oapi.Client(username=username, password=password)
    else:
        raise ValueError(
            "No se encontraron credenciales de omegaUp. Configure OMEGAUP_TOKEN en ~/.omegaup.env o como variable de entorno."
        )

# -------------------------------------------------------------
# COMMAND HANDLERS
# -------------------------------------------------------------

def cmd_test_auth(args):
    client = get_client(args.token, args.username, args.password)
    session = client.session.currentSession()
    uname = getattr(session.session.identity, "username", "N/A")
    name = getattr(session.session.identity, "name", "")
    print(f"[OK] Conexión exitosa con omegaUp!")
    print(f"Usuario: {uname} ({name})")

def cmd_list_courses(args):
    token, username, password = load_credentials()
    token = args.token or token
    import requests
    import re
    
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    
    r = requests.get("https://omegaup.com/course/mine/", headers=headers)
    payloads = re.findall(r'<script type="text/json" id="([^"]+)">(.*?)</script>', r.text, re.DOTALL)
    found = False
    for pid, pcontent in payloads:
        try:
            data = json.loads(pcontent)
            if isinstance(data, dict) and "courses" in data:
                courses_dict = data["courses"]
                admin_section = courses_dict.get("admin", {})
                filtered = admin_section.get("filteredCourses", {})
                current_courses = filtered.get("current", {}).get("courses", [])
                past_courses = filtered.get("past", {}).get("courses", [])

                print(f"\n--- Cursos Administrados Actuales ({len(current_courses)}) ---")
                for c in current_courses:
                    print(f" * [{c.get('alias')}] {c.get('name')} (Tareas: {c.get('counts', {}).get('homework', 0)})")

                if past_courses:
                    print(f"\n--- Cursos Administrados Anteriores ({len(past_courses)}) ---")
                    for c in past_courses:
                        print(f" * [{c.get('alias')}] {c.get('name')}")
                found = True
                break
        except Exception:
            pass

    if not found:
        print("[Aviso] No se pudieron obtener los cursos vía web. Verifique token de acceso.")

def cmd_list_assignments(args):
    client = get_client(args.token, args.username, args.password)
    course = client.course.adminDetails(alias=args.course)
    print(f"\nTareas en el curso '{course.name}' ({args.course}):")
    for a in getattr(course, "assignments", []):
        alias = getattr(a, "alias", "")
        name = getattr(a, "name", "")
        print(f" * [{alias}] {name}")

def cmd_create_assignment(args):
    client = get_client(args.token, args.username, args.password)
    course = client.course.adminDetails(alias=args.course)
    
    if len(args.alias) > 32:
        print(f"Error: El alias '{args.alias}' excede el límite de 32 caracteres (tiene {len(args.alias)}).")
        return

    now = datetime.datetime.now() - datetime.timedelta(minutes=5)
    finish = course.finish_time

    print(f"Creando tarea '{args.name}' ({args.alias}) en {args.course}...")
    try:
        client.course.createAssignment(
            course_alias=args.course,
            alias=args.alias,
            name=args.name,
            description=args.description or args.name,
            start_time=now,
            finish_time=finish,
            assignment_type=args.type or "homework"
        )
        print(f"[OK] Tarea '{args.alias}' creada exitosamente.")
    except Exception as e:
        print(f"[Aviso/Error] al crear tarea: {e}")

def cmd_create_problem(args):
    client = get_client(args.token, args.username, args.password)
    zip_path = Path(args.zip)
    if not zip_path.exists():
        print(f"Error: no existe el archivo {zip_path}")
        return

    if len(args.alias) > 32:
        print(f"Error: El alias '{args.alias}' excede 32 caracteres (tiene {len(args.alias)}).")
        return

    tag = args.tag or "problemTagImplementation"
    visibility = "private" if args.private else "public"

    with open(zip_path, "rb") as zf:
        zip_bytes = zf.read()

    print(f"Creando problema '{args.alias}' ({args.title})...")
    try:
        res = client.problem.create(
            problem_alias=args.alias,
            title=args.title,
            source=args.source or "UTN FRSF AEDD",
            visibility=visibility,
            problem_level="problemLevelBasicIntroductionToProgramming",
            selected_tags=json.dumps([{"tagname": tag, "public": True}]),
            validator="token-caseless",
            time_limit=args.time_limit or 1000,
            memory_limit=args.memory_limit or 32768,
            overall_wall_time_limit=60000,
            extra_wall_time=0,
            output_limit=10240,
            input_limit=10240,
            languages="c11-gcc,cpp17-gcc,cpp20-gcc,py3",
            files_={"problem_contents": ("problem.zip", zip_bytes, "application/zip")}
        )
        print(f"[OK] Problema '{args.alias}' creado exitosamente.")
    except Exception as e:
        print(f"[Aviso/Error] al crear problema: {e}")

def cmd_update_problem(args):
    """Actualiza un problema existente en omegaUp con un nuevo paquete ZIP."""
    client = get_client(args.token, args.username, args.password)
    zip_path = Path(args.zip)
    if not zip_path.exists():
        print(f"Error: no existe el archivo {zip_path}")
        return

    # Obtener detalles existentes
    try:
        details = client.problem._client.query('/api/problem/details/', payload={'problem_alias': args.alias})
    except Exception as e:
        print(f"Error al buscar problema '{args.alias}': {e}")
        return

    title = args.title or details.get("title")
    source = args.source or details.get("source") or "UTN FRSF AEDD"
    tag = args.tag or "problemTagImplementation"
    visibility = "private" if (args.private or details.get("visibility") == 0) else "public"
    commit_msg = args.message or "Actualización de problema"

    with open(zip_path, "rb") as zf:
        zip_bytes = zf.read()

    print(f"Actualizando contenido del problema '{args.alias}' ({title})...")
    try:
        res = client.problem.update(
            problem_alias=args.alias,
            message=commit_msg,
            redirect=False,
            title=title,
            source=source,
            visibility=visibility,
            problem_level="problemLevelBasicIntroductionToProgramming",
            selected_tags=json.dumps([{"tagname": tag, "public": True}]),
            validator="token-caseless",
            time_limit=args.time_limit or 1000,
            memory_limit=args.memory_limit or 32768,
            overall_wall_time_limit=60000,
            extra_wall_time=0,
            output_limit=10240,
            input_limit=10240,
            languages="c11-gcc,cpp17-gcc,cpp20-gcc,py3",
            files_={"problem_contents": ("problem.zip", zip_bytes, "application/zip")}
        )
        print(f"[OK] Problema '{args.alias}' actualizado exitosamente en omegaUp.")
    except Exception as e:
        print(f"[Aviso/Error] al actualizar problema: {e}")

def cmd_add_to_course(args):
    client = get_client(args.token, args.username, args.password)
    print(f"Agregando '{args.problem}' a curso '{args.course}' -> tarea '{args.assignment}'...")
    try:
        res = client.course.addProblem(
            course_alias=args.course,
            assignment_alias=args.assignment,
            problem_alias=args.problem,
            points=args.points
        )
        print(f"[OK] Problema '{args.problem}' asignado con {args.points} pts.")
    except Exception as e:
        print(f"[Aviso/Error] al agregar a curso: {e}")

def cmd_reorder_problems(args):
    client = get_client(args.token, args.username, args.password)
    aliases = [p.strip() for p in args.problems.split(",") if p.strip()]
    print(f"Reordenando {len(aliases)} problemas en '{args.course}' / '{args.assignment}'...")
    try:
        client.course.updateProblemsOrder(
            course_alias=args.course,
            assignment_alias=args.assignment,
            problems=json.dumps(aliases)
        )
        print(f"[OK] Problemas reordenados exitosamente.")
    except Exception as e:
        print(f"[Aviso/Error] al reordenar problemas: {e}")

def main():
    parser = argparse.ArgumentParser(description="omegaUp Management CLI Tool")
    parser.add_argument("--token", help="omegaUp API Token")
    parser.add_argument("--username", help="omegaUp Username")
    parser.add_argument("--password", help="omegaUp Password")

    subparsers = parser.add_subparsers(dest="cmd", required=True)

    # test-auth
    p_auth = subparsers.add_parser("test-auth", help="Probar autenticación")
    p_auth.set_defaults(func=cmd_test_auth)

    # list-courses
    p_courses = subparsers.add_parser("list-courses", help="Listar cursos administrados")
    p_courses.set_defaults(func=cmd_list_courses)

    # list-assignments
    p_assign = subparsers.add_parser("list-assignments", help="Listar tareas de un curso")
    p_assign.add_argument("--course", required=True, help="Alias del curso")
    p_assign.set_defaults(func=cmd_list_assignments)

    # create-assignment
    p_cas = subparsers.add_parser("create-assignment", help="Crear nueva tarea en un curso")
    p_cas.add_argument("--course", required=True, help="Alias del curso")
    p_cas.add_argument("--alias", required=True, help="Alias de la tarea (max 32 chars)")
    p_cas.add_argument("--name", required=True, help="Nombre visible de la tarea")
    p_cas.add_argument("--description", default="", help="Descripción")
    p_cas.add_argument("--type", default="homework", choices=["homework", "test"], help="Tipo de tarea")
    p_cas.set_defaults(func=cmd_create_assignment)

    # create-problem
    p_create = subparsers.add_parser("create-problem", help="Crear nuevo problema desde ZIP")
    p_create.add_argument("--alias", required=True, help="Alias del problema (max 32 chars)")
    p_create.add_argument("--title", required=True, help="Título del problema")
    p_create.add_argument("--zip", required=True, help="Ruta al ZIP del problema")
    p_create.add_argument("--source", default="UTN FRSF AEDD", help="Fuente")
    p_create.add_argument("--tag", default="problemTagImplementation", help="Etiqueta pública")
    p_create.add_argument("--private", action="store_true", default=True, help="Subir con visibilidad privada")
    p_create.add_argument("--time-limit", type=int, default=1000, help="Límite de tiempo en ms")
    p_create.add_argument("--memory-limit", type=int, default=32768, help="Límite de memoria en KiB")
    p_create.set_defaults(func=cmd_create_problem)

    # update-problem
    p_upd = subparsers.add_parser("update-problem", help="Actualizar contenido/ZIP de un problema existente")
    p_upd.add_argument("--alias", required=True, help="Alias del problema a actualizar")
    p_upd.add_argument("--zip", required=True, help="Ruta al nuevo archivo ZIP")
    p_upd.add_argument("--title", help="Nuevo título (opcional)")
    p_upd.add_argument("--source", help="Nueva fuente (opcional)")
    p_upd.add_argument("--message", default="Actualización de problema", help="Mensaje de commit Git")
    p_upd.add_argument("--tag", default="problemTagImplementation", help="Etiqueta pública")
    p_upd.add_argument("--private", action="store_true", default=True, help="Mantener como privado")
    p_upd.add_argument("--time-limit", type=int, default=1000, help="Límite de tiempo en ms")
    p_upd.add_argument("--memory-limit", type=int, default=32768, help="Límite de memoria en KiB")
    p_upd.set_defaults(func=cmd_update_problem)

    # add-to-course
    p_add = subparsers.add_parser("add-to-course", help="Agregar problema a una tarea de un curso")
    p_add.add_argument("--course", required=True, help="Alias del curso")
    p_add.add_argument("--assignment", required=True, help="Alias de la tarea")
    p_add.add_argument("--problem", required=True, help="Alias del problema")
    p_add.add_argument("--points", type=float, default=100.0, help="Puntos asignados")
    p_add.set_defaults(func=cmd_add_to_course)

    # reorder-problems
    p_reorder = subparsers.add_parser("reorder-problems", help="Reordenar problemas de una tarea")
    p_reorder.add_argument("--course", required=True, help="Alias del curso")
    p_reorder.add_argument("--assignment", required=True, help="Alias de la tarea")
    p_reorder.add_argument("--problems", required=True, help="Lista separada por comas de alias en orden deseado")
    p_reorder.set_defaults(func=cmd_reorder_problems)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()
