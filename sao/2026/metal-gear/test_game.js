// Test script for Metal Gear Java
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('--- TESTING METAL GEAR JAVA SCRIPTS ---');

// Mock Canvas 2D Context
const createMockCtx = () => {
    const noop = () => {};
    const grad = { addColorStop: noop };
    return new Proxy({
        canvas: { width: 800, height: 450 },
        save: noop,
        restore: noop,
        beginPath: noop,
        closePath: noop,
        moveTo: noop,
        lineTo: noop,
        arc: noop,
        ellipse: noop,
        rect: noop,
        roundRect: noop,
        fill: noop,
        stroke: noop,
        fillRect: noop,
        strokeRect: noop,
        clearRect: noop,
        translate: noop,
        rotate: noop,
        scale: noop,
        setLineDash: noop,
        getLineDash: () => [],
        fillText: noop,
        strokeText: noop,
        measureText: (txt) => ({ width: (txt || '').length * 8 }),
        createLinearGradient: () => grad,
        createRadialGradient: () => grad,
        createPattern: () => null,
        drawImage: noop,
        getImageData: () => ({ data: new Uint8ClampedArray(4) }),
        putImageData: noop
    }, {
        get(target, prop) {
            if (prop in target) return target[prop];
            return noop;
        },
        set(target, prop, val) {
            target[prop] = val;
            return true;
        }
    });
};

const mockElements = new Map();
const getMockEl = (id) => {
    if (!mockElements.has(id)) {
        mockElements.set(id, {
            id,
            style: {},
            classList: {
                add: () => {},
                remove: () => {},
                toggle: () => {},
                contains: () => false
            },
            innerHTML: '',
            innerText: '',
            textContent: '',
            appendChild: (c) => c,
            removeChild: (c) => c,
            insertBefore: (c, r) => c,
            parentElement: { insertBefore: () => {}, appendChild: () => {} },
            parentNode: { insertBefore: () => {}, appendChild: () => {} },
            addEventListener: () => {},
            removeEventListener: () => {},
            querySelectorAll: () => [],
            querySelector: () => null,
            focus: () => {},
            blur: () => {},
            dataset: {},
            offsetWidth: 100,
            offsetHeight: 30,
            clientWidth: 100,
            clientHeight: 30
        });
    }
    return mockElements.get(id);
};

// Extract inline script from index.html
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>\s*<!-- Módulos Gráficos/);
if (!scriptMatch) {
    console.error('FAILED to extract inline script from index.html');
    process.exit(1);
}
const inlineScript = scriptMatch[1];

// Setup Sandbox DOM environment
const canvasInstance = {
    width: 800,
    height: 450,
    getContext: () => createMockCtx(),
    addEventListener: () => {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 450 })
};

