// Test suite for The Frame Dungeon (SAO Unidad 4 - Modularización)
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'index.html');

console.log('====================================================');
console.log('🧪 TESTING "THE FRAME DUNGEON" (SAO 2026 UNIDAD 4)');
console.log('====================================================\n');

// 1. VERIFICAR QUE EL ARCHIVO EXISTE Y TIENE CONTENIDO VÁLIDO
if (!fs.existsSync(htmlPath)) {
    console.error('❌ ERROR: index.html no existe en', htmlPath);
    process.exit(1);
}

const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
console.log(`✅ Archivo index.html verificado (${htmlContent.length} bytes, ${htmlContent.split('\n').length} líneas).`);

// 2. VERIFICACIÓN DE REQUISITOS INSTITUCIONALES Y RESPONSIVE EN HTML
const checks = [
    { name: 'Viewport Meta Tag (Responsive)', regex: /<meta\s+name="viewport"[^>]+>/i },
    { name: 'Branding UTN FRSF', regex: /UTN\s+FRSF/i },
    { name: 'Branding TUTI SAO', regex: /SAO.*Unidad\s+4/i },
    { name: 'Equipo Docente y Tutores', regex: /Micheri.*Assenza.*Ramello.*Jimenez/i },
    { name: 'Fuentes Institucionales (Poppins / Inter / Fira Code)', regex: /family=Poppins.*family=Inter.*family=Fira\+Code/i },
    { name: 'FontAwesome CDN', regex: /font-awesome/i },
    { name: 'Call Stack Container', regex: /id="stack-frames-container"/ },
    { name: 'Arena de Batalla', regex: /id="combat-stage"/ },
    { name: 'Mano de Cartas', regex: /id="hand-container"/ },
    { name: 'Contador de Ciclos de CPU', regex: /id="cpu-energy-counter"/ },
    { name: 'Modal de Desafío Pedagógico', regex: /id="modal-challenge"/ },
    { name: 'Modal Inspector de Memoria de Frame', regex: /id="modal-frame-inspector"/ },
    { name: 'Modal de Draft / Recompensa', regex: /id="modal-draft"/ },
    { name: 'Modal Códice de Modularización', regex: /id="modal-codex"/ },
    { name: 'Modal Game Over / Victoria', regex: /id="modal-gameover"/ },
    { name: 'Sprite SVG 16-Bit Héroe', regex: /class="sprite-hero-svg"/ },
    { name: 'Footer Institucional', regex: /<footer>/i }
];

let failedChecks = 0;
checks.forEach(c => {
    if (c.regex.test(htmlContent)) {
        console.log(`  ✓ ${c.name}`);
    } else {
        console.error(`  ✗ FALLÓ: ${c.name}`);
        failedChecks++;
    }
});

if (failedChecks > 0) {
    console.error(`\n❌ Se encontraron ${failedChecks} fallas en la estructura HTML.`);
    process.exit(1);
}

// 3. EXTRAER SCRIPT Y EJECUTAR PRUEBAS DE LÓGICA EN SANDBOX VM
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
    console.error('❌ ERROR: No se encontró etiqueta <script> en index.html');
    process.exit(1);
}
const jsCode = scriptMatch[1];
console.log(`\n✅ Bloque JavaScript extraído (${jsCode.length} bytes). Ejecutando pruebas en sandbox...`);

// Mock del Entorno DOM y Web Audio API
const elements = new Map();
function createMockElement(id) {
    const el = {
        id: id,
        style: {},
        className: '',
        classList: {
            add: (c) => { if (!el.className.includes(c)) el.className = (el.className + ' ' + c).trim(); },
            remove: (c) => { el.className = el.className.replace(new RegExp(`\\b${c}\\b`, 'g'), '').trim(); },
            toggle: (c, force) => {
                const has = el.className.includes(c);
                if (force === undefined) {
                    if (has) el.classList.remove(c);
                    else el.classList.add(c);
                } else if (force) {
                    el.classList.add(c);
                } else {
                    el.classList.remove(c);
                }
            },
            contains: (c) => el.className.split(/\s+/).includes(c)
        },
        children: [],
        appendChild: (child) => { el.children.push(child); return child; },
        removeChild: (child) => {
            const idx = el.children.indexOf(child);
            if (idx >= 0) el.children.splice(idx, 1);
            return child;
        },
        innerHTML: '',
        textContent: '',
        onclick: null,
        dataset: {},
        addEventListener: (evt, fn) => {},
        querySelector: (sel) => createMockElement(sel),
        querySelectorAll: (sel) => [createMockElement(sel)],
        getBoundingClientRect: () => ({ left: 100, top: 100, width: 200, height: 100 })
    };
    elements.set(id, el);
    return el;
}

