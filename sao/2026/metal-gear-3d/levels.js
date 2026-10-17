/**
 * =============================================================================
 * METAL GEAR JAVA 3D // CAMPAIGN LEVELS, 2D WAYPOINT AI ROUTES & NARRATIVE
 *  - 3 Operaciones de Campaña con Historia ("Incidente Shadow Byte - UTN FRSF")
 *  - Patrullas 2D Multi-Waypoint con pausas de vigilancia y rotación de linterna
 *  - Cámaras de seguridad con barrido angular y Nodos de Sabotaje Físico 3D
 *  - Piso Matricial 3D interactivo en Misión 3 (Matrix Floor Puzzle)
 *  - Diálogos de Historia (Holo-CODEC) + Transmisiones en Vivo (Picture-in-Picture)
 * =============================================================================
 */
(function () {
    'use strict';

    const P = (typeof PREGUNTAS_GAME !== 'undefined') ? PREGUNTAS_GAME : {};

    // Contactos del Holo-CODEC
    const CODEC_CONTACTS = [
        { id: 'coronel', freq: '140.85', name: 'CORONEL CAMPBELL', role: 'COMANDANTE DE OPERACIONES // CÁTEDRA SAO', color: '#38bdf8' },
        { id: 'enlace', freq: '140.96', name: 'TUTORA DE ENLACE', role: 'ARQUITECTURA JVM & CHECKPOINTS', color: '#34d399' },
        { id: 'capitan', freq: '141.12', name: 'CAPITÁN MODULAR', role: 'DISEÑO TOP-DOWN & MÉTODOS', color: '#fbbf24' },
        { id: 'logica', freq: '141.52', name: 'TUTORA DE LÓGICA', role: 'TIPOS PRIMITIVOS & CORTOCIRCUITO', color: '#a78bfa' },
        { id: 'debugging', freq: '141.80', name: 'TUTOR DE DEBUGGING', role: 'CAZADOR DE BUGS & TRAMPAS DE CICLO', color: '#fb7185' },
        { id: 'algoritmos', freq: '142.52', name: 'TUTOR DE ALGORITMOS', role: 'VECTORES, MATRICES & BÚSQUEDA BINARIA', color: '#2dd4bf' }
    ];

    // Guiones Cinemáticos del Holo-CODEC
    const CODEC_SCRIPTS = {
        intro: [
            { speaker: 'CORONEL', text: 'Solid Byte, me alegra que tu enlace neural 3D esté operativo. El sindicato rebelde "Sons of Bytecode" tomó el Búnker Subterráneo de Servidores de la UTN Santa Fe.' },
            { speaker: 'SOLID BYTE', text: 'Estoy en la Dársena Submarina, Coronel. Veo patrullas cibernéticas con visores láser y grúas magnéticas sobre los contenedores.' },
            { speaker: 'CORONEL', text: 'Activá tu nuevo VISOR BYTECODE con [V] o [TAB]: verás los cables de datos en el piso 3D que conectan los Nodos de Sabotaje con las grúas y torretas.' },
            { speaker: 'SOLID BYTE', text: '¿Puedo hackear el código Java de las instalaciones en tiempo real para usar el entorno contra ellos?' },
            { speaker: 'CORONEL', text: 'Exacto. Acercate con sigilo, usá [ESPACIO] para hacer Dash táctico entre coberturas, [E] para derribo CQC por la espalda o hackear terminales, y recuperate con el Café de la Cantina. ¡Suerte, Byte!' }
        ],
        boss_briefing_1: [
            { speaker: 'CORONEL', text: '¡Cuidado, Solid Byte! Entraste al Patio de Carga Blindado. Ese coloso es VULCAN BYTEMASTER.' },
            { speaker: 'SOLID BYTE', text: 'Un tanque de asedio con doble cañón de plasma... Su blindaje frontal rebota mis disparos.' },
            { speaker: 'TUTORA DE LÓGICA // LAB', text: '¡Sus escudos dependen de las 4 Balizas de Compilación en las esquinas de la arena! Hackeá la baliza activa en amarillo para provocarle un Overflow y exponer su reactor trasero.' },
            { speaker: 'CORONEL', text: 'Cuando su reactor quede expuesto en rojo, corré hacia él (usá [ESPACIO] para esquivar sus ráfagas) y descargá un golpe crítico con [E].' }
        ],
        victory_1: [
            { speaker: 'SOLID BYTE', text: 'Coronel, Vulcan Bytemaster quedó reducido a chatarra. El paso hacia el Complejo Modular de Memoria RAM está despejado.' },
            { speaker: 'CORONEL', text: 'Excelente trabajo, Byte. Dominaste la compilación javac y los tipos primitivos. Preparate para la Operación 02: Control de Flujo y Diseño Modular.' }
        ],
        boss_briefing_2: [
            { speaker: 'CAPITÁN', text: '¡Alerta en el techo, Byte! Es CYBER OLYMPO, el hexápodo mecánico modular.' },
            { speaker: 'SOLID BYTE', text: '¡Salta por el aire tratando de aplastarme! Veo su retícula láser marcando el suelo 3D antes de caer.' },
            { speaker: 'CAPITÁN', text: 'Usá tu Dash táctico [ESPACIO] apenas veas el círculo rojo en el piso. Hackeá las balizas modulares para cortar sus subrutinas y golpeá su CPU central con [E].' }
        ],
        victory_2: [
            { speaker: 'SOLID BYTE', text: 'Cyber Olympo desmantelado. Sus subrutinas recursivas colapsaron.' },
            { speaker: 'CORONEL', text: 'Solo queda el nivel más profundo del búnker, Byte: el Hangar del Mainframe donde aguardan Psycho Mantis y METAL GEAR JVM-REX PRIME.' }
        ],
        boss_briefing_3: [
            { speaker: 'CORONEL', text: '¡Dios mío... ese es METAL GEAR JVM-REX PRIME! Quince metros de blindaje compuesto con un Railgun de excepciones no comprobadas.' },
            { speaker: 'TUTOR DE ALGORITMOS // LAB', text: '¡No te dejes intimidar por su tamaño, Byte! Esquivá los misiles verticales mirando las alertas del suelo y vulnerá sus balizas de Arreglos y Búsqueda Binaria para abrir su radomo.' }
        ],
        victory: [
            { speaker: 'SOLID BYTE', text: '¡METAL GEAR JVM-REX PRIME destruido! Las actas de examen y el servidor maestro de la UTN Santa Fe están a salvo.' },
            { speaker: 'CORONEL', text: 'Misión cumplida, Solid Byte. Demostraste dominio absoluto desde compilación y tipos primitivos hasta modularización, vectores, matrices y búsqueda binaria. ¡Sos un verdadero BIG BOSS de la JVM!' }
        ]
    };

    // Transmisiones en vivo Picture-in-Picture (no pausan el juego)
    const PIP_TRANSMISSIONS = {
        dock: {
            speaker: 'CORONEL',
            role: 'COMANDO // 140.85',
            text: 'Byte, presioná [V] para encender el Visor Bytecode. Si saboteás el Nodo Cian cerca de la entrada, harás caer la carga de la grúa sobre el centinela.'
        },
        corridor_u1: {
            speaker: 'TUTORA DE LÓGICA // LAB',
            role: 'LÓGICA // 141.52',
            text: '¡Ojo con la cámara de seguridad en el corredor! Podés usar el Nodo de Sabotaje EMP para aturdir a toda la patrulla con el operador módulo %.'
        },
        filtration_u1: {
            speaker: 'TUTORA DE ENLACE // SYS',
            role: 'ENLACE // 140.96',
            text: 'En el Túnel de Filtrado está la Terminal 03 con la Keycard Nivel 2 y una máquina de Café Expreso (+50 HP) antes de enfrentar a Vulcan.'
        },
        warehouse_entry: {
            speaker: 'CAPITÁN',
            role: 'MODULAR // 141.12',
            text: 'Bienvenido al Almacén RAM. Los guardias aquí patrullan en circuito 2D y vigilan las esquinas. Acercate por detrás y presioná [E] para derribo CQC.'
        },
        warehouse_junction: {
            speaker: 'TUTOR DE DEBUGGING // LAB',
            role: 'DEBUG // 141.80',
            text: '¡Asere! En el centro del cruce hay una válvula criogénica. Inyectale un "break;" desde el nodo de sabotaje y congelá a los guardias en el acto.'
        },
        loop_storage: {
            speaker: 'CAPITÁN',
            role: 'MODULAR // 141.12',
            text: 'Desbloqueá primero la Terminal 02 (do-while) a la izquierda para habilitar la Terminal 03 (centinela) que guarda la Keycard Nivel 2.'
        },
        modular_lab_u2: {
            speaker: 'TUTORA DE ENLACE // SYS',
            role: 'ENLACE // 140.96',
            text: 'En el Laboratorio Modular podés desactivar la barrera láser del cruce y recargar salud antes de entrar a la cámara de Cyber Olympo.'
        },
        vector_vault: {
            speaker: 'TUTOR DE ALGORITMOS // LAB',
            role: 'ALGORITMOS // 142.52',
            text: 'Entraste al Mainframe Core (Unidad 5). Recordá que en la Terminal 01 podés resolver por código o abrir el minijuego interactivo Array Vault.'
        },
        transit_conduit: {
            speaker: 'CORONEL',
            role: 'COMANDO // 140.85',
            text: 'El Conducto Troncal conecta el Archivo de Strings (Norte), el Centro Matricial (Sur) y el Hangar de REX (Este). ¡Usá la grúa del índice [3] a tu favor!'
        },
        matrix_center: {
            speaker: 'TUTOR DE ALGORITMOS // LAB',
            role: 'ALGORITMOS // 142.52',
            text: '¡Mirá el piso 3D en el centro de la sala! Pisá las 3 baldosas luminosas de la Diagonal Principal (fila == col) para sobrecargar el blindaje y ganar bonificación.'
        },
        sorting_subcore: {
            speaker: 'TUTOR DE DEBUGGING // LAB',
            role: 'DEBUG // 141.80',
            text: '¡Última parada antes de REX! Desactivá los láseres cuánticos en la Terminal 05 validando Bubble Sort y preparate para el duelo final.'
        }
    };

    // =========================================================================
    // DEFINICIÓN DE LAS 3 OPERACIONES DE CAMPAÑA 3D
    // =========================================================================
    const CAMPAIGN_LEVELS = [
        // ---------------------------------------------------------------------
        // OPERACIÓN 01: DÁRSENA SHADOW BYTE (UNIDADES 1 Y 2)
        // ---------------------------------------------------------------------
        {
            id: 1,
            code: "OP-01",
            name: "OPERACIÓN 01: DÁRSENA SHADOW BYTE",
            shortName: "OP-01 // DÁRSENA",
            subtitle: "UNIDADES 1 Y 2 // COMPILACIÓN JAVAC, TIPOS PRIMITIVOS & OPERADORES",
            topics: "Compilación (.java -> javac -> .class / JVM), errores de ejecución, tipos primitivos, módulo % y casting explícito.",
            bossName: "VULCAN BYTEMASTER",
            bossSub: "TANQUE DE ASEDIO BLINDADO // OVERFLOW & CASTING",
            bossType: "vulcan",
            themeColor: "#38bdf8",
            floorColor: 0x0b1524,
            wallColor: 0x162438,
            startRoom: "dock",
            startPlayerX: 75,
            startPlayerY: 225,
            rooms: {
                dock: {
                    id: 'dock',
                    title: 'SECTOR 01: DÁRSENA SUBMARINA',
                    subtitle: 'UNIDAD 1 // INFILTRACIÓN, GRÚA MAGNÉTICA & COMPILACIÓN JAVAC',
                    visited: true,
                    envStyle: 'dock',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 185, y: 75, w: 42, h: 115, kind: 'container_cyan' },
                        { x: 185, y: 260, w: 42, h: 115, kind: 'container_amber' },
                        { x: 455, y: 150, w: 48, h: 150, kind: 'server_rack' }
                    ],
                    doors: [
                        { id: 'dock_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'corridor_u1', spawnX: 55, spawnY: 225, reqKey: 1, label: 'CORREDOR [LV.1]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 101, x: 330, y: 110, spawnX: 330, spawnY: 110, radius: 14, speed: 1.55,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 165,
                            waypoints: [
                                { x: 330, y: 95, wait: 1.1 },
                                { x: 330, y: 355, wait: 1.1 },
                                { x: 410, y: 355, wait: 0.9 },
                                { x: 410, y: 95, wait: 0.9 }
                            ]
                        },
                        {
                            id: 102, x: 620, y: 340, spawnX: 620, spawnY: 340, radius: 14, speed: 1.65,
                            angle: -Math.PI / 2, fov: Math.PI / 2.8, viewDist: 165,
                            waypoints: [
                                { x: 620, y: 360, wait: 1.0 },
                                { x: 620, y: 95, wait: 1.2 },
                                { x: 545, y: 225, wait: 1.0 }
                            ]
                        }
                    ],
                    cameras: [
                        { id: 'cam_dock', x: 455, y: 155, baseAngle: Math.PI, sweepRange: 0.65, speed: 1.1, viewDist: 155, fov: 0.55 }
                    ],
                    terminals: [
                        { x: 105, y: 58, w: 34, h: 34, terminalId: 'T1_1' }
                    ],
                    sabotageNodes: [
                        { x: 140, y: 335, w: 32, h: 32, sabotageId: 'SAB_1_1', hazardX: 355, hazardY: 225, hazardRadius: 125, hazardType: 'crane' }
                    ],
                    lasers: [],
                    items: []
                },

                corridor_u1: {
                    id: 'corridor_u1',
                    title: 'SECTOR 02: CORREDOR DE SERVIDORES',
                    subtitle: 'UNIDADES 1 Y 2 // ERRORES DE EJECUCIÓN & PULSO MÓDULO EMP',
                    visited: false,
                    envStyle: 'tech',
                    walls: [
                        { x: 0, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 220, y: 115, w: 36, h: 220, kind: 'server_rack' },
                        { x: 545, y: 115, w: 36, h: 220, kind: 'server_rack' },
                        { x: 676, y: 16, w: 18, h: 159, kind: 'pillar' },
                        { x: 676, y: 275, w: 18, h: 159, kind: 'pillar' }
                    ],
                    doors: [
                        { id: 'corridor_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'dock', spawnX: 735, spawnY: 225, reqKey: 0, label: 'DÁRSENA', orientation: 'W' },
                        { id: 'corridor_north', x: 350, y: 0, w: 100, h: 24, targetRoom: 'filtration_u1', spawnX: 400, spawnY: 390, reqKey: 0, label: 'NÚCLEO FILTRADO', orientation: 'N' },
                        { id: 'corridor_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'arena_vulcan', spawnX: 60, spawnY: 225, reqKey: 2, label: 'ARENA VULCAN [LV.2]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 103, x: 325, y: 340, spawnX: 325, spawnY: 340, radius: 14, speed: 1.65,
                            angle: -Math.PI / 2, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 315, y: 365, wait: 1.0 },
                                { x: 315, y: 85, wait: 1.0 },
                                { x: 475, y: 85, wait: 1.0 },
                                { x: 475, y: 365, wait: 1.0 }
                            ]
                        },
                        {
                            id: 104, x: 480, y: 110, spawnX: 480, spawnY: 110, radius: 14, speed: 1.65,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 480, y: 90, wait: 0.9 },
                                { x: 480, y: 360, wait: 0.9 },
                                { x: 320, y: 360, wait: 0.9 },
                                { x: 320, y: 90, wait: 0.9 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 383, y: 215, w: 34, h: 34, terminalId: 'T1_2' }
                    ],
                    sabotageNodes: [
                        { x: 135, y: 105, w: 32, h: 32, sabotageId: 'SAB_1_2', hazardX: 400, hazardY: 225, hazardRadius: 185, hazardType: 'turret' }
                    ],
                    lasers: [
                        { x1: 685, y1: 175, x2: 685, y2: 275, terminalId: 'T1_2' }
                    ],
                    items: []
                },

                filtration_u1: {
                    id: 'filtration_u1',
                    title: 'SECTOR 03: NÚCLEO DE FILTRADO CRIOGÉNICO',
                    subtitle: 'UNIDAD 2 // JERARQUÍA DE ENTEROS, CASTING EXPLÍCITO & KEYCARD 2',
                    visited: false,
                    envStyle: 'cryo',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 0, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 145, y: 85, w: 75, h: 135, kind: 'cryo_tank' },
                        { x: 310, y: 185, w: 180, h: 58, kind: 'server_rack' },
                        { x: 575, y: 85, w: 75, h: 135, kind: 'cryo_tank' }
                    ],
                    doors: [
                        { id: 'filtration_south', x: 350, y: 426, w: 100, h: 24, targetRoom: 'corridor_u1', spawnX: 400, spawnY: 50, reqKey: 0, label: 'CORREDOR CENTRAL', orientation: 'S' }
                    ],
                    guards: [
                        {
                            id: 105, x: 260, y: 110, spawnX: 260, spawnY: 110, radius: 14, speed: 1.65,
                            angle: 0, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 260, y: 115, wait: 0.9 },
                                { x: 535, y: 115, wait: 1.1 },
                                { x: 535, y: 320, wait: 0.9 },
                                { x: 260, y: 320, wait: 1.1 }
                            ]
                        }
                    ],
                    cameras: [
                        { id: 'cam_filt', x: 575, y: 220, baseAngle: Math.PI / 2, sweepRange: 0.75, speed: 1.2, viewDist: 150, fov: 0.55 }
                    ],
                    terminals: [
                        { x: 383, y: 65, w: 34, h: 34, terminalId: 'T1_3' },
                        { x: 685, y: 335, w: 34, h: 34, terminalId: 'T1_4' }
                    ],
                    sabotageNodes: [],
                    lasers: [],
                    items: [
                        { id: 'coffee_l1', x: 110, y: 340, w: 28, h: 28, type: 'coffee', name: 'EXPRESO CANTINA UTN (+50 HP)', heal: 50, taken: false }
                    ]
                },

                arena_vulcan: {
                    id: 'arena_vulcan',
                    title: 'SECTOR 04: PATIO DE ASEDIO // BOSS ARENA',
                    subtitle: 'UNIDADES 1 Y 2 // BOSS: VULCAN BYTEMASTER',
                    visited: false,
                    hasBoss: true,
                    envStyle: 'boss',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 265, y: 105, w: 34, h: 65, kind: 'pillar' },
                        { x: 265, y: 280, w: 34, h: 65, kind: 'pillar' }
                    ],
                    doors: [
                        { id: 'vulcan_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'corridor_u1', spawnX: 735, spawnY: 225, reqKey: 0, label: 'CORREDOR CENTRAL', orientation: 'W' }
                    ],
                    guards: [],
                    cameras: [],
                    terminals: [],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                }
            },
            terminals: P.nivel1 ? P.nivel1.terminals : [],
            sabotajes: P.nivel1 ? P.nivel1.sabotajes : [],
            bossBeacons: P.nivel1 ? P.nivel1.bossBeacons : []
        },

        // ---------------------------------------------------------------------
        // OPERACIÓN 02: COMPLEJO MODULAR (UNIDADES 3 Y 4)
        // ---------------------------------------------------------------------
        {
            id: 2,
            code: "OP-02",
            name: "OPERACIÓN 02: COMPLEJO MODULAR",
            shortName: "OP-02 // MODULAR",
            subtitle: "UNIDADES 3 Y 4 // SWITCH, BUCLES WHILE/FOR & DISEÑO TOP-DOWN",
            topics: "Switch fall-through, do-while, centinelas, métodos public static y pasaje por valor en Call Stack.",
            bossName: "CYBER OLYMPO",
            bossSub: "HEXÁPODO BIOMECÁNICO MODULAR // RECURSIÓN & PILA",
            bossType: "olympo",
            themeColor: "#2dd4bf",
            floorColor: 0x09191f,
            wallColor: 0x132a33,
            startRoom: "warehouse_entry",
            startPlayerX: 75,
            startPlayerY: 225,
            rooms: {
                warehouse_entry: {
                    id: 'warehouse_entry',
                    title: 'SECTOR 01: ENTRADA DEL ALMACÉN RAM',
                    subtitle: 'UNIDAD 3 // EJECUCIÓN EN CASCADA (SWITCH FALL-THROUGH)',
                    visited: true,
                    envStyle: 'dock',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 185, y: 80, w: 42, h: 130, kind: 'container_cyan' },
                        { x: 185, y: 260, w: 42, h: 125, kind: 'container_amber' },
                        { x: 460, y: 150, w: 44, h: 150, kind: 'server_rack' }
                    ],
                    doors: [
                        { id: 'entry_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'warehouse_junction', spawnX: 55, spawnY: 225, reqKey: 1, label: 'CRUCE RAM [LV.1]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 201, x: 325, y: 105, spawnX: 325, spawnY: 105, radius: 14, speed: 1.65,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 165,
                            waypoints: [
                                { x: 325, y: 95, wait: 1.0 },
                                { x: 325, y: 355, wait: 1.0 },
                                { x: 580, y: 355, wait: 1.0 },
                                { x: 580, y: 95, wait: 1.0 }
                            ]
                        }
                    ],
                    cameras: [
                        { id: 'cam_w1', x: 460, y: 150, baseAngle: Math.PI, sweepRange: 0.7, speed: 1.2, viewDist: 155, fov: 0.55 }
                    ],
                    terminals: [
                        { x: 105, y: 60, w: 34, h: 34, terminalId: 'T2_1' }
                    ],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                },

                warehouse_junction: {
                    id: 'warehouse_junction',
                    title: 'SECTOR 02: DISTRIBUIDOR CENTRAL RAM',
                    subtitle: 'UNIDADES 3 Y 4 // NODO CENTRAL & SABOTAJE CRIOGÉNICO BREAK',
                    visited: false,
                    envStyle: 'tech',
                    walls: [
                        { x: 0, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 205, y: 120, w: 34, h: 200, kind: 'server_rack' },
                        { x: 565, y: 120, w: 34, h: 200, kind: 'server_rack' },
                        { x: 666, y: 16, w: 18, h: 159, kind: 'pillar' },
                        { x: 666, y: 275, w: 18, h: 159, kind: 'pillar' }
                    ],
                    doors: [
                        { id: 'junc_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'warehouse_entry', spawnX: 735, spawnY: 225, reqKey: 0, label: 'ENTRADA RAM', orientation: 'W' },
                        { id: 'junc_north', x: 350, y: 0, w: 100, h: 24, targetRoom: 'loop_storage', spawnX: 400, spawnY: 390, reqKey: 0, label: 'DEPÓSITO BUCLES', orientation: 'N' },
                        { id: 'junc_south', x: 350, y: 426, w: 100, h: 24, targetRoom: 'modular_lab_u2', spawnX: 400, spawnY: 50, reqKey: 0, label: 'LAB MODULAR', orientation: 'S' },
                        { id: 'junc_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'arena_olympo', spawnX: 60, spawnY: 225, reqKey: 2, label: 'ARENA OLYMPO [LV.2]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 202, x: 310, y: 225, spawnX: 310, spawnY: 225, radius: 14, speed: 1.65,
                            angle: 0, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 295, y: 125, wait: 0.9 },
                                { x: 495, y: 125, wait: 0.9 },
                                { x: 495, y: 325, wait: 0.9 },
                                { x: 295, y: 325, wait: 0.9 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [],
                    sabotageNodes: [
                        { x: 125, y: 330, w: 32, h: 32, sabotageId: 'SAB_2_1', hazardX: 400, hazardY: 225, hazardRadius: 175, hazardType: 'crane' }
                    ],
                    lasers: [
                        { x1: 675, y1: 175, x2: 675, y2: 275, terminalId: 'T2_4' }
                    ],
                    items: []
                },

                loop_storage: {
                    id: 'loop_storage',
                    title: 'SECTOR 03: DEPÓSITO DE BUCLES NORTE',
                    subtitle: 'UNIDAD 3 // DO-WHILE POST-CONDICIÓN, CENTINELA & KEYCARD 2',
                    visited: false,
                    envStyle: 'cryo',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 0, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 110, y: 80, w: 110, h: 75, kind: 'container_cyan' },
                        { x: 285, y: 80, w: 110, h: 75, kind: 'container_amber' },
                        { x: 465, y: 80, w: 110, h: 75, kind: 'container_cyan' },
                        { x: 640, y: 80, w: 75, h: 155, kind: 'cryo_tank' },
                        { x: 185, y: 235, w: 135, h: 85, kind: 'server_rack' },
                        { x: 445, y: 235, w: 135, h: 85, kind: 'server_rack' }
                    ],
                    doors: [
                        { id: 'loop_south', x: 350, y: 426, w: 100, h: 24, targetRoom: 'warehouse_junction', spawnX: 400, spawnY: 50, reqKey: 0, label: 'CRUCE CENTRAL', orientation: 'S' }
                    ],
                    guards: [
                        {
                            id: 203, x: 380, y: 195, spawnX: 380, spawnY: 195, radius: 14, speed: 1.7,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 380, y: 190, wait: 0.9 },
                                { x: 605, y: 190, wait: 1.1 },
                                { x: 605, y: 365, wait: 0.9 },
                                { x: 380, y: 365, wait: 1.0 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 110, y: 245, w: 34, h: 34, terminalId: 'T2_2' },
                        { x: 675, y: 325, w: 34, h: 34, terminalId: 'T2_3' }
                    ],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                },

                modular_lab_u2: {
                    id: 'modular_lab_u2',
                    title: 'SECTOR 04: LABORATORIO MODULAR SUR',
                    subtitle: 'UNIDAD 4 // MÉTODOS PUBLIC STATIC, CALL STACK & SABOTAJE BOOLEANO',
                    visited: false,
                    envStyle: 'tech',
                    walls: [
                        { x: 0, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 180, y: 80, w: 28, h: 135, kind: 'server_rack' },
                        { x: 180, y: 260, w: 28, h: 130, kind: 'server_rack' },
                        { x: 545, y: 80, w: 28, h: 135, kind: 'server_rack' },
                        { x: 545, y: 260, w: 28, h: 130, kind: 'server_rack' }
                    ],
                    doors: [
                        { id: 'lab_north', x: 350, y: 0, w: 100, h: 24, targetRoom: 'warehouse_junction', spawnX: 400, spawnY: 390, reqKey: 0, label: 'CRUCE CENTRAL', orientation: 'N' }
                    ],
                    guards: [
                        {
                            id: 204, x: 360, y: 300, spawnX: 360, spawnY: 300, radius: 14, speed: 1.75,
                            angle: -Math.PI / 2, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 310, y: 350, wait: 0.9 },
                                { x: 470, y: 350, wait: 0.9 },
                                { x: 470, y: 170, wait: 1.1 },
                                { x: 310, y: 170, wait: 1.1 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 255, y: 95, w: 34, h: 34, terminalId: 'T2_4' },
                        { x: 465, y: 95, w: 34, h: 34, terminalId: 'T2_5' }
                    ],
                    sabotageNodes: [
                        { x: 650, y: 220, w: 32, h: 32, sabotageId: 'SAB_2_2', hazardX: 390, hazardY: 260, hazardRadius: 175, hazardType: 'turret' }
                    ],
                    lasers: [],
                    items: [
                        { id: 'coffee_l2', x: 365, y: 210, w: 28, h: 28, type: 'coffee', name: 'EXPRESO CANTINA UTN (+50 HP)', heal: 50, taken: false }
                    ]
                },

                arena_olympo: {
                    id: 'arena_olympo',
                    title: 'SECTOR 05: CÁMARA BIOMECÁNICA // BOSS ARENA',
                    subtitle: 'UNIDADES 3 Y 4 // BOSS: CYBER OLYMPO',
                    visited: false,
                    hasBoss: true,
                    envStyle: 'boss',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 270, y: 85, w: 36, h: 68, kind: 'pillar' },
                        { x: 270, y: 285, w: 36, h: 68, kind: 'pillar' }
                    ],
                    doors: [
                        { id: 'olympo_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'warehouse_junction', spawnX: 735, spawnY: 225, reqKey: 0, label: 'CRUCE CENTRAL', orientation: 'W' }
                    ],
                    guards: [],
                    cameras: [],
                    terminals: [],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                }
            },
            terminals: P.nivel2 ? P.nivel2.terminals : [],
            sabotajes: P.nivel2 ? P.nivel2.sabotajes : [],
            bossBeacons: P.nivel2 ? P.nivel2.bossBeacons : []
        },

        // ---------------------------------------------------------------------
        // OPERACIÓN 03: NÚCLEO REX PRIME (UNIDAD 5: ARREGLOS, MATRICES & BÚSQUEDA)
        // ---------------------------------------------------------------------
        {
            id: 3,
            code: "OP-03",
            name: "OPERACIÓN 03: NÚCLEO REX PRIME",
            shortName: "OP-03 // MAINFRAME",
            subtitle: "UNIDAD 5 // VECTORES 1D, STRINGS, MATRICES 2D, BÚSQUEDA BINARIA & BUBBLE SORT",
            topics: "Arreglos 1D, puntero Tope, Strings (.equals), Matrices 2D, Búsqueda Binaria y Ordenamiento Burbuja.",
            bossName: "METAL GEAR JVM-REX PRIME",
            bossSub: "TITÁN BÍPEDO NUCLEAR // BÚSQUEDA BINARIA & ESTRUCTURAS",
            bossType: "rex",
            themeColor: "#a78bfa",
            floorColor: 0x110e24,
            wallColor: 0x1e1b38,
            startRoom: "vector_vault",
            startPlayerX: 75,
            startPlayerY: 225,
            rooms: {
                vector_vault: {
                    id: 'vector_vault',
                    title: 'SECTOR 01: BÓVEDA DE VECTORES 1D',
                    subtitle: 'UNIDAD 5 // INDEXACIÓN BASE CERO & ARRAY VAULT',
                    visited: true,
                    envStyle: 'tech',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 190, y: 65, w: 36, h: 125, kind: 'server_rack' },
                        { x: 190, y: 260, w: 36, h: 125, kind: 'server_rack' },
                        { x: 480, y: 140, w: 42, h: 170, kind: 'cryo_tank' }
                    ],
                    doors: [
                        { id: 'vector_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'transit_conduit', spawnX: 55, spawnY: 225, reqKey: 1, label: 'CONDUCTO [LV.1]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 301, x: 330, y: 105, spawnX: 330, spawnY: 105, radius: 14, speed: 1.75,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 165,
                            waypoints: [
                                { x: 330, y: 85, wait: 0.9 },
                                { x: 330, y: 365, wait: 0.9 },
                                { x: 615, y: 365, wait: 1.0 },
                                { x: 615, y: 85, wait: 1.0 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 100, y: 60, w: 34, h: 34, terminalId: 'T3_1' }
                    ],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                },

                transit_conduit: {
                    id: 'transit_conduit',
                    title: 'SECTOR 02: CONDUCTO TRONCAL DEL MAINFRAME',
                    subtitle: 'UNIDAD 5 // DISTRIBUCIÓN & GRÚA DE VECTORES',
                    visited: false,
                    envStyle: 'dock',
                    walls: [
                        { x: 0, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 220, y: 115, w: 32, h: 220, kind: 'server_rack' },
                        { x: 550, y: 115, w: 32, h: 220, kind: 'server_rack' },
                        { x: 666, y: 16, w: 18, h: 159, kind: 'pillar' },
                        { x: 666, y: 275, w: 18, h: 159, kind: 'pillar' }
                    ],
                    doors: [
                        { id: 'transit_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'vector_vault', spawnX: 735, spawnY: 225, reqKey: 0, label: 'BÓVEDA VECTORES', orientation: 'W' },
                        { id: 'transit_north', x: 350, y: 0, w: 100, h: 24, targetRoom: 'string_archive', spawnX: 400, spawnY: 390, reqKey: 1, label: 'ARCHIVO STRINGS', orientation: 'N' },
                        { id: 'transit_south', x: 350, y: 426, w: 100, h: 24, targetRoom: 'matrix_center', spawnX: 400, spawnY: 50, reqKey: 1, label: 'CENTRO MATRICIAL', orientation: 'S' },
                        { id: 'transit_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'rex_core', spawnX: 60, spawnY: 225, reqKey: 2, label: 'HANGAR REX [LV.2]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 302, x: 385, y: 225, spawnX: 385, spawnY: 225, radius: 14, speed: 1.75,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 165,
                            waypoints: [
                                { x: 310, y: 115, wait: 0.9 },
                                { x: 485, y: 115, wait: 0.9 },
                                { x: 485, y: 335, wait: 0.9 },
                                { x: 310, y: 335, wait: 0.9 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [],
                    sabotageNodes: [
                        { x: 130, y: 110, w: 32, h: 32, sabotageId: 'SAB_3_1', hazardX: 395, hazardY: 225, hazardRadius: 175, hazardType: 'crane' }
                    ],
                    lasers: [
                        { x1: 675, y1: 175, x2: 675, y2: 275, terminalId: 'T3_5' }
                    ],
                    items: []
                },

                string_archive: {
                    id: 'string_archive',
                    title: 'SECTOR 03: ARCHIVO DE CADENAS NORTE',
                    subtitle: 'UNIDAD 5 // INMUTABILIDAD DE STRINGS & .EQUALS()',
                    visited: false,
                    envStyle: 'cryo',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 434, w: 350, h: 16, kind: 'perimeter' },
                        { x: 180, y: 90, w: 115, h: 115, kind: 'server_rack' },
                        { x: 485, y: 90, w: 115, h: 115, kind: 'server_rack' }
                    ],
                    doors: [
                        { id: 'str_south', x: 350, y: 426, w: 100, h: 24, targetRoom: 'transit_conduit', spawnX: 400, spawnY: 50, reqKey: 0, label: 'CONDUCTO TRONCAL', orientation: 'S' },
                        { id: 'str_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'sorting_subcore', spawnX: 55, spawnY: 225, reqKey: 2, label: 'SUBNÚCLEO ORDEN [LV.2]', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 303, x: 350, y: 160, spawnX: 350, spawnY: 160, radius: 14, speed: 1.75,
                            angle: -Math.PI / 2, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 350, y: 130, wait: 0.9 },
                                { x: 350, y: 340, wait: 0.9 },
                                { x: 645, y: 340, wait: 0.9 },
                                { x: 645, y: 130, wait: 0.9 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 373, y: 65, w: 34, h: 34, terminalId: 'T3_2' }
                    ],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                },

                matrix_center: {
                    id: 'matrix_center',
                    title: 'SECTOR 04: CENTRO MATRICIAL SUR',
                    subtitle: 'UNIDAD 5 // PISO MATRICIAL 3D (DIAGONAL f == c) & KEYCARD 2',
                    visited: false,
                    envStyle: 'tech',
                    hasMatrixFloor: true,
                    walls: [
                        { x: 0, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 450, y: 0, w: 350, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 155, y: 145, w: 95, h: 120, kind: 'cryo_tank' },
                        { x: 545, y: 145, w: 95, h: 120, kind: 'cryo_tank' }
                    ],
                    doors: [
                        { id: 'mat_north', x: 350, y: 0, w: 100, h: 24, targetRoom: 'transit_conduit', spawnX: 400, spawnY: 390, reqKey: 0, label: 'CONDUCTO TRONCAL', orientation: 'N' },
                        { id: 'mat_east', x: 774, y: 175, w: 26, h: 100, targetRoom: 'sorting_subcore', spawnX: 55, spawnY: 225, reqKey: 0, label: 'SUBNÚCLEO ORDEN', orientation: 'E' }
                    ],
                    guards: [
                        {
                            id: 304, x: 295, y: 290, spawnX: 295, spawnY: 290, radius: 14, speed: 1.75,
                            angle: 0, fov: Math.PI / 2.8, viewDist: 160,
                            waypoints: [
                                { x: 285, y: 105, wait: 0.9 },
                                { x: 510, y: 105, wait: 0.9 },
                                { x: 510, y: 310, wait: 0.9 },
                                { x: 285, y: 310, wait: 0.9 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 383, y: 350, w: 34, h: 34, terminalId: 'T3_3' }
                    ],
                    sabotageNodes: [],
                    lasers: [],
                    items: [
                        { id: 'coffee_l3', x: 95, y: 345, w: 28, h: 28, type: 'coffee', name: 'EXPRESO CANTINA UTN (+50 HP)', heal: 50, taken: false }
                    ]
                },

                sorting_subcore: {
                    id: 'sorting_subcore',
                    title: 'SECTOR 05: SUBNÚCLEO DE ORDENAMIENTO ESTE',
                    subtitle: 'UNIDAD 5 // BÚSQUEDA BINARIA & BUBBLE SORT OPTIMIZADO',
                    visited: false,
                    envStyle: 'tech',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 205, y: 80, w: 32, h: 130, kind: 'server_rack' },
                        { x: 205, y: 260, w: 32, h: 130, kind: 'server_rack' },
                        { x: 525, y: 80, w: 32, h: 130, kind: 'server_rack' },
                        { x: 525, y: 260, w: 32, h: 130, kind: 'server_rack' }
                    ],
                    doors: [
                        { id: 'sort_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'matrix_center', spawnX: 735, spawnY: 225, reqKey: 0, label: 'CENTRO MATRICIAL', orientation: 'W' }
                    ],
                    guards: [
                        {
                            id: 305, x: 365, y: 120, spawnX: 365, spawnY: 120, radius: 14, speed: 1.8,
                            angle: Math.PI / 2, fov: Math.PI / 2.8, viewDist: 165,
                            waypoints: [
                                { x: 295, y: 130, wait: 0.8 },
                                { x: 465, y: 130, wait: 0.8 },
                                { x: 465, y: 320, wait: 0.8 },
                                { x: 295, y: 320, wait: 0.8 }
                            ]
                        }
                    ],
                    cameras: [],
                    terminals: [
                        { x: 365, y: 70, w: 34, h: 34, terminalId: 'T3_4' },
                        { x: 365, y: 350, w: 34, h: 34, terminalId: 'T3_5' }
                    ],
                    sabotageNodes: [
                        { x: 645, y: 220, w: 32, h: 32, sabotageId: 'SAB_3_2', hazardX: 380, hazardY: 225, hazardRadius: 175, hazardType: 'turret' }
                    ],
                    lasers: [],
                    items: []
                },

                rex_core: {
                    id: 'rex_core',
                    title: 'SECTOR 06: HANGAR PRINCIPAL // METAL GEAR REX',
                    subtitle: 'UNIDAD 5 // BOSS FINAL: METAL GEAR JVM-REX PRIME',
                    visited: false,
                    hasBoss: true,
                    envStyle: 'boss',
                    walls: [
                        { x: 0, y: 0, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 434, w: 800, h: 16, kind: 'perimeter' },
                        { x: 0, y: 0, w: 16, h: 175, kind: 'perimeter' },
                        { x: 0, y: 275, w: 16, h: 175, kind: 'perimeter' },
                        { x: 784, y: 0, w: 16, h: 450, kind: 'perimeter' },
                        { x: 265, y: 85, w: 36, h: 68, kind: 'pillar' },
                        { x: 265, y: 285, w: 36, h: 68, kind: 'pillar' }
                    ],
                    doors: [
                        { id: 'core_west', x: 0, y: 175, w: 24, h: 100, targetRoom: 'transit_conduit', spawnX: 735, spawnY: 225, reqKey: 0, label: 'CONDUCTO TRONCAL', orientation: 'W' }
                    ],
                    guards: [],
                    cameras: [],
                    terminals: [],
                    sabotageNodes: [],
                    lasers: [],
                    items: []
                }
            },
            terminals: P.nivel3 ? P.nivel3.terminals : [],
            sabotajes: P.nivel3 ? P.nivel3.sabotajes : [],
            bossBeacons: P.nivel3 ? P.nivel3.bossBeacons : []
        }
    ];

    window.MGS3D_LEVELS = {
        CODEC_CONTACTS,
        CODEC_SCRIPTS,
        PIP_TRANSMISSIONS,
        CAMPAIGN_LEVELS
    };
})();
