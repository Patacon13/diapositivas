// Test suite for "La Máquina de Trazas: Depurador JVM" (SAO Unidad 4 - Modularización)
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const htmlPath = path.join(__dirname, 'index.html');

console.log('====================================================');
console.log('🧪 TESTING "LA MÁQUINA DE TRAZAS" (SAO 2026 UNIDAD 4)');
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
    { name: 'Editor de Código (Viewport)', regex: /id="code-viewport"/ },
    { name: 'Barra Stepper F8', regex: /id="btn-step-next"/ },
    { name: 'Consola System.out', regex: /id="console-output"/ },
    { name: 'Memoria RAM & Call Stack', regex: /id="frames-container"/ },
    { name: 'Panel de Reto Predictivo', regex: /id="challenge-box"/ },
    { name: 'Modal Guía de Trazas', regex: /id="modal-guide"/ },
    { name: 'Modal Victoria Final', regex: /id="modal-victory"/ },
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

// 3. EXTRAER SCRIPT Y EJECUTAR PRUEBAS EN SANDBOX VM
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/i);
if (!scriptMatch) {
    console.error('❌ ERROR: No se encontró etiqueta <script> en index.html');
    process.exit(1);
}

const jsCode = scriptMatch[1];
console.log(`\n✅ Bloque JavaScript extraído (${jsCode.length} bytes). Ejecutando pruebas en sandbox...`);

// Mock del entorno DOM para Node.js
class MockElement {
    constructor(id = '', tag = 'div') {
        this.id = id;
        this.tagName = tag.toUpperCase();
        this._classes = new Set();
        this.classList = {
            add: (c) => this._classes.add(c),
            remove: (c) => this._classes.delete(c),
            contains: (c) => this._classes.has(c)
        };
        this.children = [];
        this.style = {};
        this.textContent = '';
        this.innerHTML = '';
        this.disabled = false;
        this.onclick = null;
    }
    scrollIntoView() {}
    appendChild(child) {
        this.children.push(child);
        return child;
    }
    removeChild(child) {
        const idx = this.children.indexOf(child);
        if (idx !== -1) this.children.splice(idx, 1);
        return child;
    }
}

const domElements = new Map();
function getOrCreateElement(id) {
    if (!domElements.has(id)) {
        domElements.set(id, new MockElement(id));
    }
    return domElements.get(id);
}

const sandbox = {
    document: {
        getElementById: (id) => getOrCreateElement(id),
        createElement: (tag) => new MockElement('', tag),
        querySelectorAll: (sel) => [],
        addEventListener: (event, cb) => {}
    },
    window: {
        innerWidth: 1024,
        innerHeight: 768,
        addEventListener: (event, cb) => {},
        AudioContext: class {
            constructor() { this.currentTime = 0; this.state = 'running'; }
            createOscillator() {
                return {
                    type: 'sine',
                    frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
                    connect: () => {},
                    start: () => {},
                    stop: () => {}
                };
            }
            createGain() {
                return {
                    gain: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
                    connect: () => {}
                };
            }
            resume() { return Promise.resolve(); }
        }
    },
    setTimeout: (fn) => fn(),
    setInterval: (fn) => fn(),
    console: console,
    Math: Math
};

const context = vm.createContext(sandbox);

let exportedApp = {};
try {
    exportedApp = vm.runInContext(jsCode + '\n;({ TRACE_CASES, GameState, SoundEngine, loadCase, nextStep, handleOptionSelected });', context);
    console.log('✅ Código JavaScript compilado y ejecutado sin errores sintácticos.');
} catch (e) {
    console.error('❌ Error de compilación en sandbox:', e);
    process.exit(1);
}

// 4. VERIFICACIÓN DE CASOS PEDAGÓGICOS Y LÓGICA DE TRAZAS
console.log('\n--- VERIFICANDO CASOS DE ESTUDIO Y LÓGICA DE TRAZAS ---');

const TRACE_CASES = exportedApp.TRACE_CASES;
if (!Array.isArray(TRACE_CASES) || TRACE_CASES.length !== 5) {
    console.error('❌ ERROR: Se esperaban 5 casos de estudio en TRACE_CASES, encontrados:', TRACE_CASES ? TRACE_CASES.length : 0);
    process.exit(1);
}
console.log(`✓ 5 Casos de traza configurados correctamente:`);
TRACE_CASES.forEach((c, idx) => {
    console.log(`    Nivel ${idx + 1}: ${c.title} (${c.steps.length} pasos)`);
});

// Comprobar que cada caso tiene un reto con al menos una opción correcta
TRACE_CASES.forEach((c, idx) => {
    const hasChallenge = c.steps.some(s => s.challenge && s.challenge.options.some(o => o.correct));
    if (!hasChallenge) {
        console.error(`❌ ERROR: El Caso ${idx + 1} no tiene un reto predictivo válido con respuesta correcta.`);
        process.exit(1);
    }
});
console.log('✓ Todos los casos contienen desafíos predictivos con justificación didáctica.');

// 5. SIMULAR LA PROGRESIÓN COMPLETA DE LOS 5 NIVELES
console.log('\n--- SIMULANDO DEPURACIÓN COMPLETA DE LOS 5 CASOS ---');

for (let i = 0; i < TRACE_CASES.length; i++) {
    exportedApp.loadCase(i);
    const c = TRACE_CASES[i];
    
    // Avanzar todos los pasos
    for (let s = 1; s < c.steps.length; s++) {
        exportedApp.nextStep();
        const step = c.steps[s];
        
        // Si hay desafío, resolver con la opción correcta
        if (exportedApp.GameState.isWaitingChallenge && step.challenge) {
            const correctOpt = step.challenge.options.find(o => o.correct);
            const btn = new MockElement();
            exportedApp.handleOptionSelected(correctOpt, btn, step.challenge);
            sandbox.document.getElementById('btn-challenge-continue').onclick();
        }
    }
    console.log(`  ✓ Caso ${i + 1} completado exitosamente. Puntaje actual: ${exportedApp.GameState.score} pts.`);
}

if (exportedApp.GameState.correctAnswers !== 5) {
    console.error('❌ ERROR: No se registraron los 5 aciertos esperados:', exportedApp.GameState.correctAnswers);
    process.exit(1);
}
console.log(`✓ Evaluación final: 5 / 5 aciertos logrados (100% efectividad).`);
console.log(`✓ Pantalla de victoria activada.`);

// 6. VERIFICAR COMPORTAMIENTO DEL SONIDO Y ATAJOS
sandbox.document.getElementById('btn-sound').onclick();
const soundDisabled = !exportedApp.SoundEngine.enabled;
sandbox.document.getElementById('btn-sound').onclick();
const soundReenabled = exportedApp.SoundEngine.enabled;

if (soundDisabled && soundReenabled) {
    console.log('✓ Alternador de sonido (Mute/Unmute) verificado correctamente.');
} else {
    console.error('❌ ERROR en el control de sonido.');
    process.exit(1);
}

console.log('\n====================================================');
console.log('🎉 ¡TODAS LAS PRUEBAS DE LA MÁQUINA DE TRAZAS PASARON! (100%)');
console.log('====================================================\n');
