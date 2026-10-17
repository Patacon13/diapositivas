/**
 * =============================================================================
 * BANCO DE DATOS PEDAGÓGICO Y SABOTAJES EN VIVO // METAL GEAR JAVA 3D
 * Cátedra: Sistemas y Algoritmos / Algoritmos y Estructuras de Datos
 * Facultad Regional Santa Fe — Universidad Tecnológica Nacional (UTN FRSF)
 * =============================================================================
 *
 * Incluye:
 *  1. Terminales Curriculares (Unidades 1 a 5) con opciones balanceadas.
 *  2. Sabotajes de Entorno en Tiempo Real (Inyección de Código 3D sobre grúas,
 *     torretas, barreras láser y centinelas).
 *  3. Balizas de Jefes y Desafíos de Inyección Directa (Bit-Lock).
 * =============================================================================
 */

const PREGUNTAS_GAME = {
    // =========================================================================
    // OPERACIÓN 01: DÁRSENA SUBMARINA SHADOW BYTE
    // Unidades 1 y 2 // Compilación javac vs JVM, Tipos Primitivos, Operadores y Casting
    // =========================================================================
    nivel1: {
        titulo: "OPERACIÓN 01: DÁRSENA SHADOW BYTE",
        unidades: "UNIDADES 1 Y 2",

        terminals: [
            {
                id: "T1_1",
                roomId: "dock",
                name: "TERMINAL 01 // DÁRSENA DE ACCESO (UNIDAD 1)",
                code: `String fuente = "SolidByte.java";
// Herramienta responsable de generar el bytecode (.class):
byte[] bytecode = compilar(fuente);`,
                question: "Para transformar el código fuente (.java) en bytecode (.class) multiplataforma, ¿cuál es el flujo correcto según la Unidad 1?",
                options: [
                    { text: "javac compila el código fuente (.java) a bytecode (.class), y la JVM lo interpreta/ejecuta.", correct: true },
                    { text: "El sistema operativo compila directamente el archivo .java a binario nativo .exe sin bytecode.", correct: false },
                    { text: "La JVM compila directamente el archivo .java en memoria sin usar el compilador javac.", correct: false }
                ],
                explanation: "¡ACCESO CONCEDIDO! javac genera el bytecode (.class) independiente de la plataforma. ¡KEYCARD NIVEL 1 OBTENIDA!",
                unlocked: false
            },
            {
                id: "T1_2",
                roomId: "corridor_u1",
                name: "TERMINAL 02 // SUBESTACIÓN CORREDOR (UNIDAD 1)",
                code: `int dividendo = 100;
int divisor = 0;
int resultado = dividendo / divisor; // Compila sin error sintáctico`,
                question: "Según la clasificación de errores de la Unidad 1, ¿a qué categoría corresponde el fallo provocado por la división entera por cero?",
                options: [
                    { text: "Error en tiempo de ejecución (Run-time error / ArithmeticException).", correct: true },
                    { text: "Error sintáctico detectado en tiempo de compilación por javac.", correct: false },
                    { text: "Error léxico de declaración de identificadores.", correct: false }
                ],
                explanation: "¡DIAGNÓSTICO EXACTO! La división por cero lanza ArithmeticException en tiempo de ejecución. ¡BARRERA LÁSER DESACTIVADA!",
                unlocked: false
            },
            {
                id: "T1_3",
                roomId: "filtration_u1",
                name: "TERMINAL 03 // NÚCLEO DE FILTRADO (UNIDAD 2)",
                code: `byte b = 100;     // 8 bits (-128 a 127)
int entero = b;  // Promoción implícita sin pérdida`,
                question: "¿Cuál es el orden ascendente estricto por tamaño en bits de los tipos enteros primitivos en Java?",
                options: [
                    { text: "byte (8 bits) < short (16 bits) < int (32 bits) < long (64 bits)", correct: true },
                    { text: "short (8 bits) < byte (16 bits) < int (32 bits) < long (64 bits)", correct: false },
                    { text: "byte (8 bits) < int (16 bits) < short (32 bits) < long (64 bits)", correct: false }
                ],
                explanation: "¡JERARQUÍA VALIDADA! byte(8b) < short(16b) < int(32b) < long(64b). ¡KEYCARD NIVEL 2 OBTENIDA PARA LA ARENA DE VULCAN!",
                unlocked: false
            },
            {
                id: "T1_4",
                roomId: "filtration_u1",
                name: "TERMINAL 04 // CALIBRACIÓN DE SERVOMOTOR (UNIDAD 2)",
                code: `double lecturaSensor = 104.75;
// El servomotor requiere un int exacto (104):
int calibracion = /* ??? */;`,
                question: "El compilador javac rechaza asignar un double a un int implícitamente. ¿Cómo se aplica el casting explícito correcto?",
                options: [
                    { text: "int calibracion = (int) lecturaSensor;", correct: true },
                    { text: "int calibracion = lecturaSensor.toInt();", correct: false },
                    { text: "int calibracion = (double) lecturaSensor;", correct: false }
                ],
                explanation: "¡CALIBRACIÓN EXITOSA! El casting explícito (int) trunca la parte decimal a 104 (+25 HP y +1 Granada EMP).",
                unlocked: false
            }
        ],

        sabotajes: [
            {
                id: "SAB_1_1",
                roomId: "dock",
                targetType: "crane",
                name: "SABOTAJE GRÚA MAGNÉTICA // GruaDarsena.java",
                desc: "Inyectá un operador relacional para que la grúa suelte el contenedor de plasma sobre el patrullero.",
                codeBefore: `int pesoContenedor = 180;
int limiteElectroiman = 180;
if (pesoContenedor `,
                codeAfter: ` limiteElectroiman) {
    electroiman.soltarCarga(); // ¡Impacto en zona de patrulla!
}`,
                tokens: ["<", ">", ">=", "!="],
                correctToken: ">=",
                explanation: "Con '>=' (180 >= 180 es true), el electroimán libera la carga pesada provocando una onda de choque que neutraliza al centinela cercano."
            },
            {
                id: "SAB_1_2",
                roomId: "corridor_u1",
                targetType: "turret",
                name: "SABOTAJE TORRETA EMP // TorretaCorredor.java",
                desc: "Alterá la condición de paridad con el operador módulo para sobrecargar los drones del pasillo.",
                codeBefore: `int canalFrecuencia = 48;
// Sobrecargar si el canal es estrictamente PAR:
if (canalFrecuencia `,
                codeAfter: ` == 0) {
    emitirPulsoEMP(); // Aturde centinelas del sector
}`,
                tokens: ["/ 2", "% 2", "% 3", "* 2"],
                correctToken: "% 2",
                explanation: "¡PULSO EMP DISPARADO! 48 % 2 == 0 evalúa paridad exacta, descargando un pulso que aturde a los centinelas de la sala."
            }
        ],

        bossBeacons: [
            {
                id: "B1_1",
                name: "BALIZA 01 // IDENTIFICADORES VÁLIDOS (UNIDADES 1 & 2)",
                code: `int 1erSensor = 10;        // Opción A
int total_acumulado$ = 25; // Opción B
int class = 99;            // Opción C`,
                question: "Según las reglas léxicas de Java, ¿cuál de los tres identificadores es plenamente válido para compilar?",
                options: [
                    { text: "total_acumulado$", correct: true },
                    { text: "1erSensor", correct: false },
                    { text: "class", correct: false }
                ],
                explanation: "¡CONDENSADOR SOBRECARGADO! En Java un identificador no puede iniciar con dígito ni ser palabra reservada."
            },
            {
                id: "B1_2",
                name: "BALIZA 02 // OPERADOR MÓDULO % (UNIDAD 2)",
                code: `int registro = 48;
boolean esPar = (/* ??? */);`,
                question: "¿Qué expresión booleana evalúa si 'registro' es un número par en Java?",
                options: [
                    { text: "registro % 2 == 0", correct: true },
                    { text: "registro / 2 == 0", correct: false },
                    { text: "registro % 2 == 1", correct: false }
                ],
                explanation: "¡SISTEMA MOTRIZ DESESTABILIZADO! El resto de dividir por 2 es 0."
            },
            {
                id: "B1_3",
                name: "BALIZA 03 // CONSTANTES INMUTABLES (UNIDAD 2)",
                code: `/* ??? */ double FACTOR_VOLTAJE = 1.414;`,
                question: "¿Qué palabra clave de Java define una constante cuyo valor no puede modificarse tras su inicialización?",
                options: [
                    { text: "final", correct: true },
                    { text: "const", correct: false },
                    { text: "readonly", correct: false }
                ],
                explanation: "¡SOBRECARGA ELÉCTRICA! 'final' declara constantes en Java."
            },
            {
                id: "B1_4",
                name: "BALIZA 04 // CORTOCIRCUITO LÓGICO (UNIDAD 2)",
                code: `if (divisor != 0 && dividendo / divisor > 1) { ... }`,
                question: "¿Por qué el operador && evita que ocurra ArithmeticException cuando divisor vale 0?",
                options: [
                    { text: "Si el primer operando es false, el segundo no se evalúa (cortocircuito).", correct: true },
                    { text: "Porque convierte automáticamente la división por cero en cero.", correct: false },
                    { text: "Porque evalúa primero el lado derecho y captura la excepción.", correct: false }
                ],
                explanation: "¡FRENO EN CORTOCIRCUITO! Evaluación perezosa aplicada."
            }
        ]
    },

    // =========================================================================
    // OPERACIÓN 02: COMPLEJO MODULAR & REACTOR DE BUCLES
    // Unidades 3 y 4 // Switch, Bucles (while, do-while, for), Centinelas, Métodos
    // =========================================================================
    nivel2: {
        titulo: "OPERACIÓN 02: COMPLEJO MODULAR",
        unidades: "UNIDADES 3 Y 4",

        terminals: [
            {
                id: "T2_1",
                roomId: "warehouse_entry",
                name: "TERMINAL 01 // ENTRADA RAM (UNIDAD 3)",
                code: `int opcion = 1, valor = 10;
switch (opcion) {
    case 1: valor += 5;
    case 2: valor += 10; break;
    default: valor = 0;
}`,
                question: "Por la ausencia de break en el case 1 (efecto fall-through), ¿cuál es el valor final de 'valor'?",
                options: [
                    { text: "25 (ejecuta case 1 sumando 5 y cae en cascada al case 2 sumando 10 hasta el break).", correct: true },
                    { text: "15 (solo ejecuta el bloque del case 1).", correct: false },
                    { text: "0 (cae hasta el bloque default por faltar el primer break).", correct: false }
                ],
                explanation: "¡VULNERABILIDAD DESCUBIERTA! La omisión de break produce ejecución en cascada (25). ¡KEYCARD NIVEL 1 OBTENIDA!",
                unlocked: false
            },
            {
                id: "T2_2",
                roomId: "loop_storage",
                name: "TERMINAL 02 // DEPÓSITO DE BUCLES (UNIDAD 3)",
                code: `int x = 10;
do {
    x++;
} while (x < 5);`,
                question: "¿Cuántas veces se ejecuta el cuerpo del bucle do-while anterior y qué valor toma x?",
                options: [
                    { text: "Se ejecuta 1 vez (post-condición) y deja x = 11.", correct: true },
                    { text: "Se ejecuta 0 veces porque 10 < 5 es falso al inicio.", correct: false },
                    { text: "Entra en un bucle infinito.", correct: false }
                ],
                explanation: "¡POST-CONDICIÓN VALIDADA! El bucle do-while garantiza al menos una iteración antes de evaluar la condición.",
                unlocked: false
            },
            {
                id: "T2_3",
                roomId: "loop_storage",
                name: "TERMINAL 03 // LECTURA CON CENTINELA (UNIDAD 3)",
                code: `int legajo = leerLegajo();
while (legajo != 0) {
    procesar(legajo);
    legajo = leerLegajo(); // Nueva lectura antes de cerrar
}`,
                question: "¿Por qué es indispensable volver a leer la variable 'legajo' al final del cuerpo del bucle while?",
                options: [
                    { text: "Para actualizar la condición con el siguiente dato y poder salir al ingresar el centinela (0).", correct: true },
                    { text: "Porque el compilador javac prohíbe cerrar llaves sin una invocación de lectura.", correct: false },
                    { text: "Para reiniciar los acumuladores a cero en cada iteración.", correct: false }
                ],
                explanation: "¡CENTINELA OPERATIVO! Sin lectura al cierre del ciclo se produciría un bucle infinito. ¡KEYCARD NIVEL 2 OBTENIDA!",
                unlocked: false
            },
            {
                id: "T2_4",
                roomId: "modular_lab_u2",
                name: "TERMINAL 04 // LAB MODULAR TOP-DOWN (UNIDAD 4)",
                code: `public class ModuloSeguridad {
    /* ??? */ void desactivarLaser(int sector) {
        // Llamado directo desde main sin instanciar objeto
    }
}`,
                question: "¿Qué modificadores debe llevar el método para invocarse directamente desde main en el enfoque modular de Unidad 4?",
                options: [
                    { text: "public static", correct: true },
                    { text: "private dynamic", correct: false },
                    { text: "void static", correct: false }
                ],
                explanation: "¡MODULARIZACIÓN COMPLETA! Los métodos de clase llevan 'public static'. ¡BARRERA LÁSER CENTRAL DESACTIVADA!",
                unlocked: false
            },
            {
                id: "T2_5",
                roomId: "modular_lab_u2",
                name: "TERMINAL 05 // ÁMBITO & CALL STACK (UNIDAD 4)",
                code: `public static void duplicar(int n) {
    n = n * 2;
}
// En main:
int valor = 5;
duplicar(valor);
System.out.println(valor);`,
                question: "Dado que Java pasa los tipos primitivos por valor (copia), ¿qué imprime System.out.println(valor)?",
                options: [
                    { text: "5 (duplicar modifica solo su copia local en su propio frame del Call Stack).", correct: true },
                    { text: "10 (el parámetro modifica la variable original del main).", correct: false },
                    { text: "0 (al ser void limpia la variable original).", correct: false }
                ],
                explanation: "¡CALL STACK VERIFICADO! Cada método opera sobre su propio frame en la pila (+25 HP y +1 Granada EMP).",
                unlocked: false
            }
        ],

        sabotajes: [
            {
                id: "SAB_2_1",
                roomId: "warehouse_junction",
                targetType: "crane",
                name: "SABOTAJE CONDUCTO CRIOGÉNICO // ValvulaVapor.java",
                desc: "Inyectá la sentencia de corte para detener el enfriamiento y liberar una nube criogénica sobre los guardias.",
                codeBefore: `for (int presion = 10; presion <= 50; presion += 10) {
    if (presion == 20) {
        descargarNubeCriogenica();
        `,
                codeAfter: `; // Cortar bucle inmediatamente
    }
}`,
                tokens: ["break", "continue", "return true", "default"],
                correctToken: "break",
                explanation: "¡FUGA CRIOGÉNICA ACTIVADA! 'break' interrumpe el bucle tras liberar el gas helado, aturdiendo a la patrulla del cruce."
            },
            {
                id: "SAB_2_2",
                roomId: "modular_lab_u2",
                targetType: "turret",
                name: "SABOTAJE DRON CENTINELA // RutinaGuardia.java",
                desc: "Modificá el valor de retorno booleano para engañar al sistema de detección del laboratorio.",
                codeBefore: `public static boolean intrusoDetectado(int alerta) {
    // Sabotear para que SIEMPRE reporte sector despejado:
    return `,
                codeAfter: `;
}`,
                tokens: ["false", "true", "null", "0"],
                correctToken: "false",
                explanation: "¡SISTEMA ENGAÑADO! Al retornar 'false', las torretas consideran el sector libre y descargan un pulso sobre los guardias."
            }
        ],

        bossBeacons: [
            {
                id: "B2_1",
                name: "BALIZA 01 // TRAMPA DEL PUNTO Y COMA (UNIDAD 3)",
                code: `int act = 0;
for (int i = 0; i < 5; i++);
{
    act++;
}`,
                question: "¿Cuál es el valor final de 'act' debido al punto y coma ';' al final de la línea del for?",
                options: [
                    { text: "1 (el ';' cierra un bucle vacío; el bloque siguiente se ejecuta una sola vez).", correct: true },
                    { text: "5 (itera 5 veces incrementando act).", correct: false },
                    { text: "0 (error de compilación).", correct: false }
                ],
                explanation: "¡TRAMPA NEUTRALIZADA! El punto y coma desvincula el cuerpo del for."
            },
            {
                id: "B2_2",
                name: "BALIZA 02 // CLÁUSULA RETURN (UNIDAD 4)",
                code: `public static boolean validar(int x) {
    if (x > 0) return true;
    // Falta retorno para cuando x <= 0
}`,
                question: "¿Qué exige el compilador javac en todo método no-void respecto a la sentencia return?",
                options: [
                    { text: "Todos los caminos de ejecución posibles deben retornar un valor del tipo declarado.", correct: true },
                    { text: "Basta con poner return dentro del primer if.", correct: false },
                    { text: "Retorna false automáticamente si se omite el return.", correct: false }
                ],
                explanation: "¡SOBRECARGA MODULAR! Todas las ramas deben tener retorno."
            },
            {
                id: "B2_3",
                name: "BALIZA 03 // CONTEO DE ITERACIONES (UNIDAD 3)",
                code: `for (int i = 10; i >= 0; i -= 2) { ... }`,
                question: "¿Cuántas iteraciones exactas realiza este bucle (10, 8, 6, 4, 2, 0)?",
                options: [
                    { text: "6 iteraciones", correct: true },
                    { text: "5 iteraciones", correct: false },
                    { text: "10 iteraciones", correct: false }
                ],
                explanation: "¡CONTROL EXACTO! Incluye el 0 por la condición '>=' (6 vueltas)."
            },
            {
                id: "B2_4",
                name: "BALIZA 04 // DISEÑO TOP-DOWN (UNIDAD 4)",
                code: `// Descomposición funcional en submódulos independientes`,
                question: "¿Cuál es el beneficio clave de la metodología Top-Down en la Unidad 4?",
                options: [
                    { text: "Divide un problema complejo en subproblemas simples, legibles y reutilizables.", correct: true },
                    { text: "Evita el uso de la memoria RAM Stack.", correct: false },
                    { text: "Reemplaza todos los bucles por sentencias switch.", correct: false }
                ],
                explanation: "¡ARQUITECTURA TOP-DOWN VALIDADA!"
            }
        ]
    },

    // =========================================================================
    // OPERACIÓN 03: BÓVEDA MATRICIAL & HANGAR DE REX
    // Unidad 5 // Arreglos 1D, Strings, Matrices 2D, Búsqueda Binaria, Ordenamiento
    // =========================================================================
    nivel3: {
        titulo: "OPERACIÓN 03: NÚCLEO REX PRIME",
        unidades: "UNIDAD 5",

        terminals: [
            {
                id: "T3_1",
                roomId: "vector_vault",
                name: "TERMINAL 01 // BÓVEDA DE VECTORES (UNIDAD 5)",
                code: `int[] buffer = new int[5]; // Índices: 0..4
buffer[5] = 100;`,
                question: "¿Qué ocurre al intentar acceder al índice 5 en un arreglo de longitud 5?",
                options: [
                    { text: "Lanza ArrayIndexOutOfBoundsException porque los índices válidos van de 0 a 4.", correct: true },
                    { text: "El arreglo crece automáticamente a 6 posiciones.", correct: false },
                    { text: "Guarda el valor en la última celda porque indexa de 1 a 5.", correct: false }
                ],
                explanation: "¡LÍMITES VALIDADOS! Los arreglos en Java se indexan desde 0 hasta length - 1. ¡KEYCARD NIVEL 1 OBTENIDA!",
                unlocked: false
            },
            {
                id: "T3_2",
                roomId: "string_archive",
                name: "TERMINAL 02 // ARCHIVO STRINGS (UNIDAD 5)",
                code: `String s1 = new String("REX");
String s2 = new String("REX");
boolean iguales = s1.equals(s2);`,
                question: "¿Por qué se debe usar .equals() en vez de '==' para comparar el texto de dos Strings en Java?",
                options: [
                    { text: "Porque '==' compara direcciones de memoria (referencias) y .equals() compara el contenido carácter a carácter.", correct: true },
                    { text: "Porque '==' solo sirve para comparar el largo de las cadenas.", correct: false },
                    { text: "Porque '==' no compila con variables de tipo String.", correct: false }
                ],
                explanation: "¡IDENTIFICACIÓN EXACTA! .equals() evalúa igualdad semántica de contenido.",
                unlocked: false
            },
            {
                id: "T3_3",
                roomId: "matrix_center",
                name: "TERMINAL 03 // MATRICES 2D (UNIDAD 5)",
                code: `int[][] rejilla = new int[3][4]; // 3 filas, 4 columnas`,
                question: "¿Qué valores devuelven rejilla.length y rejilla[0].length respectivamente?",
                options: [
                    { text: "rejilla.length devuelve 3 (filas) y rejilla[0].length devuelve 4 (columnas).", correct: true },
                    { text: "rejilla.length devuelve 4 (columnas) y rejilla[0].length devuelve 3 (filas).", correct: false },
                    { text: "Ambos devuelven 12 (el total de celdas de la matriz).", correct: false }
                ],
                explanation: "¡MATRIZ COMPROBADA! Filas = m.length, Columnas = m[0].length. ¡KEYCARD NIVEL 2 OBTENIDA PARA EL HANGAR DE REX!",
                unlocked: false
            },
            {
                id: "T3_4",
                roomId: "sorting_subcore",
                name: "TERMINAL 04 // BÚSQUEDA BINARIA (UNIDAD 5)",
                code: `int medio = (inicio + fin) / 2;`,
                question: "¿Cuál es la precondición obligatoria para poder aplicar Búsqueda Binaria sobre un arreglo?",
                options: [
                    { text: "El arreglo debe estar previamente ordenado.", correct: true },
                    { text: "El arreglo debe tener una cantidad par de elementos.", correct: false },
                    { text: "Todos los elementos del arreglo deben ser positivos.", correct: false }
                ],
                explanation: "¡PRECONDICIÓN VERIFICADA! Sin orden previo no se puede descartar la mitad del arreglo en cada paso.",
                unlocked: false
            },
            {
                id: "T3_5",
                roomId: "sorting_subcore",
                name: "TERMINAL 05 // BUBBLE SORT OPTIMIZADO (UNIDAD 5)",
                code: `// Pasada completa de Bubble Sort con bandera booleana 'huboSwap'`,
                question: "En Bubble Sort con bandera, ¿qué significa que termine una pasada completa con huboSwap == false?",
                options: [
                    { text: "El arreglo ya está ordenado y el algoritmo puede cortar anticipadamente.", correct: true },
                    { text: "El arreglo está en orden inverso y debe reiniciarse.", correct: false },
                    { text: "Hubo un desbordamiento de índice en la pasada.", correct: false }
                ],
                explanation: "¡OPTIMIZACIÓN VALIDADA! ¡BARRERA LÁSER CUÁNTICA DE REX DESACTIVADA!",
                unlocked: false
            }
        ],

        sabotajes: [
            {
                id: "SAB_3_1",
                roomId: "transit_conduit",
                targetType: "crane",
                name: "SABOTAJE PUENTE GRÚA // VectorGrua.java",
                desc: "Apuntá al último elemento válido del vector de contenedores (longitud 4) para soltarlo.",
                codeBefore: `int[] contenedores = { 10, 25, 40, 99 };
// Liberar el ÚLTIMO contenedor del arreglo:
soltarContenedor(contenedores[`,
                codeAfter: `]);`,
                tokens: ["3", "4", "0", "-1"],
                correctToken: "3",
                explanation: "¡IMPACTO EXACTO! En un arreglo de 4 elementos, el último índice válido es length - 1 = 3 (valor 99)."
            },
            {
                id: "SAB_3_2",
                roomId: "sorting_subcore",
                targetType: "turret",
                name: "SABOTAJE MATRIZ LÁSER // MatrizDefensa.java",
                desc: "Seleccioná la condición de la diagonal principal para redirigir la descarga hacia los centinelas.",
                codeBefore: `for (int f = 0; f < 3; f++) {
    for (int c = 0; c < 3; c++) {
        if (`,
                codeAfter: `) sobrecargarCelda(f, c);
    }
}`,
                tokens: ["f == c", "f > c", "f == 3", "c == -1"],
                correctToken: "f == c",
                explanation: "¡DIAGONAL SOBRECARGADA! La condición (f == c) selecciona las celdas [0][0], [1][1] y [2][2], neutralizando la patrulla."
            }
        ],

        bossBeacons: [
            {
                id: "B3_1",
                name: "BALIZA 01 // PUNTERO TOPE (UNIDAD 5)",
                code: `int[] v = new int[50]; int tope = 12;
for (int i = 0; /* ??? */; i++)`,
                question: "¿Cuál es la condición correcta para recorrer únicamente los 'tope' elementos cargados?",
                options: [
                    { text: "i < tope", correct: true },
                    { text: "i <= 50", correct: false },
                    { text: "i <= tope", correct: false }
                ],
                explanation: "¡PUNTERO AJUSTADO! Recorre de 0 a tope - 1."
            },
            {
                id: "B3_2",
                name: "BALIZA 02 // SWAP CON AUXILIAR (UNIDAD 5)",
                code: `int tmp = v[0];
v[0] = v[1];
v[1] = /* ??? */;`,
                question: "¿Qué debe asignarse en v[1] para completar el intercambio sin perder el dato original?",
                options: [
                    { text: "tmp", correct: true },
                    { text: "v[0]", correct: false },
                    { text: "v.length", correct: false }
                ],
                explanation: "¡SWAP COMPLETADO! 'tmp' conserva el valor original de v[0]."
            },
            {
                id: "B3_3",
                name: "BALIZA 03 // INSERCIÓN CON CORRIMIENTO (UNIDAD 5)",
                code: `for (int i = tope; i > pos; i--) {
    v[i] = v[i - 1];
}`,
                question: "¿Por qué el corrimiento a la derecha para insertar se hace de atrás hacia adelante (i = tope; i > pos; i--)?",
                options: [
                    { text: "Para no pisar ni perder los elementos siguientes antes de desplazarlos.", correct: true },
                    { text: "Porque los arreglos no permiten asignar de izquierda a derecha.", correct: false },
                    { text: "Para reducir la longitud física del arreglo.", correct: false }
                ],
                explanation: "¡CORRIMIENTO PERFECTO!"
            },
            {
                id: "B3_4",
                name: "BALIZA 04 // ELIMINACIÓN CON CORRIMIENTO (UNIDAD 5)",
                code: `for (int i = pos; i < tope - 1; i++) {
    v[i] = v[i + 1];
}
tope--;`,
                question: "¿Por qué se decrementa 'tope--' luego de desplazar los elementos hacia la izquierda?",
                options: [
                    { text: "Porque ahora hay un elemento válido menos cargado en el vector.", correct: true },
                    { text: "Porque libera físicamente la memoria en el sistema operativo.", correct: false },
                    { text: "Para borrar el índice 0 del arreglo.", correct: false }
                ],
                explanation: "¡FRONTERA LÓGICA ACTUALIZADA!"
            }
        ]
    }
};

if (typeof window !== 'undefined') {
    window.PREGUNTAS_GAME = PREGUNTAS_GAME;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PREGUNTAS_GAME;
}
