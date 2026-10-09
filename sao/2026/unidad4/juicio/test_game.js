/**
 * Test Suite de Validación para Ace Coder: El Juicio al Programador (MVP)
 * SAO 2026 - UTN FRSF
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log("====================================================");
console.log("🧪 TESTING 'ACE CODER: EL JUICIO' (SAO 2026 UNIDAD 4)");
console.log("====================================================");

const indexPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error("❌ ERROR CRÍTICO: No se encontró index.html");
  process.exit(1);
}

const htmlContent = fs.readFileSync(indexPath, 'utf-8');
console.log(`✅ Archivo index.html verificado (${htmlContent.length} bytes, ${htmlContent.split('\n').length} líneas).`);

// 1. Verificación de etiquetas y elementos clave
const requiredStrings = [
  'viewport',
  'UTN FRSF',
  'ACE CODER: EL JUICIO',
  'Press Start 2P',
  'Fira Code',
  'Poppins',
  'Inter',
  'id="court-app"',
  'id="splash-objection"',
  'id="splash-holdit"',
  'id="modal-evidence"',
  'id="modal-code"',
  'id="modal-verdict"',
  'Art. 42: Pasaje por Valor'
];

requiredStrings.forEach(s => {
  if (htmlContent.includes(s)) {
    console.log(`  ✓ Encontrado: "${s}"`);
  } else {
    console.error(`  ❌ Falta elemento crítico: "${s}"`);
    process.exit(1);
  }
});

// 2. Extraer bloque script y verificar sintaxis y datos
const scriptMatch = htmlContent.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error("❌ ERROR: No se encontró la etiqueta <script> en el HTML.");
  process.exit(1);
}

const scriptCode = scriptMatch[1];
console.log(`✅ Bloque JavaScript extraído (${scriptCode.length} bytes). Analizando lógica de casos...`);

// Mock de DOM y Web Audio para ejecutar en VM Node.js
const domMock = {
  window: {
    addEventListener: () => {},
    innerWidth: 1024,
    innerHeight: 768
  },
  document: {
    getElementById: (id) => ({
      id,
      addEventListener: () => {},
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      style: {},
      innerHTML: '',
      textContent: '',
      querySelectorAll: () => [],
      appendChild: () => {}
    }),
    createElement: (tag) => ({
      tag,
      className: '',
      innerHTML: '',
      addEventListener: () => {},
      querySelectorAll: () => []
    })
  },
  console
};

const sandbox = {
  ...domMock,
  AudioContext: class {
    constructor() { this.state = 'running'; this.currentTime = 0; }
    createOscillator() {
      return {
        type: 'sine',
        frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {}, linearRampToValueAtTime: () => {} },
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
  }
};

try {
  vm.createContext(sandbox);
  vm.runInContext(scriptCode, sandbox);
  console.log("✅ Código JavaScript compilado y analizado en sandbox sin errores sintácticos.");
} catch (e) {
  console.error("❌ ERROR al ejecutar script en sandbox:", e);
  process.exit(1);
}

// 3. Inspeccionar estructura de COURT_CASES
const courtCases = (sandbox.window && sandbox.window.COURT_CASES) || sandbox.COURT_CASES;
if (!courtCases || !Array.isArray(courtCases) || courtCases.length < 3) {
  console.error("❌ ERROR: COURT_CASES debe contener al menos 3 casos de estudio.");
  process.exit(1);
}

console.log(`\n--- VERIFICANDO LOS ${courtCases.length} CASOS DE ESTUDIO PEDAGÓGICOS ---`);
courtCases.forEach((c, idx) => {
  console.log(`✓ Caso ${c.id}: ${c.title}`);
  console.log(`    - Archivo: ${c.codeFilename}`);
  console.log(`    - Líneas de código: ${c.codeSnippet.length}`);
  console.log(`    - Evidencias: ${c.evidenceList.length} (${c.evidenceList.map(e => e.name).join(', ')})`);
  console.log(`    - Frases de fiscalía: ${c.prosecutionStatements.length}`);
  console.log(`    - Falacia en frase índice: ${c.correctStatementIndex} ("${c.prosecutionStatements[c.correctStatementIndex].text}")`);
  console.log(`    - Evidencia esperada: ${c.correctEvidenceId}`);
  
  if (!c.validEvidenceIds || !Array.isArray(c.validEvidenceIds) || c.validEvidenceIds.length === 0) {
    console.error(`❌ ERROR: Caso ${c.id} debe definir validEvidenceIds.`);
    process.exit(1);
  }
  console.log(`    - Evidencias que otorgan victoria: [${c.validEvidenceIds.join(', ')}]`);
});

console.log("\n====================================================");
console.log("🎉 ¡TODAS LAS PRUEBAS DE ACE CODER PASARON CON ÉXITO! (100%)");
console.log("====================================================");
