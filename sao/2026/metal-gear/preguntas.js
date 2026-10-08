/**
 * =============================================================================
 * BANCO DE PREGUNTAS Y TERMINALES DE HACKEO // METAL GEAR JAVA
 * Cátedra: Sistemas y Algoritmos / Algoritmos y Estructuras de Datos
 * Facultad Regional Santa Fe — Universidad Tecnológica Nacional (UTN FRSF)
 * =============================================================================
 * 
 * GUÍA DE EDICIÓN PARA DOCENTES Y TUTORES:
 * -----------------------------------------------------------------------------
 * Este archivo contiene todas las preguntas, fragmentos de código Java, opciones
 * múltiples y explicaciones didácticas de las 3 misiones del juego.
 * 
 * ¿CÓMO EDITAR O AGREGAR PREGUNTAS?
 * 1. 'question': La consigna o pregunta que lee el estudiante en la terminal.
 * 2. 'code': El bloque de código Java a evaluar.
 *    -> TIP: Podés usar comillas invertidas ` ` para escribir código en varias
 *            líneas tal cual como en un IDE, sin necesidad de usar \n.
 * 3. 'options': Array con las opciones a mostrar.
 *    -> Poné 'correct: true' en la respuesta correcta.
 *    -> Poné 'correct: false' en los distractores.
 * 4. 'explanation': El mensaje pedagógico que aparece al resolver el hackeo.
 * 5. 'id' y 'roomId': Identificadores técnicos de la sala/terminal.
 *    -> ¡IMPORTANTE!: NO modificar los 'id' ni 'roomId' para mantener la
 *       asociación con el mapa de salas y puertas del juego.
 * =============================================================================
 */