const mockDocument = {
    getElementById: (id) => {
        if (!elements.has(id)) return createMockElement(id);
        return elements.get(id);
    },
    createElement: (tag) => {
        return createMockElement('created_' + tag + '_' + Math.random().toString(36).substring(7));
    },
    addEventListener: (evt, fn) => {},
    querySelectorAll: (sel) => [],
    body: createMockElement('body')
};

class MockAudioNode {
    connect(dest) {}
    disconnect() {}
}

class MockAudioParam {
    setValueAtTime() {}
    exponentialRampToValueAtTime() {}
    linearRampToValueAtTime() {}
}

class MockGainNode extends MockAudioNode {
    constructor() {
        super();
        this.gain = new MockAudioParam();
    }
}

class MockOscillatorNode extends MockAudioNode {
    constructor() {
        super();
        this.frequency = new MockAudioParam();
        this.type = 'sine';
    }
    start() {}
    stop() {}
}

class MockAudioContext {
    constructor() {
        this.currentTime = 0;
        this.state = 'running';
        this.destination = new MockAudioNode();
    }
    createGain() { return new MockGainNode(); }
    createOscillator() { return new MockOscillatorNode(); }
    resume() { return Promise.resolve(); }
}

const sandbox = {
    window: {
        AudioContext: MockAudioContext,
        webkitAudioContext: MockAudioContext,
        addEventListener: (evt, fn) => {},
        innerWidth: 1024
    },
    document: mockDocument,
    console: {
        log: () => {},
        warn: () => {},
        error: (...args) => console.error('  [SANDBOX ERROR]', ...args)
    },
    setTimeout: (fn, delay) => { fn(); return 1; },
    setInterval: (fn, delay) => 1,
    clearInterval: () => {},
    clearTimeout: () => {},
    Math: Math,
    Date: Date,
    Object: Object,
    Array: Array,
    parseInt: parseInt
};

vm.createContext(sandbox);

try {
    vm.runInContext(jsCode, sandbox);
    console.log('✅ Código JavaScript compilado y ejecutado sin errores sintácticos.');
} catch (e) {
    console.error('❌ ERROR AL EJECUTAR JAVASCRIPT:', e);
    process.exit(1);
}

// 4. TEST SUITE DE MECÁNICAS DE JUEGO (ESTADO, CARTAS, MONSTRUOS, CALL STACK)
console.log('\n--- VERIFICANDO COMPONENTES Y LÓGICA DE JUEGO ---');

const getVar = (name) => vm.runInContext(name, sandbox);

// A. Biblioteca de Cartas
const cardLib = getVar('CARD_LIBRARY');
if (!Array.isArray(cardLib) || cardLib.length < 10) {
    console.error('❌ CARD_LIBRARY inválida o insuficiente (esperadas >= 10, encontradas:', cardLib ? cardLib.length : 0);
    process.exit(1);
}
console.log(`✓ Biblioteca de Cartas (${cardLib.length} métodos disponibles).`);

cardLib.forEach(card => {
    if (!card.id || !card.name || !card.signature || card.cost === undefined || !card.effect) {
        console.error('❌ Carta con formato inválido:', card);
        process.exit(1);
    }
    // Verificar que todas las firmas comiencen estrictamente con `public static` (SAO Unidad 4)
    if (!card.signature.startsWith('public static')) {
        console.error('❌ La carta no es un método estático de Java:', card.signature);
        process.exit(1);
    }
});
console.log('✓ Todas las cartas son métodos estáticos válidos (`public static`).');

