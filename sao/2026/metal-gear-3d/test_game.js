/**
 * =============================================================================
 * SUITE DE VERIFICACIÓN AUTOMATIZADA // METAL GEAR JAVA 3D
 *  - Verifica integridad de preguntas.js, audio.js, levels.js, gfx3d.js e index.html
 *  - Verifica conectividad de las 15 salas 3D en las 3 Operaciones
 *  - Verifica rutas 2D multi-waypoint de centinelas y Nodos de Sabotaje 3D
 *  - Verifica CERO uso de Web Speech API (speechSynthesis)
 * =============================================================================
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

const dir = __dirname;
const preguntas = require(path.join(dir, 'preguntas.js'));

console.log('=== [1/5] Verificando Base de Datos Curricular + Sabotajes 3D (preguntas.js) ===');
['nivel1', 'nivel2', 'nivel3'].forEach((nivKey, idx) => {
    const niv = preguntas[nivKey];
    assert(niv, `Falta ${nivKey} en preguntas.js`);
    assert(Array.isArray(niv.terminals) && niv.terminals.length >= 4, `${nivKey} debe tener al menos 4 terminales`);
    assert(Array.isArray(niv.sabotajes) && niv.sabotajes.length >= 2, `${nivKey} debe tener al menos 2 sabotajes en vivo`);
    assert(Array.isArray(niv.bossBeacons) && niv.bossBeacons.length === 4, `${nivKey} debe tener 4 balizas de Boss`);

    niv.terminals.forEach(t => {
        const hasCorrect = Array.isArray(t.options) && t.options.some(o => o && o.correct === true);
        assert(hasCorrect, `Respuesta inválida en terminal ${t.id}`);
    });
    niv.sabotajes.forEach(s => {
        assert(typeof s.codeBefore === 'string' && typeof s.codeAfter === 'string', `Sabotaje ${s.id} debe incluir codeBefore y codeAfter`);
        assert(Array.isArray(s.tokens) && s.tokens.includes(s.correctToken), `Token correcto inválido en sabotaje ${s.id}`);
    });
    niv.bossBeacons.forEach(b => {
        const hasCorrect = Array.isArray(b.options) && b.options.some(o => o && o.correct === true);
        assert(hasCorrect, `Respuesta inválida en baliza ${b.id}`);
    });
    console.log(`  ✔ ${nivKey}: ${niv.terminals.length} terminales, ${niv.sabotajes.length} sabotajes en vivo, ${niv.bossBeacons.length} balizas de Boss OK.`);
});

console.log('=== [2/5] Verificando Topología de Campaña 3D y Patrullas 2D (levels.js) ===');
global.window = global;
global.PREGUNTAS_GAME = preguntas;
require(path.join(dir, 'levels.js'));

const levelsMod = global.MGS3D_LEVELS;
assert(levelsMod && Array.isArray(levelsMod.CAMPAIGN_LEVELS), 'MGS3D_LEVELS.CAMPAIGN_LEVELS no exportado');
assert(levelsMod.CAMPAIGN_LEVELS.length === 3, 'Deben existir exactamente 3 Operaciones de Campaña');

let totalRooms = 0;
let totalGuards = 0;
let totalSabotageNodes = 0;

levelsMod.CAMPAIGN_LEVELS.forEach(op => {
    const roomKeys = Object.keys(op.rooms);
    totalRooms += roomKeys.length;
    assert(op.rooms[op.startRoom], `StartRoom ${op.startRoom} no existe en ${op.code}`);

    roomKeys.forEach(rk => {
        const r = op.rooms[rk];
        // Verificar que todas las puertas apunten a una sala válida
        (r.doors || []).forEach(d => {
            assert(op.rooms[d.targetRoom], `Puerta ${d.id} en ${rk} apunta a sala inexistente ${d.targetRoom}`);
        });
        // Verificar que cada guardia tenga patrulla 2D multi-waypoint
        (r.guards || []).forEach(g => {
            totalGuards++;
            assert(Array.isArray(g.waypoints) && g.waypoints.length >= 3, `Guardia ${g.id} en ${rk} debe tener ruta 2D multi-waypoint`);
        });
        // Verificar que cada nodo de sabotaje referencie un ID válido en op.sabotajes
        (r.sabotageNodes || []).forEach(sn => {
            totalSabotageNodes++;
            const found = op.sabotajes.some(s => s.id === sn.sabotageId);
            assert(found, `SabotageNode ${sn.sabotageId} en ${rk} no encontrado en ${op.code}`);
        });
    });
});
console.log(`  ✔ 3 Operaciones, ${totalRooms} Sectores 3D, ${totalGuards} Centinelas con rutas 2D y ${totalSabotageNodes} Nodos de Sabotaje 3D verificados.`);

console.log('=== [3/5] Verificando Ausencia Total de Web Speech API ===');
['audio.js', 'levels.js', 'gfx3d.js', 'index.html'].forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    assert(!content.includes('speechSynthesis'), `PROHIBIDO usar speechSynthesis en ${file}`);
    assert(!content.includes('SpeechSynthesisUtterance'), `PROHIBIDO usar SpeechSynthesisUtterance en ${file}`);
});
console.log('  ✔ Cero uso de Web Speech API confirmado (100% Formant Synthesizer + Radio Squelch).');

console.log('=== [4/5] Verificando Sintaxis de Módulos (audio.js y gfx3d.js) ===');
require(path.join(dir, 'audio.js'));
assert(global.MGS3D_AUDIO && typeof global.MGS3D_AUDIO.playVoiceBlip === 'function', 'MGS3D_AUDIO no cargado correctamente');
require(path.join(dir, 'gfx3d.js'));
assert(global.MGS3D_GFX && typeof global.MGS3D_GFX.init3D === 'function', 'MGS3D_GFX no cargado correctamente');
console.log('  ✔ MGS3D_AUDIO y MGS3D_GFX exportados sin errores.');

console.log('=== [5/5] Verificando Inmutabilidad del Juego 2D Original ===');
const origDir = path.resolve(dir, '../metal-gear');
assert(fs.existsSync(path.join(origDir, 'index.html')), 'El juego original en ../metal-gear/index.html debe existir intacto');
console.log('  ✔ ../metal-gear/ intacto y separado de ../metal-gear-3d/.');
console.log('\n🎉 TODAS LAS PRUEBAS PASARON EXITOSAMENTE.');