const PREGUNTAS_GAME = {
    // =========================================================================
    // OPERACIÓN 01: DÁRSENA BYTECODE
    // Unidades 1 y 2 // Compilación javac vs JVM, Tipos Primitivos, Casting
    // =========================================================================
    nivel1: {
        titulo: "OPERACIÓN 01: DÁRSENA BYTECODE",
        unidades: "UNIDADES 1 Y 2",
        
        // Terminales de hackeo distribuidas en las salas de la misión
        terminals: [
            {
                id: "T1_1",
                roomId: "dock",
                name: "TERMINAL 01 // DÁRSENA DE ACCESO (UNIDAD 1)",
                code: `String fuente = "SolidByte.java";
// Herramienta responsable de generar el bytecode (.class):
byte[] bytecode = compilar(fuente);`,
                question: "Para transformar el código fuente (.java) en bytecode (.class) que la máquina virtual pueda procesar en cualquier plataforma, ¿cuál es la herramienta responsable según la Unidad 1?",
                options: [
                    { text: "javac compila el código fuente (.java) a bytecode (.class) multiplataforma, y la JVM lo interpreta/ejecuta en tiempo de ejecución.", correct: true },
                    { text: "El sistema operativo (Windows/Linux) compila directamente a binario nativo sin generar bytecode intermedio.", correct: false },
                    { text: "La JVM traduce directamente el archivo .java sin requerir un compilador previo de Java.", correct: false }
                ],
                explanation: "¡ACCESO CONCEDIDO! javac genera el bytecode (.class) independiente de la plataforma. ¡KEYCARD NIVEL 1 OBTENIDA PARA EL CORREDOR CENTRAL!",
                unlocked: false
            },
            {
                id: "T1_2",
                roomId: "corridor_u1",
                name: "TERMINAL 02 // SUBESTACIÓN CORREDOR (UNIDAD 1)",
                code: `int dividendo = 100;
int divisor = 0;
int resultado = dividendo / divisor; // Compila sin error sintáctico`,
                question: "Según la clasificación de errores de la Unidad 1 de SAO, ¿a qué categoría corresponde el fallo provocado por la división por cero?",
                options: [
                    { text: "Error en tiempo de ejecución (Run-time error / ArithmeticException por división por cero).", correct: true },
                    { text: "Error sintáctico detectado inmediatamente en tiempo de compilación por javac.", correct: false },
                    { text: "Error de enlace (Linker error) de librerías nativas del sistema anfitrión.", correct: false }
                ],
                explanation: "¡DIAGNÓSTICO EXACTO! La división por cero es una excepción en tiempo de ejecución. ¡REJILLAS LÁSER DEL CORREDOR DESACTIVADAS!",
                unlocked: false
            },
            {
                id: "T1_3",
                roomId: "filtration_u1",
                name: "TERMINAL 03 // TÚNEL DE FILTRADO (UNIDAD 2)",
                code: `byte b = 100; // 8 bits (-128 a 127)
int entero = b; // Promoción implícita
// Jerarquía estricta de tipos enteros primitivos en Java`,
                question: "¿Cuál es el orden ascendente estricto por tamaño de memoria en bits de los tipos enteros primitivos en Java?",
                options: [
                    { text: "byte (8 bits) < short (16 bits) < int (32 bits) < long (64 bits)", correct: true },
                    { text: "short (8 bits) < byte (16 bits) < int (32 bits) < long (64 bits)", correct: false },
                    { text: "byte (8 bits) < int (16 bits) < short (32 bits) < long (64 bits)", correct: false }
                ],
                explanation: "¡JERARQUÍA VALIDADA! byte(8b) cabe en short(16b), int(32b) y long(64b) sin pérdida. ¡KEYCARD NIVEL 2 OBTENIDA PARA EL PATIO DE VULCAN!",
                unlocked: false
            },
            {
                id: "T1_4",
                roomId: "filtration_u1",
                name: "TERMINAL 04 // CALIBRACIÓN DE SERVO (UNIDAD 2)",
                code: `double lecturaSensor = 104.75;
// El servomotor requiere un int exacto para destrabar el láser:
int calibracion = lecturaSensor; // Error: possible lossy conversion`,
                question: "El compilador javac rechaza la conversión implícita por pérdida de precisión decimal. ¿Cómo se debe aplicar el casting explícito según la Unidad 2?",
                options: [
                    { text: "int calibracion = (int) lecturaSensor; (Casting explícito truncando decimales a 104)", correct: true },
                    { text: "int calibracion = lecturaSensor.toInt(); (Método inexistente en tipos primitivos)", correct: false },
                    { text: "int calibracion = (double) lecturaSensor; (Reitera el tipo incompatible double)", correct: false }
                ],
                explanation: "¡CALIBRACIÓN EXITOSA! Casting explícito (int) aplicado correctamente.",
                unlocked: false
            }
        ],

        // Balizas interactivas durante la batalla contra el Boss (Vulcan Bytemaster)
        bossBeacons: [
            {
                id: "B1_1",
                name: "BALIZA 01 // IDENTIFICADORES VÁLIDOS (UNIDAD 1 & 2)",
                code: `// Evaluación léxica de identificadores en Java:
int 1erSensor = 10;        // Opción A
int total_acumulado$ = 25; // Opción B
int class = 99;            // Opción C`,
                question: "Según las normas léxicas de Java vistas en Unidades 1 y 2, ¿cuál de los identificadores es plenamente legal para compilar?",
                options: [
                    { text: "total_acumulado$ (Permite letras, dígitos, guión bajo y $, pero no puede comenzar con dígito ni ser palabra reservada)", correct: true },
                    { text: "1erSensor (Los identificadores en Java pueden comenzar libremente con dígitos numéricos)", correct: false },
                    { text: "class (Las palabras clave reservadas del lenguaje se pueden reutilizar como nombres de variables)", correct: false }
                ],
                explanation: "¡CONDENSADOR SOBRECARGADO! Identificador validado. ¡VULCAN BYTEMASTER ATURDIDO POR 7 SEGUNDOS!"
            },
            {
                id: "B1_2",
                name: "BALIZA 02 // OPERADOR MÓDULO % & PARIDAD (UNIDAD 2)",
                code: `int registro = 48;
// Condición booleana estricta para determinar si 'registro' es un número par:
boolean esPar = (/* ??? */);`,
                question: "¿Qué expresión lógica evalúa correctamente si un número entero es estrictamente par en Java utilizando el operador módulo?",
                options: [
                    { text: "registro % 2 == 0 (El resto de la división entera por 2 es exactamente cero)", correct: true },
                    { text: "registro / 2 == 0 (Evalúa si el cociente entero es cero, lo cual no determina paridad)", correct: false },
                    { text: "registro % 2 == 1 (Evalúa si el número es impar)", correct: false }
                ],
                explanation: "¡SISTEMA MOTRIZ DESESTABILIZADO! Operador módulo % verificado. ¡VULCAN BYTEMASTER ATURDIDO!"
            },
            {
                id: "B1_3",
                name: "BALIZA 03 // CONSTANTES FINAL (UNIDAD 2)",
                code: `/* ??? */ double FACTOR_VOLTAJE = 1.414;
FACTOR_VOLTAJE = 2.0; // Error de compilación`,
                question: "¿Qué palabra clave de Java se debe utilizar para declarar una constante cuyo valor no pueda ser modificado tras su inicialización?",
                options: [
                    { text: "final (Define una constante de solo lectura inmutable)", correct: true },
                    { text: "const (Palabra no admitida para declarar constantes en Java)", correct: false },
                    { text: "static readonly (Sintaxis no válida en el estándar Java)", correct: false }
                ],
                explanation: "¡SOBRECARGA ELÉCTRICA! Modificador final aplicado. ¡VULCAN BYTEMASTER ATURDIDO!"
            },
            {
                id: "B1_4",
                name: "BALIZA 04 // OPERADORES LÓGICOS EN CORTOCIRCUITO (UNIDAD 2)",
                code: `if (divisor != 0 && dividendo / divisor > 1) {
    // ¿Por qué no ocurre división por cero si divisor == 0?
}`,
                question: "¿Por qué el operador lógico && (AND en cortocircuito) protege contra excepciones al evaluar la segunda condición?",
                options: [
                    { text: "Si la primera condición es falsa, la segunda no llega a evaluarse (evaluación perezosa en cortocircuito).", correct: true },
                    { text: "Porque la JVM evalúa primero las operaciones matemáticas antes que las comparaciones lógicas.", correct: false },
                    { text: "Porque el operador && transforma automáticamente las divisiones por cero en ceros.", correct: false }
                ],
                explanation: "¡FRENO EN CORTOCIRCUITO! Evaluación lógica optimizada. ¡VULCAN BYTEMASTER ATURDIDO!"
            }
        ]
    },

    // =========================================================================
    // OPERACIÓN 02: DEPÓSITO DE BUCLES
    // Unidades 3 y 4 // Switch, Bucles (while, do-while, for), Centinelas, Métodos
    // =========================================================================
    nivel2: {
        titulo: "OPERACIÓN 02: DEPÓSITO DE BUCLES",
        unidades: "UNIDADES 3 Y 4",

        // Terminales de hackeo distribuidas en las salas de la misión
        terminals: [
            {
                id: "T2_1",
                roomId: "warehouse_entry",
                name: "TERMINAL 01 // ENTRADA RAM (UNIDAD 3)",
                code: `int opcion = 1; int valor = 10;
switch (opcion) {
    case 1: valor += 5;
    case 2: valor += 10; break;
    default: valor = 0;
}`,
                question: "Debido a la ausencia del break en el case 1, ¿cuál será el valor final de 'valor' por el efecto fall-through (ejecución en cascada)?",
                options: [
                    { text: "25 (Ejecuta case 1 llevando valor a 15, cae por cascada a case 2 sumando 10, y el break corta allí)", correct: true },
                    { text: "15 (Solo se ejecuta el bloque correspondiente al case 1)", correct: false },
                    { text: "0 (Al faltar el break salta inmediatamente al bloque default)", correct: false }
                ],
                explanation: "¡VULNERABILIDAD DESCUBIERTA! La omisión de break produce ejecución en cascada. ¡KEYCARD NIVEL 1 OBTENIDA PARA EL CRUCE RAM!",
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
                question: "¿Cuántas veces se ejecuta el cuerpo del bucle do-while anterior y cuál es el valor resultante de x?",
                options: [
                    { text: "Se ejecuta exactamente 1 vez (el do-while evalúa la condición al final / post-condición), dejando x = 11.", correct: true },
                    { text: "Se ejecuta 0 veces porque la condición inicial (10 < 5) es falsa.", correct: false },
                    { text: "Entra en un bucle infinito que bloquea la JVM.", correct: false }
                ],
                explanation: "¡POST-CONDICIÓN VALIDADA! El bucle do-while garantiza siempre al menos una pasada antes de verificar.",
                unlocked: false
            },
            {
                id: "T2_3",
                roomId: "loop_storage",
                name: "TERMINAL 03 // LECTURA CON CENTINELA (UNIDAD 3)",
                code: `int legajo = leerLegajo();
while (legajo != 0) {
    cantEmpleados++;
    totalSueldos += leerSueldo();
    legajo = leerLegajo(); // Lectura antes de cerrar el ciclo
}`,
                question: "¿Por qué es fundamental realizar una nueva lectura de la variable de control antes de cerrar el bucle con centinela?",
                options: [
                    { text: "Para actualizar la condición con el siguiente dato y permitir la salida cuando se ingrese el valor centinela (0), evitando un bucle infinito.", correct: true },
                    { text: "Porque la JVM exige obligatoriamente dos lecturas por sentencia de iteración.", correct: false },
                    { text: "Para reiniciar las variables contadoras y acumuladoras a cero en cada vuelta.", correct: false }
                ],
                explanation: "¡CENTINELA OPERATIVO! La lectura al final del ciclo asegura la terminación. ¡KEYCARD NIVEL 2 OBTENIDA PARA LA CÁMARA OLYMPO!",
                unlocked: false
            },
            {
                id: "T2_4",
                roomId: "modular_lab_u2",
                name: "TERMINAL 04 // LAB MODULAR TOP-DOWN (UNIDAD 4)",
                code: `public class ModuloLab {
    // Método para desarmar el blindaje sin instanciar la clase receptora:
    /* ??? */ void desarmarBlindaje(int codigoAcceso) {
        // Rutina modular
    }
}`,
                question: "¿Qué modificadores debe llevar la cabecera del método para ser invocado directamente desde el main de la misma clase (enfoque modular de Unidad 4)?",
                options: [
                    { text: "public static (Método de clase accesible directamente sin instanciar un objeto receptor)", correct: true },
                    { text: "private dynamic (Exige instanciación dinámica en Heap)", correct: false },
                    { text: "void static (Sintaxis inválida: static debe preceder al tipo de retorno)", correct: false }
                ],
                explanation: "¡MODULARIZACIÓN COMPLETA! Método estático validado. ¡REJILLAS LÁSER DEL CRUCE DESACTIVADAS!",
                unlocked: false
            },
            {
                id: "T2_5",
                roomId: "modular_lab_u2",
                name: "TERMINAL 05 // ÁMBITO & CALL STACK (UNIDAD 4)",
                code: `public static void duplicar(int n) {
    n = n * 2;
}
// En el método main:
int valor = 5;
duplicar(valor);
System.out.println(valor);`,
                question: "En Java los tipos primitivos se pasan estrictamente por valor (copia). ¿Qué imprimirá por consola la instrucción System.out.println(valor)?",
                options: [
                    { text: "5 (El método recibe una copia en su propio frame del Call Stack; la variable original del main no se modifica)", correct: true },
                    { text: "10 (El método modifica directamente la variable original en la memoria del main)", correct: false },
                    { text: "0 (Al ser el método void, la variable se vacía)", correct: false }
                ],
                explanation: "¡CALL STACK VERIFICADO! Los tipos primitivos se pasan por copia y sus frames de pila son independientes.",
                unlocked: false
            }
        ],

        // Balizas interactivas durante la batalla contra el Boss (Cyber Olympo)
        bossBeacons: [
            {
                id: "B2_1",
                name: "BALIZA 01 // TRAMPA DEL PUNTO Y COMA (UNIDAD 3)",
                code: `int activaciones = 0;
for (int i = 0; i < 5; i++);
{
    activaciones++;
}`,
                question: "¿Cuál será el valor final de 'activaciones' al ejecutarse este fragmento y por qué según la Unidad 3?",
                options: [
                    { text: "1 (El ';' al final de la línea del for deja el bucle vacío; el bloque { } se ejecuta una sola vez tras finalizar la iteración)", correct: true },
                    { text: "5 (El bucle itera 5 veces incrementando la variable en cada ciclo normal)", correct: false },
                    { text: "0 (La presencia del punto y coma produce un error sintáctico de compilación)", correct: false }
                ],
                explanation: "¡TRAMPA NEUTRALIZADA! Punto y coma al final de cabecera detectado. ¡CYBER OLYMPO ATURDIDO POR 7 SEGUNDOS!"
            },
            {
                id: "B2_2",
                name: "BALIZA 02 // RETORNO Y CLÁUSULA RETURN (UNIDAD 4)",
                code: `public static boolean verificarAcceso(int codigo) {
    if (codigo == 999) {
        return true;
    }
    // Falta contemplar la rama else: Error missing return statement
}`,
                question: "Si un método declara devolver un tipo de dato (ej. boolean), ¿qué exige estrictamente el compilador javac respecto a la sentencia return?",
                options: [
                    { text: "Todas las ramas lógicas posibles de ejecución deben retornar un valor del tipo declarado.", correct: true },
                    { text: "Solo se exige return en la rama verdadera if; la rama falsa devuelve null por defecto.", correct: false },
                    { text: "Los métodos estáticos no pueden devolver valores booleanos.", correct: false }
                ],
                explanation: "¡SOBRECARGA MODULAR APLICADA! Retorno completo en todas las ramas. ¡CYBER OLYMPO DESESTABILIZADO!"
            },
            {
                id: "B2_3",
                name: "BALIZA 03 // BUCLE FOR Y PASOS DE CONTROL (UNIDAD 3)",
                code: `for (int i = 10; i >= 0; i -= 2) {
    // ¿Cuántas iteraciones se ejecutan?
}`,
                question: "¿Cuántas iteraciones exactas realiza este bucle for descendente (10, 8, 6, 4, 2, 0)?",
                options: [
                    { text: "6 iteraciones (evalúa en i = 10, 8, 6, 4, 2 y 0 inclusive).", correct: true },
                    { text: "5 iteraciones (no incluye el valor cero).", correct: false },
                    { text: "10 iteraciones (avanza de a 1).", correct: false }
                ],
                explanation: "¡CONTROL DE BUCLES EXACTO! Paso decremento comprobado. ¡CYBER OLYMPO ATURDIDO!"
            },
            {
                id: "B2_4",
                name: "BALIZA 04 // DESCOMPOSICIÓN TOP-DOWN (UNIDAD 4)",
                code: `// Metodología Top-Down (Diseño descendente):
// Dividir un problema complejo en subproblemas jerárquicos independientes.`,
                question: "¿Cuál es la ventaja primordial de la descomposición Top-Down según la Unidad 4 de SAO?",
                options: [
                    { text: "Reduce la complejidad, permite desarrollar y probar módulos aisladamente y favorece la reutilización de código.", correct: true },
                    { text: "Hace que el programa se ejecute directamente en el hardware sin requerir máquina virtual.", correct: false },
                    { text: "Elimina la necesidad de utilizar variables y estructuras de repetición.", correct: false }
                ],
                explanation: "¡ARQUITECTURA TOP-DOWN VALIDADA! ¡CYBER OLYMPO ATURDIDO!"
            }
        ]
    },

    // =========================================================================
    // OPERACIÓN 03: NÚCLEO REX
    // Unidad 5 // Arreglos Unidimensionales, Matrices 2D, Strings, Búsqueda Binaria, Algoritmos de Ordenamiento
    // =========================================================================
    nivel3: {
        titulo: "OPERACIÓN 03: NÚCLEO REX",
        unidades: "UNIDAD 5",

        // Terminales de hackeo distribuidas en las salas de la misión
        terminals: [
            {
                id: "T3_1",
                roomId: "vector_vault",
                name: "TERMINAL 01 // BÓVEDA VECTORES (UNIDAD 5)",
                code: `int[] buffer = new int[5]; // Capacidad 5 elementos
// Índices válidos: 0, 1, 2, 3, 4
buffer[5] = 100; // ¿Qué ocurre en tiempo de ejecución?`,
                question: "En un arreglo en Java declarado con tamaño 5, ¿cuáles son los índices válidos y qué ocurre al intentar acceder a la posición 5?",
                options: [
                    { text: "Los índices van de 0 a 4 (longitud - 1). Intentar acceder al índice 5 lanza ArrayIndexOutOfBoundsException.", correct: true },
                    { text: "El arreglo se redimensiona automáticamente a 6 elementos para alojar el nuevo dato sin excepción.", correct: false },
                    { text: "Se asigna correctamente porque Java indexa internamente del 1 al 5.", correct: false }
                ],
                explanation: "¡LÍMITES VALIDADOS! La indexación en Java es base cero (0 a length - 1). ¡KEYCARD NIVEL 1 OBTENIDA PARA EL CONDUCTO TRONCAL!",
                unlocked: false
            },
            {
                id: "T3_2",
                roomId: "string_archive",
                name: "TERMINAL 02 // ARCHIVO STRINGS (UNIDAD 5)",
                code: `String pass1 = new String("REX");
String pass2 = new String("REX");
boolean porReferencia = (pass1 == pass2); // false
boolean porContenido = pass1.equals(pass2); // true`,
                question: "¿Por qué en Java los objetos de tipo String deben compararse utilizando el método .equals() en lugar del operador ==?",
                options: [
                    { text: "Porque '==' compara las direcciones de memoria (referencias), mientras que .equals() compara el contenido textual de los caracteres.", correct: true },
                    { text: "Porque '==' solo compara el primer carácter de la cadena.", correct: false },
                    { text: "Porque .equals() convierte automáticamente la cadena a un número entero hash.", correct: false }
                ],
                explanation: "¡IDENTIFICACIÓN EXACTA! String es inmutable y su contenido se compara con .equals().",
                unlocked: false
            },
            {
                id: "T3_3",
                roomId: "matrix_center",
                name: "TERMINAL 03 // MATRICES 2D (UNIDAD 5)",
                code: `int[][] rejilla = new int[3][4]; // 3 filas, 4 columnas
for (int i = 0; i < rejilla.length; i++) {
    for (int j = 0; j < rejilla[i].length; j++) {
        procesar(rejilla[i][j]);
    }
}`,
                question: "¿Cuál es el significado de rejilla.length y rejilla[0].length en una matriz bidimensional regular en Java?",
                options: [
                    { text: "rejilla.length indica la cantidad de filas (3) y rejilla[0].length la cantidad de columnas de la fila 0 (4).", correct: true },
                    { text: "rejilla.length indica la cantidad de columnas y rejilla[0].length el total de celdas.", correct: false },
                    { text: "Ambas expresiones devuelven siempre el producto total de filas por columnas (12).", correct: false }
                ],
                explanation: "¡MATRIZ COMPROBADA! Filas con m.length y columnas con m[0].length. ¡KEYCARD NIVEL 2 OBTENIDA PARA REX CORE!",
                unlocked: false
            },
            {
                id: "T3_4",
                roomId: "sorting_subcore",
                name: "TERMINAL 04 // BÚSQUEDA BINARIA (UNIDAD 5)",
                code: `// Algoritmo de Búsqueda Binaria en arreglos (O(log N)):
// Divide el espacio de búsqueda a la mitad en cada paso.
// Condición previa requerida para operar:`,
                question: "Según la Unidad 5 de SAO, ¿cuál es la precondición obligatoria e innegociable para poder aplicar el algoritmo de Búsqueda Binaria sobre un arreglo?",
                options: [
                    { text: "El arreglo debe estar estrictamente ordenado (de menor a mayor o viceversa) por la clave de búsqueda.", correct: true },
                    { text: "El arreglo no debe contener números primos ni valores impares.", correct: false },
                    { text: "El arreglo debe tener un tamaño que sea potencia de dos y todos sus elementos positivos.", correct: false }
                ],
                explanation: "¡PRECONDICIÓN VERIFICADA! Sin vector ordenado la búsqueda binaria falla. ¡DATOS DE ORDEN VALIDADOS!",
                unlocked: false
            },
            {
                id: "T3_5",
                roomId: "sorting_subcore",
                name: "TERMINAL 05 // ORDENAMIENTO BURBUJA (UNIDAD 5)",
                code: `// Método de Ordenamiento de la Burbuja (Bubble Sort):
// Compara pares de elementos adyacentes y los intercambia si están desordenados.
// Si no hubo ningún intercambio en una pasada completa:`,
                question: "En una implementación optimizada de Bubble Sort, ¿qué significa que en una pasada no se haya realizado ningún intercambio (swap)?",
                options: [
                    { text: "El arreglo ya se encuentra completamente ordenado y el algoritmo puede finalizar anticipadamente.", correct: true },
                    { text: "El arreglo está en orden inverso y se debe reiniciar el proceso.", correct: false },
                    { text: "Se ha producido un desbordamiento de índice en la memoria caché.", correct: false }
                ],
                explanation: "¡OPTIMIZACIÓN VALIDADA! Bandera de swap detectada. ¡LÁSERES CUÁNTICOS DE REX CORE DESACTIVADOS!",
                unlocked: false
            }
        ],

        // Balizas interactivas durante la batalla contra el Boss (Metal Gear JVM-Rex)
        bossBeacons: [
            {
                id: "B3_1",
                name: "BALIZA 01 // PUNTERO TOPE & LÍMITES (UNIDAD 5)",
                code: `int[] registros = new int[50];
int tope = 0; // Elementos cargados válidos
// Recorrido de los elementos válidos:
for (int i = 0; /* ??? */; i++) {
    inspeccionar(registros[i]);
}`,
                question: "Si el arreglo tiene capacidad 50 pero solo se cargaron 'tope' datos válidos, ¿cuál debe ser la condición de corte del for para no leer basura ni desbordar?",
                options: [
                    { text: "i < tope (Itera desde 0 hasta tope - 1, cubriendo exactamente los elementos cargados sin desbordar)", correct: true },
                    { text: "i <= 50 (Provocará ArrayIndexOutOfBoundsException al intentar acceder al índice 50)", correct: false },
                    { text: "i <= tope (Intenta acceder a la posición 'tope' que aún no ha sido cargada)", correct: false }
                ],
                explanation: "¡DESINCRONIZACIÓN LOGRADA! Puntero y límites de vector ajustados. ¡METAL GEAR JVM-REX ATURDIDO POR 7 SEGUNDOS!"
            },
            {
                id: "B3_2",
                name: "BALIZA 02 // SWAP CON VARIABLE AUXILIAR (UNIDAD 5)",
                code: `int[] registros = { 85, 42 };
// Intercambio de claves en el algoritmo de ordenamiento Burbuja:
int tmp = registros[0];
registros[0] = registros[1];
registros[1] = /* ??? */;`,
                question: "¿Qué expresión debe colocarse en '/* ??? */' para completar el intercambio (swap) sin perder el valor original de 85?",
                options: [
                    { text: "tmp; (Se asigna la variable auxiliar que resguardó el valor original antes de la sobreescritura)", correct: true },
                    { text: "registros[0]; (Se reasigna el elemento que ya fue sobreescrito con 42)", correct: false },
                    { text: "registros.length; (Se asigna la longitud del arreglo en lugar del dato resguardado)", correct: false }
                ],
                explanation: "¡SOBRECARGA APLICADA! Swap de burbuja completado con variable temporal. ¡METAL GEAR JVM-REX ATURDIDO!"
            },
            {
                id: "B3_3",
                name: "BALIZA 03 // INSERCIÓN CON CORRIMIENTO (UNIDAD 5)",
                code: `// Para insertar un elemento en la posición pos de un vector v cargado hasta tope:
for (int i = tope; i > pos; i--) {
    v[i] = v[i - 1]; // Corrimiento a la derecha
}
v[pos] = nuevoDato; tope++;`,
                question: "¿Por qué el corrimiento para inserción en un vector debe realizarse desde el último elemento hacia adelante (i = tope; i > pos; i--)?",
                options: [
                    { text: "Para no sobreescribir los elementos siguientes antes de haberlos desplazado a su nueva posición.", correct: true },
                    { text: "Porque Java prohíbe iterar de izquierda a derecha en arreglos de enteros.", correct: false },
                    { text: "Para evitar que el recolector de basura de la JVM elimine el vector.", correct: false }
                ],
                explanation: "¡CORRIMIENTO PERFECTO! Algoritmo de inserción validado. ¡METAL GEAR JVM-REX ATURDIDO!"
            },
            {
                id: "B3_4",
                name: "BALIZA 04 // ELIMINACIÓN CON CORRIMIENTO (UNIDAD 5)",
                code: `// Para eliminar el elemento en la posición pos en un vector con tope datos:
for (int i = pos; i < tope - 1; i++) {
    v[i] = v[i + 1]; // Corrimiento a la izquierda
}
tope--;`,
                question: "¿Por qué tras completar el corrimiento a la izquierda para eliminar un elemento se debe decrementar 'tope' (tope--)?",
                options: [
                    { text: "Porque ahora hay un elemento válido menos cargado en el arreglo y tope marca la nueva frontera.", correct: true },
                    { text: "Porque la capacidad física del arreglo se reduce en 1 celda de memoria.", correct: false },
                    { text: "Para indicar a la JVM que debe liberar el índice 0.", correct: false }
                ],
                explanation: "¡FRONTERA AJUSTADA! Algoritmo de eliminación validado. ¡METAL GEAR JVM-REX ATURDIDO!"
            }
        ]
    }
};

// Exponer en el objeto global window para su consumo en el navegador
if (typeof window !== 'undefined') {
    window.PREGUNTAS_GAME = PREGUNTAS_GAME;
}

// Exportar para entornos Node.js (test runner)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PREGUNTAS_GAME;
}