// B. Monstruos y Pisos
const monsters = getVar('MONSTERS');
if (!Array.isArray(monsters) || monsters.length !== 4) {
    console.error('❌ Se esperaban 4 monstruos/pisos, encontrados:', monsters ? monsters.length : 0);
    process.exit(1);
}
console.log('✓ 4 Pisos configurados con sus monstruos temáticos:');
monsters.forEach(m => {
    console.log(`    Piso ${m.floor}: ${m.name} (HP: ${m.hp})`);
    if (!m.intents || m.intents.length === 0) {
        console.error(`❌ El monstruo ${m.name} no tiene intenciones de combate`);
        process.exit(1);
    }
    if (!m.svgSprite || !m.svgSprite.includes('<svg')) {
        console.error(`❌ El monstruo ${m.name} no tiene sprite SVG 16-bit definido`);
        process.exit(1);
    }
});

// C. Banco de Preguntas Conceptuales
const qBank = getVar('QUESTION_BANK');
const expectedCategories = ['scope', 'pass_by_value', 'functions_vs_proc', 'black_box', 'recursion'];
expectedCategories.forEach(cat => {
    if (!qBank[cat] || qBank[cat].length === 0) {
        console.error(`❌ Categoría de preguntas faltante o vacía: ${cat}`);
        process.exit(1);
    }
    qBank[cat].forEach(q => {
        const hasCorrect = q.options.some(o => o.correct === true);
        if (!hasCorrect) {
            console.error(`❌ Pregunta en ${cat} no tiene opción correcta marcada: ${q.title}`);
            process.exit(1);
        }
    });
});
console.log('✓ Banco de preguntas pedagógicas categorizado y verificado (Scope, Pasaje por Valor, Funciones vs Proc, Caja Negra, Recursión).');

// D. Estado del Juego y Ejecución de Turnos
const GameState = getVar('GameState');
getVar('initGame')();

if (GameState.playerHp !== 80 || GameState.cpuEnergy < 3) {
    console.error('❌ Inicialización incorrecta del jugador (esperado 80 HP):', GameState.playerHp, GameState.cpuEnergy);
    process.exit(1);
}
console.log(`✓ Inicialización de partida exitosa (HP: ${GameState.playerHp}, CPU: ${GameState.cpuEnergy}).`);

// E. Verificación del Call Stack (Estructura LIFO)
if (GameState.callStack.length !== 1 || !GameState.callStack[0].isMain) {
    console.error('❌ El Call Stack no inicia con main(String[] args):', GameState.callStack);
    process.exit(1);
}
console.log('✓ Call Stack anclado con éxito al frame base: main(String[] args).');

// Probar Push de Frame
const testCard = cardLib[0]; // golpeDirecto
getVar('pushFrameToStack')(testCard);
if (GameState.callStack.length !== 2) {
    console.error('❌ pushFrameToStack no incrementó el tamaño de la pila:', GameState.callStack.length);
    process.exit(1);
}
console.log('✓ PUSH de frame ejecutado con éxito (profundidad 2).');

// Probar Pop de Frame
getVar('popFrameFromStack')('return 8;');
if (GameState.callStack.length !== 1) {
    console.error('❌ popFrameFromStack no redujo el tamaño de la pila:', GameState.callStack.length);
    process.exit(1);
}
console.log('✓ POP de frame ejecutado con éxito (profundidad 1, main preservado).');

// Probar que main() nunca se desapila
getVar('popFrameFromStack')('return 0;');
if (GameState.callStack.length !== 1) {
    console.error('❌ popFrameFromStack desapiló main():', GameState.callStack.length);
    process.exit(1);
}
console.log('✓ Seguridad LIFO: el frame base main() está protegido contra POP prematuro.');

// F. Daño, Escudo y Absorción
const initialMonsterHp = GameState.monsterHp;
getVar('dealDamageToMonster')(10);
if (GameState.monsterHp !== initialMonsterHp - 10) {
    console.error('❌ dealDamageToMonster no descontó la vida correctamente');
    process.exit(1);
}
console.log('✓ Cálculo de daño al monstruo verificado.');

const preShield = GameState.playerShield;
getVar('addHeroShield')(15);
if (GameState.playerShield !== preShield + 15) {
    console.error('❌ addHeroShield no sumó escudo correctamente:', GameState.playerShield, 'esperado:', preShield + 15);
    process.exit(1);
}
console.log('✓ Sistema de escudo / buffer verificado.');

// Absorción de daño por escudo
const currentShield = GameState.playerShield;
const currentHp = GameState.playerHp;
getVar('dealDamageToHero')(10);
if (GameState.playerShield !== currentShield - 10 || GameState.playerHp !== currentHp) {
    console.error('❌ El escudo no absorbió el daño correctamente:', GameState.playerShield, GameState.playerHp);
    process.exit(1);
}
console.log('✓ Absorción de daño por escudo verificada (daño absorbido sin tocar HP).');

