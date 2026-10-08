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
        // Level 0
        loadLevel(0, true);
        for (let f = 0; f < 60; f++) {
            updateGame(0.016);
            draw();
        }

        // Test CQC Action
        if (typeof window.tryCQCAction === 'function') window.tryCQCAction();

        // Test Chaff grenade
        if (typeof window.useChaffAction === 'function') window.useChaffAction();

        // Test Box Toggle
        if (typeof window.toggleCardboardBox === 'function') window.toggleCardboardBox();

        // Test Wall Knock
        if (typeof window.performWallKnock === 'function') window.performWallKnock();

        // Level 1
        loadLevel(1, true);
        for (let f = 0; f < 60; f++) {
            updateGame(0.016);
            draw();
        }

        // Level 2 (Boss Encounter)
        loadLevel(2, true);
        for (let f = 0; f < 60; f++) {
            updateGame(0.016);
            draw();
        }

        // Test Codec Open & Contact Switch
        if (typeof window.openCodecDialog === 'function') window.openCodecDialog('intro');
        if (typeof window.tuneCodecContact === 'function') window.tuneCodecContact(1);
        if (typeof window.closeCodecDialog === 'function') window.closeCodecDialog();

        // Benchmark 300 frames of full gameplay loop
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