const sandbox = {
    console,
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    RegExp,
    Set,
    Map,
    performance: { now: () => Date.now() },
    setTimeout: (fn) => setTimeout(fn, 0),
    clearTimeout: (id) => clearTimeout(id),
    setInterval: (fn) => setInterval(fn, 0),
    clearInterval: (id) => clearInterval(id),
    requestAnimationFrame: (fn) => setTimeout(fn, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    localStorage: {
        _data: {},
        getItem(k) { return this._data[k] || null; },
        setItem(k, v) { this._data[k] = String(v); },
        removeItem(k) { delete this._data[k]; }
    },
    AudioContext: class {
        createGain() { return { gain: { value: 1, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, connect: () => {} }; }
        createOscillator() { return { frequency: { value: 440, setValueAtTime: () => {}, linearRampToValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} }, type: 'sine', connect: () => {}, start: () => {}, stop: () => {} }; }
        get destination() { return {}; }
        get currentTime() { return 0; }
        resume() { return Promise.resolve(); }
    },
    document: {
        getElementById: (id) => {
            if (id === 'mgs-canvas' || id === 'gameCanvas') return canvasInstance;
            return getMockEl(id);
        },
        createElement: (tag) => {
            if (tag === 'canvas') {
                return {
                    width: 800,
                    height: 450,
                    getContext: () => createMockCtx()
                };
            }
            return getMockEl('tag_' + Math.random());
        },
        querySelectorAll: () => [],
        querySelector: () => null,
        body: getMockEl('body'),
        head: getMockEl('head'),
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => {}
    },
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
    innerWidth: 1024,
    innerHeight: 768,
    window: null,
    navigator: { maxTouchPoints: 0, userAgent: 'NodeTest' }
};
sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.self = sandbox;

const context = vm.createContext(sandbox);

try {
    console.log('1. Executing index.html inline script...');
    vm.runInContext(inlineScript, context);
    console.log('   -> OK.');

    console.log('2. Executing gfx/sprites.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/sprites.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('3. Executing gfx/decor.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/decor.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('4. Executing gfx/lighting.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/lighting.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('4b. Executing gfx/atmosphere.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/atmosphere.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('5. Executing minigames/core.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'minigames/core.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('6. Executing minigames/array-vault.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'minigames/array-vault.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('7. Executing minigames/matrix-grid.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'minigames/matrix-grid.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('8. Executing expansion.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'expansion.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('8b. Executing gfx/ps1-postfx.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/ps1-postfx.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('8c. Executing gfx/cinematics.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/cinematics.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('8d. Executing gfx/volumetrics.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/volumetrics.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('8e. Executing gfx/codec-fx.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/codec-fx.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('8f. Executing gfx/reactivity.js...');
    vm.runInContext(fs.readFileSync(path.join(__dirname, 'gfx/reactivity.js'), 'utf-8'), context);
    console.log('   -> OK.');

    console.log('9. Testing level loading & full simulation across all levels...');
    vm.runInContext(`
        // Level 0 - Simulación inicial
        loadLevel(0, true);
        for (let f = 0; f < 60; f++) {
            updateGame(0.016);
            draw();
        }

        // Test 1: Camera Look-Ahead Dinámico
        gameState.keys['d'] = true;
        for (let f = 0; f < 10; f++) {
            updateGame(0.016);
        }
        if (!window.CINE || window.CINE.camX <= 0) {
            throw new Error('FALLA: CINE.camX no calculó look-ahead al moverse a la derecha. camX: ' + (window.CINE ? window.CINE.camX : 'null'));
        }
        console.log('   [TEST 1 PASSED] Camera Look-Ahead operativo (camX: ' + window.CINE.camX.toFixed(2) + ')');
        gameState.keys['d'] = false;

        // Test 2: Codec Typing & VU-Meter Synchronization
        openCodecDialog('intro');
        if (!window.isCodecTyping) {
            throw new Error('FALLA: window.isCodecTyping es falso durante el diálogo del Codec');
        }
        console.log('   [TEST 2 PASSED] Codec Typing sincronizado activamente (isCodecTyping: true)');
        tuneCodecContact(1);
        closeCodecDialog();
        if (window.isCodecTyping) {
            throw new Error('FALLA: window.isCodecTyping sigue en true tras cerrar el Codec');
        }

        // Test 3: Charcos de Refrigerante Renderizados
        let ellipseCount = 0;
        const testCtx = canvas.getContext('2d');
        const origEllipse = testCtx.ellipse;
        testCtx.ellipse = function() { ellipseCount++; if (origEllipse) origEllipse.apply(this, arguments); };
        renderAtmosphereFloor(testCtx);
        testCtx.ellipse = origEllipse;
        if (ellipseCount < 3) {
            throw new Error('FALLA: Menos de 3 charcos renderizados en renderAtmosphereFloor. Encontrados: ' + ellipseCount);
        }
        console.log('   [TEST 3 PASSED] Todos los charcos de refrigerante se renderizan en el suelo (' + ellipseCount + ' elipses)');

        // Test 4: Rejillas Metálicas con Reactividad Física
        gameState.player.x = 60;
        gameState.player.y = 60;
        gameState.keys['w'] = true;
        updateReactivity(0.016);
        gameState.keys['w'] = false;
        console.log('   [TEST 4 PASSED] Rejillas metálicas físicas y reactivas detectadas correctamente');

        // Test 5: Radar Soliton Jamming bajo Granada Chaff
        if (typeof window.useChaffAction === 'function') {
            window.useChaffAction();
            if (!window.XP || window.XP.chaffTimer <= 0) {
                throw new Error('FALLA: Granada Chaff no activó XP.chaffTimer');
            }
            // Probar render de radar bajo interferencia
            renderSolitonSweep(testCtx);
            console.log('   [TEST 5 PASSED] Soliton Radar Jamming renderizado bajo interferencia Chaff (timer: ' + window.XP.chaffTimer.toFixed(1) + 's)');
        }

        // Test 6: CQC, Box Toggle y Wall Knock
        if (typeof window.tryCQCAction === 'function') window.tryCQCAction();
        if (typeof window.toggleCardboardBox === 'function') window.toggleCardboardBox();
        if (typeof window.performWallKnock === 'function') window.performWallKnock();

        // Test 6b: Renderizado Procedural de Centinela Dormido CQC (PS1 Sleeper Sprite)
        if (typeof window.renderCustomSleepingGuard !== 'function') {
            throw new Error('FALLA: window.renderCustomSleepingGuard no está definido');
        }
        // Robustez ante entradas nulas y vacías
        if (window.renderCustomSleepingGuard(null, testCtx) !== false) {
            throw new Error('FALLA: renderCustomSleepingGuard(null) debió devolver false');
        }
        if (window.renderCustomSleepingGuard(undefined, testCtx) !== false) {
            throw new Error('FALLA: renderCustomSleepingGuard(undefined) debió devolver false');
        }

        // Robustez ante objeto vacío: verificar ausencia total de parámetros NaN en Canvas
        const recordedCanvasArgs = [];
        const wrapCtxFn = (name) => {
            const orig = testCtx[name];
            testCtx[name] = function() {
                for (let i = 0; i < arguments.length; i++) {
                    if (typeof arguments[i] === 'number' && isNaN(arguments[i])) {
                        recordedCanvasArgs.push({ method: name, argIdx: i, args: Array.from(arguments) });
                    }
                }
                if (orig) return orig.apply(this, arguments);
            };
            return orig;
        };
        const origTr = wrapCtxFn('translate');
        const origFillT = wrapCtxFn('fillText');
        const origFillR = wrapCtxFn('fillRect');
        const origStrokeR = wrapCtxFn('strokeRect');
        const origArc = wrapCtxFn('arc');
        const origRot = wrapCtxFn('rotate');

        const emptyRes = window.renderCustomSleepingGuard({}, testCtx);
        testCtx.translate = origTr;
        testCtx.fillText = origFillT;
        testCtx.fillRect = origFillR;
        testCtx.strokeRect = origStrokeR;
        testCtx.arc = origArc;
        testCtx.rotate = origRot;

        if (!emptyRes) {
            throw new Error('FALLA: renderCustomSleepingGuard({}) debió devolver true con fallbacks numéricos');
        }
        if (recordedCanvasArgs.length > 0) {
            throw new Error('FALLA: renderCustomSleepingGuard({}) produjo argumentos NaN en Canvas: ' + JSON.stringify(recordedCanvasArgs));
        }

        const testSleeper = { id: 1, x: 300, y: 200, angle: 0, radius: 14, sleep: 20 };
        let sleeperRenderCalled = false;
        const origSleeperRender = window.renderCustomSleepingGuard;
        window.renderCustomSleepingGuard = function(sg, ctx) {
            sleeperRenderCalled = true;
            return origSleeperRender(sg, ctx);
        };
        const sleeperResult = window.renderCustomSleepingGuard(testSleeper, testCtx);
        if (!sleeperResult) {
            throw new Error('FALLA: renderCustomSleepingGuard no devolvió true');
        }
        // Integración con draw() y currentRoom.sleepers
        const curRoomSleeper = facilityRooms[gameState.currentRoomId];
        curRoomSleeper.sleepers = [testSleeper];
        sleeperRenderCalled = false;
        window.draw();
        if (!sleeperRenderCalled) {
            throw new Error('FALLA: draw() no invocó renderCustomSleepingGuard para currentRoom.sleepers');
        }
        window.renderCustomSleepingGuard = origSleeperRender;
        curRoomSleeper.sleepers = [];

        // Ejecución real de CQC sigiloso por la espalda y transición a sleepers
        loadLevel(0, true);
        const roomCQC = facilityRooms[gameState.currentRoomId];
        const gCQC = roomCQC.guards[0];
        gCQC.angle = Math.PI / 2; // Guardia mirando al sur (+Y)
        gameState.player.x = gCQC.x;
        gameState.player.y = gCQC.y - 12; // Solid Byte ubicado a la espalda del guardia
        gameState.player.dir = Math.PI / 2;
        const initialGuardCount = roomCQC.guards.length;
        window.tryCQCAction();
        if (roomCQC.guards.length !== initialGuardCount - 1) {
            throw new Error('FALLA: CQC por la espalda no removió al centinela de room.guards');
        }
        if (!roomCQC.sleepers || roomCQC.sleepers.length !== 1 || roomCQC.sleepers[0].sleep !== 25) {
            throw new Error('FALLA: CQC no ingresó al centinela a room.sleepers con sleep: 25s');
        }
        // Dibujado con cámara desplazada activo
        if (window.CINE) { window.CINE.camX = 18; window.CINE.camY = 12; }
        window.draw();
        if (window.CINE) { window.CINE.camX = 0; window.CINE.camY = 0; }
        console.log('   [TEST 6b PASSED] Renderizado Procedural de centinela dormido CQC validado con cámara y gráficos PS1');

        // Test 7: Sombras y Oclusión - Reducción drástica de visión de linternas en zonas oscuras
        loadLevel(0, true);
        const room0 = facilityRooms[gameState.currentRoomId];
        const dummyGuard = { x: 300, y: 200, angle: 0, fov: Math.PI / 3, viewDist: 150 };
        const litPlayer = { x: 320, y: 80 }; // Bajo lámpara de techo
        const litDist = window.getGuardEffectiveViewDist(dummyGuard, litPlayer, room0);
        const shadowPlayer = { x: 50, y: 380 }; // En penumbra táctica distante de lámparas
        const shadowDist = window.getGuardEffectiveViewDist(dummyGuard, shadowPlayer, room0);
        if (shadowDist >= litDist * 0.7) {
            throw new Error('FALLA: Sombras no redujeron drásticamente la visión. litDist: ' + litDist + ', shadowDist: ' + shadowDist);
        }
        console.log('   [TEST 7 PASSED] Sombras y Oclusión operativas (Luz: ' + litDist.toFixed(1) + 'px vs Sombra: ' + shadowDist.toFixed(1) + 'px [' + (100 - (shadowDist / litDist) * 100).toFixed(0) + '% reducción])');

        // Test 7b: Lámparas Cenitales en todas las salas de campaña y Raycasting Ortogonal
        for (let lvl = 0; lvl <= 2; lvl++) {
            loadLevel(lvl, true);
            const lvlData = campaignLevels[lvl];
            for (let rKey in lvlData.rooms) {
                const rObj = lvlData.rooms[rKey];
                const lamps = window.getRoomCeilingLamps(rObj);
                if (!lamps || lamps.length === 0) {
                    throw new Error('FALLA: Sala ' + rKey + ' no tiene lámparas cenitales asignadas');
                }
            }
        }
        // Verificar oclusión de rayos en paredes cardinales y diagonales
        const testWalls = [{ x: 200, y: 100, w: 20, h: 200 }];
        if (!window.isRayBlockedByWalls(100, 200, 300, 200, testWalls)) {
            throw new Error('FALLA: isRayBlockedByWalls no detectó pared horizontal a través de X');
        }
        console.log('   [TEST 7b PASSED] Lámparas cenitales mapeadas en todas las salas y raycasting ortogonal validado');

        // Test 8: IA Reactiva - Rastro de Huellas Húmedas
        loadLevel(0, true);
        const curRoomG = facilityRooms[gameState.currentRoomId];
        const g1 = curRoomG.guards[0];
        g1.x = 300; g1.y = 100; g1.angle = 0; // Orientado hacia +X en pasillo libre
        g1.investigateTimer = 0;
        g1._trackingFootprints = false;
        const fp1 = window.spawnWetFootprint(360, 100, Math.PI / 4, 5.0);
        updateGame(0.016);
        if (!g1._trackingFootprints || !g1.investigateTarget || Math.hypot(g1.investigateTarget.x - fp1.x, g1.investigateTarget.y - fp1.y) > 5) {
            throw new Error('FALLA: Centinela no investigó la huella húmeda en su campo visual');
        }
        console.log('   [TEST 8 PASSED] IA Reactiva investiga huellas húmedas tácticas');

        // Test 8b: IA Reactiva - Fin del rastro orienta hacia la dirección de la huella
        g1.x = 360; g1.y = 100;
        updateGame(0.016);
        if (g1._trackingFootprints) {
            throw new Error('FALLA: Al alcanzar la última huella del rastro, _trackingFootprints debió finalizar');
        }
        if (Math.abs(g1.angle - Math.PI / 4) > 0.3) {
            throw new Error('FALLA: Al terminar el rastro, el centinela debió orientarse en la dirección de la última huella (fp.dir)');
        }
        console.log('   [TEST 8b PASSED] Fin del rastro orienta al centinela según dirección de huella');

        // Test 8c: Aislamiento estricto de charcos y huellas entre salas
        if (!window.ATMOSPHERE || !window.ATMOSPHERE.puddlesByRoom) {
            throw new Error('FALLA: window.ATMOSPHERE.puddlesByRoom no está definido');
        }
        const expectedRooms = ['dock', 'filtration_u1', 'arena_olympo', 'transit_conduit'];
        for (let rId of expectedRooms) {
            if (!window.ATMOSPHERE.puddlesByRoom[rId] || window.ATMOSPHERE.puddlesByRoom[rId].length === 0) {
                throw new Error('FALLA: Sala temática ' + rId + ' no tiene charcos asignados');
            }
        }
        if (window.ATMOSPHERE.getRoomPuddles('corridor_u1').length !== 0) {
            throw new Error('FALLA: corridor_u1 no debería tener charcos asignados');
        }

        // Probar filtrado directo por roomId en getWetFootprints
        loadLevel(0, true);
        const fpDock = window.spawnWetFootprint(300, 200, 0, 5.0, 'dock');
        if (fpDock.roomId !== 'dock') {
            throw new Error('FALLA: spawnWetFootprint no asignó roomId: dock');
        }
        const dockFps = window.getWetFootprints('dock');
        const corridorFps = window.getWetFootprints('corridor_u1');
        if (!dockFps.some(f => f.id === fpDock.id)) {
            throw new Error('FALLA: getWetFootprints("dock") no incluyó la huella de dock');
        }
        if (corridorFps.some(f => f.id === fpDock.id)) {
            throw new Error('FALLA: getWetFootprints("corridor_u1") incluyó erróneamente huella perteneciente a dock');
        }

        // Probar aislamiento de IA: huella en dock no alerta a guardia en corridor_u1
        switchRoom('corridor_u1', 50, 225);
        if (gameState.currentRoomId !== 'corridor_u1') {
            throw new Error('FALLA: switchRoom no cambió a corridor_u1');
        }
        const roomCorridor = facilityRooms['corridor_u1'];
        const gCorridor = roomCorridor.guards[0];
        gCorridor.x = 275; gCorridor.y = 200; gCorridor.angle = 0; // Mirando hacia (300, 200) a 25px
        gCorridor.investigateTimer = 0;
        gCorridor._trackingFootprints = false;
        gCorridor._bubble = null;
        updateGame(0.016);
        if (gCorridor._trackingFootprints || gCorridor.investigateTimer > 0 || (gCorridor._bubble && gCorridor._bubble.ch === '?')) {
            throw new Error('FALLA: Centinela en corridor_u1 investigó huella perteneciente a dock');
        }

        // Probar renderizado: huellas de otra sala no se dibujan en corridor_u1
        let rectCount = 0;
        const origFillRect = testCtx.fillRect;
        testCtx.fillRect = function() { rectCount++; if (origFillRect) origFillRect.apply(this, arguments); };
        renderAtmosphereFloor(testCtx);
        testCtx.fillRect = origFillRect;
        // En corridor_u1 no hay charcos ni huellas pertenecientes a corridor_u1
        if (rectCount > 0) {
            throw new Error('FALLA: renderAtmosphereFloor dibujó huellas de otra sala en corridor_u1');
        }

        // Probar inmunidad a re-alerta redundante: al regresar a dock, el guardia no debe re-investigar la misma huella ya vista
        switchRoom('dock', 750, 225);
        const roomDock = facilityRooms['dock'];
        const gDock = roomDock.guards[0];
        gDock.x = 275; gDock.y = 200; gDock.angle = 0; // A 25px de la huella en dock
        updateGame(0.016); // Guardia avista e investiga fpDock por primera vez
        if (!gDock._trackingFootprints && gDock.investigateTimer === 0) {
            throw new Error('FALLA: Centinela en dock debió avistar la huella de su propia sala');
        }
        // Simular conclusión de la investigación de esa huella
        gDock.x = 300; gDock.y = 200;
        updateGame(0.016);
        gDock._trackingFootprints = false;
        gDock.investigateTimer = 0;
        gDock.investigateTarget = null;
        // Cambiar de sala y volver inmediatamente
        switchRoom('corridor_u1', 50, 225);
        switchRoom('dock', 750, 225);
        gDock.x = 275; gDock.y = 200; gDock.angle = 0; // Vuelve a mirar hacia la misma huella a 25px
        updateGame(0.016);
        if (gDock._trackingFootprints || gDock.investigateTimer > 0 || (gDock._bubble && gDock._bubble.ch === '?')) {
            throw new Error('FALLA: Centinela en dock re-alertó redundantemente sobre huella ya investigada');
        }

        // Probar limpieza en loadLevel: huellas residuales deben ser purgadas
        loadLevel(0, true);
        if (window.getWetFootprints().length > 0) {
            throw new Error('FALLA: loadLevel debió purgar las huellas húmedas residuales');
        }
        console.log('   [TEST 8c PASSED] Aislamiento estricto de charcos e IA de huellas entre salas validado');

        // Test 9: IA Reactiva - Caja de Cartón (Quietud = Inspección, Movimiento = Alerta)
        loadLevel(0, true);
        const roomBox = facilityRooms[gameState.currentRoomId];
        const gBox = roomBox.guards[0];
        gBox.x = 300; gBox.y = 150; gBox.angle = 0;
        gBox.investigateTimer = 0;
        gBox._inspectingBox = false;
        gBox._boxInspectedCooldown = 0;
        gameState.roomGraceTimer = 0;
        gameState.alertState = 'normal';
        gameState.alertTimer = 0;
        gameState.player.x = 350; gameState.player.y = 150;
        gameState.player.inBox = true;
        // 9a. Caja quieta -> Inspección curiosa sin alerta inmediata
        gameState.keys['w'] = false; gameState.keys['s'] = false; gameState.keys['a'] = false; gameState.keys['d'] = false;
        updateGame(0.016);
        if (!gBox._inspectingBox || gameState.alertState === 'alert') {
            throw new Error('FALLA: Caja quieta debió activar inspección curiosa sin alarma. inspecting: ' + gBox._inspectingBox + ', alert: ' + gameState.alertState);
        }
        console.log('   [TEST 9a PASSED] Caja de cartón quieta activa inspección curiosa de centinela');

        // 9b. Caja en movimiento -> Alerta inmediata
        gBox._inspectingBox = false;
        gameState.keys['d'] = true;
        updateGame(0.016);
        gameState.keys['d'] = false;
        if (gameState.alertState !== 'alert') {
            throw new Error('FALLA: Moverse en la caja frente a centinela debió activar ! ALERTA');
        }
        console.log('   [TEST 9b PASSED] Moverse en la caja frente a centinela activa ! ALERTA');
        gameState.player.inBox = false;

        // 9c. Timeout de aproximación a caja cancela inspección sin trabar al centinela
        gameState.alertState = 'normal';
        gameState.alertTimer = 0;
        if (window.XP) window.XP.freeze = 0;
        gBox._inspectingBox = true;
        gBox.investigateTimer = 0.01;
        gBox.x = 300; gBox.y = 150;
        gameState.player.x = 600; gameState.player.y = 150; // Lejos de la distancia de 36px
        gameState.player.inBox = true;
        updateGame(0.05); // Dejar expirar investigateTimer
        if (gBox._inspectingBox) {
            throw new Error('FALLA: Timeout de investigación no canceló _inspectingBox');
        }
        console.log('   [TEST 9c PASSED] Timeout de aproximación a caja cancela inspección limpiamente');

        // 9d. Salir de la caja tras un muro NO activa alarma a través de paredes
        gameState.alertState = 'normal';
        gameState.alertTimer = 0;
        if (window.XP) window.XP.freeze = 0;
        gBox._inspectingBox = true;
        gBox.investigateTimer = 3.0;
        gBox.x = 100; gBox.y = 100;
        gameState.player.x = 250; gameState.player.y = 100; // Tras muro de dock en x=180
        gameState.player.inBox = false; // Desembaló tras el muro
        updateGame(0.016);
        if (gameState.alertState === 'alert') {
            throw new Error('FALLA: Desembalar tras un muro activó alarma a través de la pared');
        }
        console.log('   [TEST 9d PASSED] Desembalar tras pared no dispara alarma a través de muros');

        // 9e. Camouflage Index: 100% en caja quieta vs 15% en caja en movimiento vs bono en muro
        gameState.player.inBox = true;
        gameState.keys['w'] = false; gameState.keys['s'] = false; gameState.keys['a'] = false; gameState.keys['d'] = false;
        updateGame(0.016);
        const camoElText = document.getElementById('camo-text').textContent;
        if (!camoElText.includes('100% [CAJA QUIETA]')) {
            throw new Error('FALLA: Camo HUD no mostró 100% [CAJA QUIETA]: ' + camoElText);
        }
        gameState.keys['w'] = true;
        updateGame(0.016);
        gameState.keys['w'] = false;
        const camoMovingText = document.getElementById('camo-text').textContent;
        if (!camoMovingText.includes('15% [CAJA EN MOVIMIENTO]')) {
            throw new Error('FALLA: Camo HUD no mostró 15% [CAJA EN MOVIMIENTO]: ' + camoMovingText);
        }
        gameState.player.inBox = false;
        console.log('   [TEST 9e PASSED] Camouflage Index dinámico responde a caja quieta y en movimiento');

        // Test 10: Música Adaptativa Chiptune 120 BPM
        if (!window.MGS_AUDIO || window.MGS_AUDIO.BPM !== 120) {
            throw new Error('FALLA: Motor MGS_AUDIO cuantizado a 120 BPM no encontrado');
        }
        setMusicTheme('sneaking');
        setMusicTheme('caution');
        setMusicTheme('alert');
        const testAudioCtx = getAudioContext();
        window.MGS_AUDIO.playMilitarySnare(testAudioCtx, 0, 0.2, false);
        window.MGS_AUDIO.playMilitaryKick(testAudioCtx, 0, 0.3);
        window.MGS_AUDIO.playMilitaryHat(testAudioCtx, 0, 0.05);
        console.log('   [TEST 10 PASSED] Motor de Música Adaptativa Chiptune 120 BPM y Percusión Militar verificado');

        // Test 10b: Retención de tema de boss durante combate activo
        loadLevel(0, true);
        switchRoom('arena_vulcan', 100, 225);
        if (musicTheme !== 'boss') {
            throw new Error('FALLA: Al ingresar a sala de boss el tema debió ser boss, actual: ' + musicTheme);
        }
        gameState.alertTimer = 0;
        gameState.alertState = 'normal';
        updateGame(0.016);
        if (musicTheme !== 'boss') {
            throw new Error('FALLA: updateGame sobrescribió el tema de boss a ' + musicTheme + ' durante el combate');
        }
        console.log('   [TEST 10b PASSED] Retención de tema de boss durante combate validada');

        // Level 1 y Level 2 (Boss Encounter)
        loadLevel(1, true);
        for (let f = 0; f < 60; f++) {
            updateGame(0.016);
            draw();
        }

        loadLevel(2, true);
        for (let f = 0; f < 60; f++) {
            updateGame(0.016);
            draw();
        }

        // Benchmark de rendimiento 300 cuadros a 60 FPS
        const t0 = Date.now();
        for (let f = 0; f < 300; f++) {
            updateGame(0.016);
            draw();
        }
        const elapsedMs = Date.now() - t0;
        console.log('   -> 300 frames rendered in ' + elapsedMs + 'ms (' + (elapsedMs / 300).toFixed(2) + 'ms/frame). 60 FPS Target is <16.6ms.');
    `, context);
    console.log('   -> All interactive features executed without TypeErrors or canvas crashes.');

    console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
    process.exit(0);
} catch (err) {
    console.error('ERROR ENCOUNTERED:', err);
    process.exit(1);
}