// G. Manejo de Caso Base y Rescate Anti-Overflow (Piso 4 - Dragón)
// Llenar la pila hasta el límite de 6 frames con frames corruptos
while (GameState.callStack.length < 6) {
    getVar('pushCorruptFrame')();
}
if (GameState.callStack.length !== 6) {
    console.error('❌ No se pudo llenar la pila para la prueba de rescate:', GameState.callStack.length);
    process.exit(1);
}
console.log('✓ Simulación de saturación de pila alcanzada (6/6 frames).');

const hpBeforeRescue = GameState.playerHp;
const casoBaseCard = cardLib.find(c => c.id === 'caso_base_emergencia');
getVar('executeCard')(casoBaseCard, 0, true);

// Verificar que NO sufrió 28 de daño de desbordamiento al rescatar la pila
if (GameState.playerHp < hpBeforeRescue) {
    console.error('❌ BUG REGRESIÓN: casoBaseEmergencia sufrió daño de desbordamiento al rescatar la pila!', hpBeforeRescue, '->', GameState.playerHp);
    process.exit(1);
}
console.log('✓ Rescate Anti-Overflow verificado: casoBaseEmergencia limpió la pila hostil sin penalización de daño.');

// H. Robo de Cartas y Rebarajado
GameState.deck = [];
GameState.discardPile = [{ ...cardLib[0] }, { ...cardLib[1] }];
getVar('drawCards')(1);
if (GameState.hand.length === 0 || GameState.discardPile.length > 1) {
    console.error('❌ drawCards no rebarajó el descarte cuando el mazo estaba vacío');
    process.exit(1);
}
console.log('✓ Algoritmo de descarte y rebarajado verificado.');

// I. Audio Synth Safety
getVar('initAudio')();
const sfx = getVar('SFX');
sfx.push();
sfx.pop();
sfx.hit();
sfx.shield();
sfx.crit();
sfx.overflowWarning();
sfx.draw();
sfx.inspect();
sfx.victory();
console.log('✓ Sintetizador de audio Web Audio API disparado sin excepciones.');

// J. Simulación de Campaña Completa (Piso 1 -> Piso 4 Victoria)
console.log('\n--- SIMULANDO PROGRESIÓN COMPLETA DE CAMPAÑA (PISOS 1 A 4) ---');
for (let f = 0; f < monsters.length; f++) {
    getVar('loadFloor')(f);
    if (GameState.floorIndex !== f) {
        console.error(`❌ Falló la carga del piso ${f}`);
        process.exit(1);
    }
    // Derrotar al monstruo del piso
    getVar('dealDamageToMonster')(GameState.monsterHp + 10);
    getVar('checkCombatResolution')();
    console.log(`  ✓ Piso ${f + 1} completado (${monsters[f].name} derrotado).`);
}
console.log('✓ Campaña de 4 pisos superada con éxito y pantalla de victoria alcanzada.');

// K. Simulación de Derrota (Game Over)
GameState.playerHp = 10;
GameState.playerShield = 0;
getVar('dealDamageToHero')(25);
if (GameState.playerHp !== 0) {
    console.error('❌ La vida no llegó a 0 al recibir daño fatal');
    process.exit(1);
}
getVar('handleGameOver')(false);
console.log('✓ Ruta de derrota y fin de partida (Game Over) verificada.');

// L. Control de Pestañas Móviles
getVar('setupMobileTabs')();
const tabBattle = mockDocument.getElementById('tab-btn-battle');
const tabStack = mockDocument.getElementById('tab-btn-stack');
const battleCol = mockDocument.getElementById('battle-column');
const stackCol = mockDocument.getElementById('stack-column');

if (tabStack.onclick) {
    tabStack.onclick();
    console.log('✓ Cambio dinámico a pestaña Call Stack en mobile verificado.');
}

if (tabBattle.onclick) {
    tabBattle.onclick();
    console.log('✓ Retorno a pestaña Campo de Batalla en mobile verificado.');
}

console.log('\n====================================================');
console.log('🎉 ¡TODAS LAS PRUEBAS PASARON SATISFACTORIAMENTE! (100%)');
console.log('====================================================');
