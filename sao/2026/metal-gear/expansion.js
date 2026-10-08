/* =============================================================================
 * METAL GEAR JAVA // EXPANSIÓN "OPERACIÓN OUTER HEAVEN"
 * Módulo que extiende el motor base (index.html) sin reescribirlo:
 *  - Opciones de respuesta "limpias" (sin la explicación que delataba la correcta)
 *  - Temporizador de hackeo + atajos 1-4 + anti doble-click
 *  - BIT LOCK: preguntas procedurales infinitas en las balizas de los jefes
 *  - Sigilo: correr con ruido [SHIFT], CQC por la espalda [Q], Granada NULL [G],
 *    guardias dormidos que alertan si los descubren, burbujas ! y ?, hit-stop
 *  - Dog Tags coleccionables con datos de Java
 *  - Combo de respuestas = daño crítico al jefe
 *  - Rango final estilo MGS + informe de debilidades + récord persistente
 *  - Psycho Mantis lee tu partida antes del jefe final
 * ============================================================================= */
(function () {
    'use strict';

    // -------------------------------------------------------------------------
    // 0. UTILIDADES
    // -------------------------------------------------------------------------
    const R = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const randArr = (n, a, b) => Array.from({ length: n }, () => R(a, b));
    const $ = id => document.getElementById(id);
    const isOpen = id => $(id) && $(id).style.display === 'flex';
    const LS_RANK = 'mgsjava_bestrank_';
    const LS_TUTO = 'mgsjava_tuto_v2';

    // -------------------------------------------------------------------------
    // 1. ESTADO DE LA EXPANSIÓN
    // -------------------------------------------------------------------------
    const XP = {
        stats: null,
        retries: {},
        chaff: 1,
        chaffTimer: 0,
        freeze: 0,
        invert: 0,
        flash: 0,
        sprintNoise: 0,
        prevAlert: 'normal',
        hackTimer: null,
        hackTimeLeft: 0,
        hackTimeMax: 0,
        answered: false,
        mantisDone: false,
        lastCodecKey: null,
        bitlock: null
    };

    function freshStats() {
        return {
            start: performance.now(),
            alarms: 0, errors: 0, correct: 0, cqc: 0, tags: 0, tagsTotal: 0,
            streak: 0, bestStreak: 0, chaffUsed: 0, timeouts: 0,
            topicErrors: {}
        };
    }
    XP.stats = freshStats();

    // -------------------------------------------------------------------------
    // 2. LIMPIEZA DE OPCIONES (la correcta ya no se delata por larga/explicada)
    // -------------------------------------------------------------------------
    function cleanOptionText(t) {
        let out = t.replace(/\s*\([^()]{18,}\)/g, '').trim();
        out = out.replace(/\s*[,;:]\s*$/, '').trim();
        if (out.length < 1) return t;
        return out;
    }
    function cleanQuestionSet(list) {
        (list || []).forEach(q => {
            if (!q.options || q._cleaned) return;
            const correct = q.options.find(o => o.correct);
            const extra = correct ? (correct.text.match(/\(([^()]{18,})\)/) || [])[1] : null;
            q.options.forEach(o => { o.text = cleanOptionText(o.text); });
            if (extra) q.explanation = `${q.explanation} 📘 ${extra}.`;
            q._cleaned = true;
        });
    }
    if (typeof campaignLevels !== 'undefined') {
        campaignLevels.forEach(lvl => {
            cleanQuestionSet(lvl.terminals);
            cleanQuestionSet(lvl.bossBeacons);
        });
    }

    // -------------------------------------------------------------------------
    // 3. GENERADORES PROCEDURALES "BIT LOCK" (respuesta tipeada, infinitas)
    // -------------------------------------------------------------------------
    const GEN = [
        // ===== MISIÓN 1: tipos, operadores, casting =====
        [
            () => {
                const a = R(11, 47), b = R(3, 7);
                return {
                    topic: 'División entera y módulo',
                    code: `int a = ${a}, b = ${b};\nint r = a / b + a % b;\nSystem.out.println(r);`,
                    answer: String(Math.floor(a / b) + a % b),
                    explanation: `${a} / ${b} = ${Math.floor(a / b)} (división entera) y ${a} % ${b} = ${a % b}.`
                };
            },
            () => {
                const a = pick([5, 7, 9, 11, 13, 15, 17, 19]);
                return {
                    topic: 'Casting implícito y división entera',
                    code: `double d = ${a} / 2;\nSystem.out.println(d);`,
                    answer: `${Math.floor(a / 2)}.0`,
                    exact: true,
                    explanation: `${a} / 2 se resuelve ENTRE ENTEROS (= ${Math.floor(a / 2)}) y recién después se ensancha a double: ${Math.floor(a / 2)}.0`
                };
            },
            () => {
                const x = R(2, 9);
                return {
                    topic: 'Pre y post incremento',
                    code: `int x = ${x};\nint y = x++ + ++x;\nSystem.out.println(y);`,
                    answer: String(x + x + 2),
                    explanation: `x++ aporta ${x} (y deja x=${x + 1}); ++x sube a ${x + 2} y aporta ${x + 2}. Total ${2 * x + 2}.`
                };
            },
            () => {
                const a = R(1, 5), b = R(6, 9), useAnd = Math.random() < 0.5;
                return useAnd ? {
                    topic: 'Cortocircuito &&',
                    code: `int c = 0;\nif (${a} > ${b} && ++c > 0) {\n    c += 10;\n}\nSystem.out.println(c);`,
                    answer: '0',
                    explanation: `${a} > ${b} es false: && corta y NUNCA evalúa ++c. c queda en 0.`
                } : {
                    topic: 'Cortocircuito ||',
                    code: `int c = 0;\nif (${a} < ${b} || ++c > 0) {\n    c += 5;\n}\nSystem.out.println(c);`,
                    answer: '5',
                    explanation: `${a} < ${b} es true: || corta sin ejecutar ++c, pero entra al if: c = 5.`
                };
            },
            () => {
                const ent = R(3, 12), dec = R(11, 99);
                return {
                    topic: 'Casting explícito (truncamiento)',
                    code: `int n = (int) ${ent}.${dec};\nSystem.out.println(n * 2);`,
                    answer: String(ent * 2),
                    explanation: `(int) TRUNCA (no redondea): ${ent}.${dec} → ${ent}. Luego ${ent} * 2 = ${ent * 2}.`
                };
            },
            () => {
                const a = R(3, 9), m = R(4, 7);
                const v = (a + a * 2) % m;
                return {
                    topic: 'Operadores compuestos',
                    code: `int x = ${a};\nx += x * 2;\nx %= ${m};\nSystem.out.println(x);`,
                    answer: String(v),
                    explanation: `x += x*2 → ${a * 3}. Luego ${a * 3} % ${m} = ${v}.`
                };
            }
        ],
        // ===== MISIÓN 2: control de flujo y métodos =====
        [
            () => {
                const s = R(0, 4), e = s + R(8, 19), k = R(2, 4);
                const n = Math.ceil((e - s) / k);
                return {
                    topic: 'Conteo de iteraciones (for)',
                    code: `int cont = 0;\nfor (int i = ${s}; i < ${e}; i += ${k}) {\n    cont++;\n}\nSystem.out.println(cont);`,
                    answer: String(n),
                    explanation: `i toma ${Array.from({ length: n }, (_, j) => s + j * k).join(', ')} → ${n} vueltas.`
                };
            },
            () => {
                const n = R(3, 7);
                return {
                    topic: 'Acumulador en while',
                    code: `int i = 1, suma = 0;\nwhile (i <= ${n}) {\n    suma += i;\n    i++;\n}\nSystem.out.println(suma);`,
                    answer: String(n * (n + 1) / 2),
                    explanation: `Suma 1..${n} = ${n * (n + 1) / 2}.`
                };
            },
            () => {
                const op = R(1, 4);
                let v = 0;
                if (op === 1) v = 1 + 2; else if (op === 2) v = 2; else if (op === 3) v = 3 + 10; else v = 10;
                return {
                    topic: 'switch y fall-through',
                    code: `int op = ${op}, v = 0;\nswitch (op) {\n    case 1: v += 1;\n    case 2: v += 2; break;\n    case 3: v += 3;\n    default: v += 10;\n}\nSystem.out.println(v);`,
                    answer: String(v),
                    explanation: `Entra por case ${op > 3 ? 'default' : op} y cae en cascada hasta el primer break (o el final). v = ${v}.`
                };
            },
            () => {
                const a = R(2, 4), b = R(3, 5);
                let c = 0;
                for (let i = 0; i < a; i++) for (let j = i; j < b; j++) c++;
                return {
                    topic: 'Bucles anidados',
                    code: `int cont = 0;\nfor (int i = 0; i < ${a}; i++)\n    for (int j = i; j < ${b}; j++)\n        cont++;\nSystem.out.println(cont);`,
                    answer: String(c),
                    explanation: `El for interno arranca en i: ${Array.from({ length: a }, (_, i) => b - i).join(' + ')} = ${c}.`
                };
            },
            () => {
                const x0 = R(10, 22), lim = R(1, 9);
                let x = x0, v = 0;
                do { x -= 3; v++; } while (x > lim);
                return {
                    topic: 'do-while (post-condición)',
                    code: `int x = ${x0}, vueltas = 0;\ndo {\n    x -= 3;\n    vueltas++;\n} while (x > ${lim});\nSystem.out.println(vueltas);`,
                    answer: String(v),
                    explanation: `x baja de 3 en 3 desde ${x0} hasta ${x} (≤ ${lim}): ${v} vueltas.`
                };
            },
            () => {
                const a = R(2, 9), k = R(2, 4);
                return {
                    topic: 'Paso por valor',
                    code: `static int f(int n) {\n    n = n * ${k};\n    return n + 1;\n}\n// en main:\nint a = ${a};\nint b = f(a);\nSystem.out.println(a + b);`,
                    answer: String(a + a * k + 1),
                    explanation: `f trabaja con una COPIA: a sigue en ${a}. b = ${a * k + 1}. a + b = ${a + a * k + 1}.`
                };
            }
        ],
        // ===== MISIÓN 3: arreglos, matrices, búsqueda =====
        [
            () => {
                const v = randArr(5, 1, 9), i = R(0, 4), j = R(0, 4), k = R(0, 4);
                const res = v[j] + v[k];
                return {
                    topic: 'Indexación de arreglos',
                    code: `int[] v = {${v.join(', ')}};\nv[${i}] = v[${j}] + v[${k}];\nSystem.out.println(v[${i}]);`,
                    answer: String(res),
                    explanation: `v[${j}] = ${v[j]}, v[${k}] = ${v[k]} (índices desde 0). Suma ${res}.`
                };
            },
            () => {
                const v = randArr(8, 1, 9), t = R(3, 6);
                const s = v.slice(0, t).reduce((a, b) => a + b, 0);
                return {
                    topic: 'Recorrido con tope',
                    code: `int[] v = {${v.join(', ')}};\nint tope = ${t}, suma = 0;\nfor (int i = 0; i < tope; i++)\n    suma += v[i];\nSystem.out.println(suma);`,
                    answer: String(s),
                    explanation: `Solo los primeros ${t} datos válidos: ${v.slice(0, t).join(' + ')} = ${s}.`
                };
            },
            () => {
                const m = [randArr(3, 1, 9), randArr(3, 1, 9), randArr(3, 1, 9)];
                const s = m[0][0] + m[1][1] + m[2][2];
                return {
                    topic: 'Diagonal principal de una matriz',
                    code: `int[][] m = {\n  {${m[0].join(', ')}},\n  {${m[1].join(', ')}},\n  {${m[2].join(', ')}}\n};\nint s = 0;\nfor (int i = 0; i < m.length; i++)\n    s += m[i][i];\nSystem.out.println(s);`,
                    answer: String(s),
                    explanation: `m[0][0] + m[1][1] + m[2][2] = ${m[0][0]} + ${m[1][1]} + ${m[2][2]} = ${s}.`
                };
            },
            () => {
                const r = R(2, 6), c = R(2, 9);
                return {
                    topic: 'Dimensiones de una matriz',
                    code: `int[][] m = new int[${r}][${c}];\nSystem.out.println(m.length * 10 + m[0].length);`,
                    answer: String(r * 10 + c),
                    explanation: `m.length = filas (${r}), m[0].length = columnas (${c}). ${r}*10 + ${c} = ${r * 10 + c}.`
                };
            },
            () => {
                const n = R(7, 11);
                const v = randArr(n, 1, 60).sort((a, b) => a - b);
                const mid = Math.floor((n - 1) / 2);
                return {
                    topic: 'Búsqueda binaria (punto medio)',
                    code: `int[] v = {${v.join(', ')}};\nint ini = 0, fin = v.length - 1;\nint medio = (ini + fin) / 2;\nSystem.out.println(v[medio]);`,
                    answer: String(v[mid]),
                    explanation: `fin = ${n - 1}; medio = (0 + ${n - 1}) / 2 = ${mid} → v[${mid}] = ${v[mid]}.`
                };
            },
            () => {
                const v = randArr(6, 1, 9), tope = 4, p = R(0, 2);
                const w = v.slice();
                for (let i = tope; i > p; i--) w[i] = w[i - 1];
                return {
                    topic: 'Corrimiento a derecha (inserción)',
                    code: `int[] v = {${v.join(', ')}};\nint tope = ${tope};\nfor (int i = tope; i > ${p}; i--)\n    v[i] = v[i - 1];\nSystem.out.println(v[${p + 1}]);`,
                    answer: String(w[p + 1]),
                    explanation: `Se corre desde el final hacia ${p}: el antiguo v[${p}] (${v[p]}) queda copiado en v[${p + 1}].`
                };
            },
            () => {
                const m = [randArr(3, 1, 9), randArr(3, 1, 9), randArr(3, 1, 9)], c = R(0, 2);
                const s = m[0][c] + m[1][c] + m[2][c];
                return {
                    topic: 'Recorrido por columna',
                    code: `int[][] m = {\n  {${m[0].join(', ')}},\n  {${m[1].join(', ')}},\n  {${m[2].join(', ')}}\n};\nint s = 0;\nfor (int f = 0; f < m.length; f++)\n    s += m[f][${c}];\nSystem.out.println(s);`,
                    answer: String(s),
                    explanation: `Columna ${c}: ${m[0][c]} + ${m[1][c]} + ${m[2][c]} = ${s}.`
                };
            },
            () => {
                const v = randArr(4, 1, 9);
                return {
                    topic: 'Intercambio (swap)',
                    code: `int[] v = {${v.join(', ')}};\nint aux = v[0];\nv[0] = v[3];\nv[3] = aux;\nSystem.out.println(v[0] - v[3]);`,
                    answer: String(v[3] - v[0]),
                    explanation: `Tras el swap v[0] = ${v[3]} y v[3] = ${v[0]}: ${v[3]} - ${v[0]} = ${v[3] - v[0]}.`
                };
            }
        ]
    ];

    function generateBitLock() {
        const pool = GEN[Math.min(currentLevelIndex, GEN.length - 1)];
        return pick(pool)();
    }

    function checkTyped(input, q) {
        const a = String(input).trim().replace(/\s+/g, '').replace(',', '.');
        if (q.exact) return a === q.answer;
        if (a === q.answer) return true;
        const na = Number(a), nq = Number(q.answer);
        return a !== '' && !isNaN(na) && !isNaN(nq) && na === nq && !a.includes('.');
    }

    // -------------------------------------------------------------------------
    // 4. UI EXTRA: estilos, HUD, botones táctiles
    // -------------------------------------------------------------------------
    const css = document.createElement('style');
    css.textContent = `
        #stage-wrapper::after {
            content: ''; position: absolute; inset: 0; pointer-events: none; z-index: 5;
            background: repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 3px);
            mix-blend-mode: multiply;
        }
        .xp-timer { height: 6px; background: #111; border: 1px solid #0f5132; margin: 8px 0; position: relative; overflow: hidden; }
        .xp-timer-fill { height: 100%; width: 100%; background: linear-gradient(90deg, #ff2a2a, #fbbf24, #00ff66); transition: width 0.1s linear; }
        .xp-timer.danger { animation: xpPulse 0.4s infinite alternate; }
        @keyframes xpPulse { from { box-shadow: 0 0 0 #ff2a2a; } to { box-shadow: 0 0 12px #ff2a2a; } }
        .xp-bitlock { display: flex; flex-direction: column; gap: 8px; }
        .xp-bitlock-tag { font-size: 10px; letter-spacing: 3px; color: #fbbf24; }
        .xp-bitlock-row { display: flex; gap: 8px; }
        .xp-bitlock input {
            flex: 1; background: #000; color: #00ff66; border: 1px solid #00ff66; padding: 10px 12px;
            font-family: 'Share Tech Mono', monospace; font-size: 22px; letter-spacing: 4px; outline: none;
            text-shadow: 0 0 6px #00ff66;
        }
        .xp-bitlock input:focus { box-shadow: 0 0 14px rgba(0,255,102,0.5); }
        .xp-gadget { border-color: #38bdf8 !important; color: #38bdf8 !important; }
        .xp-gadget.empty { opacity: 0.4; }
        .xp-stats { display: grid; grid-template-columns: repeat(4, minmax(90px, 1fr)); gap: 6px; margin: 10px auto; max-width: 560px; }
        .xp-stat { border: 1px solid rgba(0,255,102,0.35); padding: 6px; text-align: center; background: rgba(0,0,0,0.4); }
        .xp-stat b { display: block; font-size: 18px; color: #00ff66; }
        .xp-stat span { font-size: 9px; letter-spacing: 1px; color: #94a3b8; }
        .xp-weak { font-size: 11px; color: #fca5a5; margin-top: 6px; max-width: 560px; }
        .xp-rank-big { font-size: 28px; letter-spacing: 6px; color: #fbbf24; text-shadow: 0 0 12px #fbbf24; margin: 4px 0; animation: xpRankIn 0.8s ease-out; }
        @keyframes xpRankIn { 0% { transform: scale(3); opacity: 0; filter: blur(8px); } 100% { transform: scale(1); opacity: 1; } }
        .xp-card-rank { font-size: 10px; color: #fbbf24; margin-top: 6px; letter-spacing: 1px; }
        body.xp-glitch #stage-wrapper { animation: xpGlitch 0.12s infinite; }
        @keyframes xpGlitch {
            0% { transform: translate(0,0); filter: hue-rotate(0deg); }
            25% { transform: translate(-3px,2px); filter: hue-rotate(90deg) saturate(2); }
            50% { transform: translate(3px,-2px); filter: invert(0.15); }
            75% { transform: translate(-2px,-1px); filter: hue-rotate(-90deg); }
            100% { transform: translate(0,0); }
        }
        .xp-video-gag {
            position: fixed; inset: 0; background: #000; z-index: 99999; display: none;
            font-family: 'Share Tech Mono', monospace; color: #e5e7eb; font-size: 34px; padding: 30px; letter-spacing: 4px;
        }
    `;
    document.head.appendChild(css);

    const gag = document.createElement('div');
    gag.className = 'xp-video-gag';
    gag.textContent = 'HIDEO';
    document.body.appendChild(gag);

    // Acciones Tácticas del HUD (CQC y Granada NULL)
    window.tryCQCAction = () => tryCQC();
    window.useChaffAction = () => useChaff();

    const chaffBtn = $('btn-chaff');
    function refreshChaffHud() {
        if (!chaffBtn) return;
        const lbl = $('chaff-label');
        if (lbl) lbl.textContent = `NULL x${XP.chaff} [G]`;
        chaffBtn.classList.toggle('empty', XP.chaff <= 0);
    }
    refreshChaffHud();

    // Botones táctiles extra (CQC y NULL)
    const touchRef = $('btn-touch-codec');
    if (touchRef && touchRef.parentElement) {
        [['xp-touch-cqc', 'fa-hand-fist', () => tryCQC()], ['xp-touch-null', 'fa-burst', () => useChaff()]].forEach(([id, icon, fn]) => {
            const b = document.createElement('button');
            b.className = 'touch-action-btn';
            b.id = id;
            b.innerHTML = `<i class="fa-solid ${icon}"></i>`;
            b.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); fn(); }, { passive: false });
            b.addEventListener('click', fn);
            touchRef.parentElement.appendChild(b);
        });
    }

    // Barra de tiempo en terminal de hackeo
    const optList = $('hack-options-list');
    const timerBar = document.createElement('div');
    timerBar.className = 'xp-timer';
    timerBar.innerHTML = '<div class="xp-timer-fill"></div>';
    if (optList) optList.parentElement.insertBefore(timerBar, optList);

    // -------------------------------------------------------------------------
    // 5. HACKEO MEJORADO
    // -------------------------------------------------------------------------
    const baseOpenHack = window.openHackTerminal;
    const baseCloseHack = window.closeHackTerminal;
    const baseSolveHack = window.solveHack;

    function startHackTimer(seconds) {
        stopHackTimer();
        XP.hackTimeMax = seconds;
        XP.hackTimeLeft = seconds;
        const fill = timerBar.firstChild;
        XP.hackTimer = setInterval(() => {
            XP.hackTimeLeft -= 0.1;
            fill.style.width = `${Math.max(0, XP.hackTimeLeft / XP.hackTimeMax * 100)}%`;
            timerBar.classList.toggle('danger', XP.hackTimeLeft < 5);
            if (XP.hackTimeLeft <= 5 && Math.abs(XP.hackTimeLeft % 1) < 0.1) playTone(880, 0.04, 'square', 0.05);
            if (XP.hackTimeLeft <= 0) {
                stopHackTimer();
                if (activeTerminal && !XP.answered) {
                    XP.stats.timeouts++;
                    showToast('⏱ ¡TIEMPO AGOTADO! El sistema detectó la intrusión.');
                    window.solveHack(false);
                }
            }
        }, 100);
    }
    function stopHackTimer() {
        if (XP.hackTimer) clearInterval(XP.hackTimer);
        XP.hackTimer = null;
        timerBar.classList.remove('danger');
    }

    window.openHackTerminal = function (terminal) {
        if (terminal.unlocked && !terminal.isBossBeacon) return;
        XP.answered = false;
        XP.bitlock = null;
        baseOpenHack(terminal);
        if (!isOpen('hack-screen')) return; // bloqueada por dependencia

        // Las balizas del jefe usan BIT LOCK procedural la mayoría de las veces
        if (terminal.isBossBeacon && Math.random() < 0.65) {
            const q = generateBitLock();
            XP.bitlock = q;
            activeTerminal = { ...terminal, explanation: `¡BIT LOCK ROTO! ${q.explanation}`, name: `BIT LOCK // ${q.topic.toUpperCase()}` };
            $('hack-terminal-name').innerText = `BIT LOCK // ${q.topic.toUpperCase()}`;
            $('hack-code-view').innerText = q.code;
            $('hack-question').innerText = '¿Qué imprime este fragmento? Tipeá el valor EXACTO para romper el cifrado.';
            $('hack-feedback').innerText = 'Sin opciones esta vez, Solid Byte. Ejecutá el código en tu cabeza.';
            optList.innerHTML = `
                <div class="xp-bitlock">
                    <div class="xp-bitlock-tag">▮ CERRADURA CRIPTOGRÁFICA — ENTRADA MANUAL</div>
                    <div class="xp-bitlock-row">
                        <input id="xp-bitlock-input" autocomplete="off" spellcheck="false" placeholder="_ _ _">
                        <button class="hack-btn" id="xp-bitlock-send" style="flex:0 0 auto;">INYECTAR ⏎</button>
                    </div>
                </div>`;
            const inp = $('xp-bitlock-input');
            const send = () => {
                if (XP.answered) return;
                const ok = checkTyped(inp.value, q);
                if (!ok) setTimeout(() => showToast(`Era ${q.answer} → ${q.explanation}`), 50);
                window.solveHack(ok);
            };
            $('xp-bitlock-send').onclick = send;
            inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); send(); } });
            setTimeout(() => inp.focus(), 60);
            startHackTimer(currentLevelIndex >= 2 ? 40 : 35);
        } else {
            // Opciones de hackeo estándar
            if (terminal.id === 'T3_1' || terminal.id === 'T3_5') {
                const vaultBtn = document.createElement('button');
                vaultBtn.className = 'hack-btn';
                vaultBtn.style.borderColor = '#38BDF8';
                vaultBtn.style.color = '#38BDF8';
                vaultBtn.innerHTML = '<i class="fa-solid fa-arrow-down-1-9"></i> [DESVÍO FÍSICO] RESOLVER CON ARRAY VAULT';
                vaultBtn.onclick = () => {
                    window.closeHackTerminal();
                    window.startBubbleSortMinigame(() => {
                        window.solveHack(true);
                    });
                };
                optList.prepend(vaultBtn);
            } else if (terminal.id === 'T3_3' || terminal.id === 'T3_4') {
                const matBtn = document.createElement('button');
                matBtn.className = 'hack-btn';
                matBtn.style.borderColor = '#A78BFA';
                matBtn.style.color = '#A78BFA';
                matBtn.innerHTML = '<i class="fa-solid fa-table-cells"></i> [DESVÍO FÍSICO] RESOLVER CON MATRIX GRID';
                matBtn.onclick = () => {
                    window.closeHackTerminal();
                    window.startMatrixDiagonalMinigame(() => {
                        window.solveHack(true);
                    });
                };
                optList.prepend(matBtn);
            }

            startHackTimer(terminal.isBossBeacon ? 22 : 30);
        }
    };

    window.closeHackTerminal = function () {
        stopHackTimer();
        baseCloseHack();
    };

    window.solveHack = function (isCorrect) {
        if (!activeTerminal || XP.answered) return;
        XP.answered = true;
        stopHackTimer();
        document.querySelectorAll('#hack-options-list button, #hack-options-list input').forEach(b => b.disabled = true);
        const s = XP.stats;
        const term = activeTerminal;
        const topic = XP.bitlock ? XP.bitlock.topic : (term.name || '').split('//').pop().trim();

        if (isCorrect) {
            s.correct++;
            s.streak++;
            s.bestStreak = Math.max(s.bestStreak, s.streak);
            if (!term.isBossBeacon && XP.chaff < 3) {
                XP.chaff++;
                refreshChaffHud();
                setTimeout(() => showToast('🎁 +1 GRANADA NULL obtenida del terminal [G]'), 1300);
            }
            if (s.streak >= 3) {
                setTimeout(() => showToast(`🔥 COMBO x${s.streak}: ¡el próximo golpe al reactor es CRÍTICO!`), 700);
                if (window.spawnFloatingText && gameState.player) {
                    window.spawnFloatingText(gameState.player.x, gameState.player.y - 18, `🔥 COMBO x${s.streak}!`, '#FBBF24');
                }
            }
        } else {
            s.errors++;
            s.streak = 0;
            s.topicErrors[topic] = (s.topicErrors[topic] || 0) + 1;
            if (currentLevelIndex === 2 && XP.mantisDone && term.isBossBeacon) {
                XP.invert = 7;
                setTimeout(() => showToast('🌀 PSYCHO MANTIS: «¡Tus controles me pertenecen!» (invertidos 7s)'), 1300);
            }
        }
        baseSolveHack(isCorrect);
    };

    // Combo = daño crítico
    const baseDamageBoss = window.damageBoss;
    window.damageBoss = function (amount) {
        const st = XP.stats.streak;
        let dmg = amount;
        if (st >= 3) {
            dmg = Math.round(amount * 1.6);
            showToast(`💥 ¡GOLPE CRÍTICO! COMBO x${st} → ${dmg} de daño`);
            if (window.spawnFloatingText && gameState.boss) {
                window.spawnFloatingText(gameState.boss.x, gameState.boss.y - 25, `💥 CRÍTICO x${st}! -${dmg}`, '#FBBF24');
            }
            gameState.screenShake = 0.8;
            XP.flash = 0.25;
        }
        baseDamageBoss(dmg);
    };

    // -------------------------------------------------------------------------
    // 6. SIGILO: CQC, NULL, CORRER, BURBUJAS, CUERPOS
    // -------------------------------------------------------------------------
    const baseRay = window.isRayBlockedByWalls;
    window.isRayBlockedByWalls = function (x1, y1, x2, y2, walls) {
        const room = facilityRooms[gameState.currentRoomId];
        if (XP.chaffTimer > 0 && room && !room.hasBoss) return true;
        return baseRay(x1, y1, x2, y2, walls);
    };

    function angleDiff(a, b) {
        let d = Math.abs(a - b) % (Math.PI * 2);
        return d > Math.PI ? Math.PI * 2 - d : d;
    }

    function tryCQC() {
        const room = facilityRooms[gameState.currentRoomId];
        const p = gameState.player;
        if (!room || !room.guards || p.inBox) return;
        if (isOpen('hack-screen') || isOpen('codec-screen')) return;
        let best = null, bestD = 1e9;
        room.guards.forEach(g => {
            const d = Math.hypot(p.x - g.x, p.y - g.y);
            if (d < p.radius + g.radius + 18 && d < bestD) { best = g; bestD = d; }
        });
        if (!best) { playTone(160, 0.05, 'triangle', 0.06); return; }
        const angToPlayer = Math.atan2(p.y - best.y, p.x - best.x);
        const seen = angleDiff(angToPlayer, best.angle) < best.fov / 2 && gameState.alertState === 'alert';
        if (seen) {
            showToast('¡TE VIO VENIR! El CQC frontal en alerta no funciona.');
            playSFX('damage');
            takeDamage(8);
            return;
        }
        // ¡Neutralizado!
        best.sleep = 25;
        best._bubble = null;
        room.sleepers = room.sleepers || [];
        room.sleepers.push(best);
        room.guards = room.guards.filter(g => g !== best);
        XP.stats.cqc++;
        XP.freeze = 0.12;
        gameState.screenShake = 0.35;
        playTone(110, 0.08, 'sawtooth', 0.12);
        setTimeout(() => playTone(70, 0.15, 'square', 0.1), 70);
        showToast('🥋 CQC: guardia dormido 25s. ¡Que nadie lo vea tirado!');
        if (window.spawnFloatingText) window.spawnFloatingText(best.x, best.y - 14, '🥋 CQC SLEEP 25s', '#34D399');
    }

    function useChaff() {
        if (isOpen('hack-screen') || isOpen('codec-screen')) return;
        if (XP.chaff <= 0) { showToast('Sin granadas NULL. Resolvé terminales para conseguir más.'); playTone(160, 0.05, 'triangle', 0.06); return; }
        const room = facilityRooms[gameState.currentRoomId];
        if (room && room.hasBoss) { showToast('El jefe tiene blindaje anti-NULL. No surte efecto aquí.'); return; }
        XP.chaff--;
        XP.chaffTimer = 7;
        XP.stats.chaffUsed++;
        refreshChaffHud();
        gameState.soundWaves.push({ x: gameState.player.x, y: gameState.player.y, radius: 6, maxRadius: 420, alpha: 0.9 });
        for (let i = 0; i < 6; i++) setTimeout(() => playTone(200 + Math.random() * 1800, 0.05, 'sawtooth', 0.05), i * 40);
        showToast('💣 GRANADA NULL: referencias anuladas. Guardias ciegos y láseres caídos por 7s.');
        if (window.spawnFloatingText && gameState.player) {
            window.spawnFloatingText(gameState.player.x, gameState.player.y - 14, '💣 NULL JAMMING 7s', '#38BDF8');
        }
    }

    function noiseAt(x, y, radius) {
        const room = facilityRooms[gameState.currentRoomId];
        gameState.soundWaves.push({ x, y, radius: 4, maxRadius: radius, alpha: 0.5 });
        if (!room || !room.guards || gameState.alertState === 'alert') return;
        room.guards.forEach(g => {
            if (Math.hypot(x - g.x, y - g.y) < radius) {
                g.investigateTarget = { x, y };
                g.investigateTimer = 3.5;
                g.angle = Math.atan2(y - g.y, x - g.x);
                if (gameState.alertState !== 'alert') {
                    gameState.alertState = 'caution';
                    gameState.alertTimer = Math.max(gameState.alertTimer, 3.5);
                    const ab = $('alert-box'); if (ab) ab.className = 'alert-gauge active caution';
                    const tg = $('alert-tag'); if (tg) tg.textContent = '? PRECAUCIÓN';
                }
            }
        });
    }

    // Captura de teclado: tiene prioridad sobre el motor base
    window.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        if (isOpen('hack-screen')) {
            // Evita que [E]/[Espacio] reabran la terminal y deja tipear en BIT LOCK
            e.stopImmediatePropagation();
            if (!XP.bitlock && ['1', '2', '3', '4'].includes(key)) {
                const btns = document.querySelectorAll('#hack-options-list .hack-btn');
                const b = btns[Number(key) - 1];
                if (b && !b.disabled) b.click();
            }
            if (key === 'escape' && !XP.answered) {
                stopHackTimer();
                window.closeHackTerminal();
            }
            return;
        }
        if (isOpen('codec-screen') || isOpen('level-select-screen') || isOpen('debrief-screen')) return;
        if (key === 'q') { tryCQC(); }
        else if (key === 'g') { useChaff(); }
    }, true);

    // -------------------------------------------------------------------------
    // 7. DOG TAGS (coleccionables)
    // -------------------------------------------------------------------------
    const TRIVIA = [
        'Java nació en 1995 y se llamó primero "Oak" por un roble frente a la oficina de James Gosling.',
        'El bytecode .class empieza siempre con los bytes mágicos 0xCAFEBABE.',
        'Un int de Java ocupa 32 bits en TODAS las plataformas: write once, run anywhere.',
        'Integer.MAX_VALUE + 1 da Integer.MIN_VALUE: desbordamiento silencioso.',
        '0.1 + 0.2 en double NO da exactamente 0.3. Nunca compares doubles con ==.',
        'char es numérico: \'A\' + 1 vale 66.',
        'Un arreglo recién creado con new int[n] viene lleno de ceros.',
        'Los Strings son inmutables: s.toUpperCase() devuelve un String NUEVO.',
        'switch sobre Strings existe desde Java 7.',
        'El nombre "bug" se popularizó por una polilla real atrapada en la Mark II (1947).',
        'La búsqueda binaria sobre 1.000.000 de datos ordenados necesita como máximo 20 comparaciones.',
        'Bubble Sort hace en el peor caso n·(n-1)/2 comparaciones.',
        'En una matriz int[3][4], m.length es 3 y m[0].length es 4.',
        'El main es static porque la JVM lo invoca sin crear ningún objeto.',
        'Java pasa TODO por valor... incluso las referencias (se copia la dirección).'
    ];
    function ensureTag(room) {
        if (!room || room.hasBoss || room._tagInit) return;
        room._tagInit = true;
        XP.stats.tagsTotal++;
        for (let i = 0; i < 60; i++) {
            const x = R(70, 730), y = R(70, 380);
            if (!checkWallCollision(x, y, 18, room.walls || [])) {
                room._tag = { x, y, taken: false, text: pick(TRIVIA) };
                return;
            }
        }
        XP.stats.tagsTotal--;
    }

    // -------------------------------------------------------------------------
    // 8. ENVOLTURA DEL UPDATE
    // -------------------------------------------------------------------------
    const baseUpdate = window.updateGame;
    const SWAP = { w: 's', s: 'w', a: 'd', d: 'a', arrowup: 'arrowdown', arrowdown: 'arrowup', arrowleft: 'arrowright', arrowright: 'arrowleft' };

    window.updateGame = function (dt) {
        dt = Math.min(dt || 0, 0.05);
        const room = facilityRooms[gameState.currentRoomId];
        const p = gameState.player;
        const paused = isOpen('codec-screen') || isOpen('hack-screen') || isOpen('level-select-screen') || gameState.missionCompleted;

        if (room) ensureTag(room);

        if (XP.freeze > 0) { XP.freeze -= dt; return; }
        if (XP.flash > 0) XP.flash -= dt;
        if (typeof updateFloatingTexts === 'function') updateFloatingTexts(dt);

        if (!paused && room) {
            XP.chaffTimer = Math.max(0, XP.chaffTimer - dt);
            XP.invert = Math.max(0, XP.invert - dt);

            // Despertar guardias dormidos / descubrir cuerpos
            if (room.sleepers && room.sleepers.length) {
                room.sleepers.slice().forEach(sg => {
                    sg.sleep -= dt;
                    let discovered = false;
                    if (XP.chaffTimer <= 0) {
                        (room.guards || []).forEach(g => {
                            const d = Math.hypot(sg.x - g.x, sg.y - g.y);
                            if (d < g.viewDist * 0.85 && angleDiff(Math.atan2(sg.y - g.y, sg.x - g.x), g.angle) < g.fov / 2 &&
                                !baseRay(g.x, g.y, sg.x, sg.y, room.walls)) discovered = true;
                        });
                    }
                    if (sg.sleep <= 0 || discovered) {
                        room.sleepers = room.sleepers.filter(x => x !== sg);
                        room.guards.push(sg);
                        sg.investigateTarget = { x: p.x, y: p.y };
                        sg.investigateTimer = 3;
                        sg._bubble = { ch: discovered ? '!' : '?', t: 1.4 };
                        if (discovered) {
                            showToast('¡HOMBRE CAÍDO! Un centinela encontró a su compañero dormido.');
                            triggerAlert();
                        }
                    }
                });
            }

            // Correr [SHIFT] = más velocidad, pero hace ruido
            const moving = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => gameState.keys[k]);
            const sprinting = gameState.keys['shift'] && moving && !p.inBox;
            if (sprinting) {
                XP.sprintNoise -= dt;
                if (XP.sprintNoise <= 0) { XP.sprintNoise = 0.45; noiseAt(p.x, p.y, 115); }
            }

            // Dog tag
            if (room._tag && !room._tag.taken && Math.hypot(p.x - room._tag.x, p.y - room._tag.y) < p.radius + 12) {
                room._tag.taken = true;
                XP.stats.tags++;
                playTone(988, 0.08, 'square', 0.08);
                setTimeout(() => playTone(1318, 0.12, 'square', 0.08), 90);
                showToast(`🏷 DOG TAG (${XP.stats.tags}): ${room._tag.text}`);
                if (typeof spawnFloatingText === 'function') spawnFloatingText(p.x, p.y - 14, `🏷 DOG TAG #${XP.stats.tags}`, '#FBBF24');
            }

            // Ejecutar motor base con modificadores temporales
            const savedSpeed = p.speed;
            if (sprinting) p.speed = savedSpeed * 1.6;
            let savedKeys = null;
            if (XP.invert > 0) {
                savedKeys = { ...gameState.keys };
                Object.keys(SWAP).forEach(k => { gameState.keys[k] = !!savedKeys[SWAP[k]]; });
            }
            let savedLasers = null;
            if (XP.chaffTimer > 0 && room.lasers) { savedLasers = room.lasers; room.lasers = []; }

            baseUpdate(dt);

            if (savedLasers) room.lasers = savedLasers;
            if (savedKeys) gameState.keys = Object.assign(gameState.keys, savedKeys);
            p.speed = savedSpeed;
        } else {
            baseUpdate(dt);
        }

        // Transición a alerta: ¡!, hit-stop y flash
        if (gameState.alertState === 'alert' && XP.prevAlert !== 'alert') {
            XP.stats.alarms++;
            XP.freeze = 0.35;
            XP.flash = 0.35;
            (room && room.guards || []).forEach(g => { g._bubble = { ch: '!', t: 1.3 }; });
        }
        XP.prevAlert = gameState.alertState;

        // Burbujas "?" para quien investiga
        (room && room.guards || []).forEach(g => {
            if (g.investigateTimer > 0 && gameState.alertState !== 'alert' && !g._bubble) g._bubble = { ch: '?', t: 1.2 };
            if (g._bubble) { g._bubble.t -= dt; if (g._bubble.t <= 0) g._bubble = null; }
        });
    };

    // -------------------------------------------------------------------------
    // 9. ENVOLTURA DEL DRAW (capas extra)
    // -------------------------------------------------------------------------
    const baseDraw = window.draw;
    window.draw = function () {
        baseDraw();
        const room = facilityRooms[gameState.currentRoomId];
        if (!room) return;
        const p = gameState.player;
        const t = performance.now() / 1000;
        ctx.save();

        // Dog tag
        if (room._tag && !room._tag.taken) {
            const bob = Math.sin(t * 3) * 3;
            ctx.save();
            ctx.translate(room._tag.x, room._tag.y + bob);
            ctx.rotate(Math.sin(t * 2) * 0.3);
            ctx.shadowColor = '#fbbf24'; ctx.shadowBlur = 12;
            ctx.fillStyle = '#cbd5e1';
            ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-6, -9, 12, 18, 4) : ctx.rect(-6, -9, 12, 18); ctx.fill();
            ctx.fillStyle = '#334155'; ctx.fillRect(-3, -4, 6, 1.5); ctx.fillRect(-3, 0, 6, 1.5);
            ctx.restore();
        }

        // Guardias dormidos
        (room.sleepers || []).forEach(g => {
            ctx.save();
            ctx.translate(g.x, g.y);
            ctx.rotate(Math.PI / 2);
            ctx.fillStyle = '#475569';
            ctx.beginPath(); ctx.ellipse(0, 0, g.radius * 1.2, g.radius * 0.6, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#94a3b8';
            ctx.beginPath(); ctx.arc(g.radius * 1.1, 0, g.radius * 0.45, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            ctx.fillStyle = '#93c5fd';
            ctx.font = 'bold 12px Share Tech Mono';
            const z = Math.floor(t * 2) % 3;
            ctx.fillText('z'.repeat(z + 1).toUpperCase(), g.x + 10, g.y - 14 - z * 3);
            // Barra de sueño
            ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(g.x - 14, g.y + 16, 28, 3);
            ctx.fillStyle = '#93c5fd'; ctx.fillRect(g.x - 14, g.y + 16, 28 * Math.max(0, g.sleep / 25), 3);
        });

        // Burbujas ! y ?
        (room.guards || []).forEach(g => {
            if (!g._bubble) return;
            const ch = g._bubble.ch;
            const pop = Math.min(1, (1.4 - g._bubble.t) * 8);
            ctx.save();
            ctx.translate(g.x, g.y - g.radius - 18);
            ctx.scale(pop, pop);
            ctx.fillStyle = ch === '!' ? '#ff2a2a' : '#fbbf24';
            ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14;
            ctx.font = 'bold 26px Share Tech Mono';
            ctx.textAlign = 'center';
            ctx.fillText(ch, 0, 8);
            ctx.restore();
        });

        // Láseres en interferencia
        if (XP.chaffTimer > 0) {
            ctx.fillStyle = `rgba(56,189,248,${0.05 + Math.random() * 0.05})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < 40; i++) {
                ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`;
                ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, R(2, 18), 1);
            }
            ctx.fillStyle = '#38bdf8';
            ctx.font = 'bold 11px Share Tech Mono';
            ctx.textAlign = 'left';
            ctx.fillText(`NULL ACTIVO // ${XP.chaffTimer.toFixed(1)}s`, 14, canvas.height - 14);
        }

        // Viñeta táctica centrada en el jugador
        const g = ctx.createRadialGradient(p.x, p.y, 90, p.x, p.y, 520);
        const alertTint = gameState.alertState === 'alert' ? '60,0,0' : '0,0,0';
        g.addColorStop(0, `rgba(${alertTint},0)`);
        g.addColorStop(1, `rgba(${alertTint},0.55)`);
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Flash de detección
        if (XP.flash > 0) {
            ctx.fillStyle = `rgba(255,42,42,${XP.flash})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Controles invertidos (Mantis)
        if (XP.invert > 0) {
            ctx.fillStyle = '#c084fc';
            ctx.font = 'bold 13px Share Tech Mono';
            ctx.textAlign = 'center';
            ctx.fillText(`🌀 CONTROLES INVERTIDOS ${XP.invert.toFixed(1)}s`, canvas.width / 2, 70);
        }

        // Mini HUD inferior derecho
        const s = XP.stats;
        ctx.textAlign = 'right';
        ctx.font = '10px Share Tech Mono';
        ctx.fillStyle = 'rgba(0,255,102,0.8)';
        const secs = Math.floor((performance.now() - s.start) / 1000);
        ctx.fillText(`T ${String(Math.floor(secs / 60)).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}  ALR ${s.alarms}  CQC ${s.cqc}  TAGS ${s.tags}/${s.tagsTotal}${s.streak >= 2 ? '  COMBO x' + s.streak : ''}`, canvas.width - 12, canvas.height - 10);

        // Indicador de sprint
        if (gameState.keys['shift'] && !p.inBox) {
            ctx.textAlign = 'center';
            ctx.fillStyle = 'rgba(251,191,36,0.85)';
            ctx.fillText('CORRIENDO // RUIDO', p.x, p.y + p.radius + 16);
        }

        // FX Textos Flotantes Tácticos (Arcade Hits)
        try {
            if (typeof renderFloatingTexts === 'function') renderFloatingTexts(ctx);
        } catch (e) {}

        ctx.restore();
    };

    // -------------------------------------------------------------------------
    // 10. CICLO DE MISIÓN: reset, rango, récords
    // -------------------------------------------------------------------------
    const baseLoadLevel = window.loadLevel;
    window.loadLevel = function (idx, resetPlayer) {
        baseLoadLevel(idx, resetPlayer);
        if (resetPlayer !== false) {
            XP.stats = freshStats();
            XP.chaff = 1;
            XP.chaffTimer = 0;
            XP.invert = 0;
            XP.mantisDone = false;
            refreshChaffHud();
        }
        XP.prevAlert = 'normal';
        if (typeof campaignLevels !== 'undefined') {
            cleanQuestionSet(campaignLevels[idx].terminals);
            cleanQuestionSet(campaignLevels[idx].bossBeacons);
        }
    };

    const RANKS = [
        [100, 'BIG BOSS', '🐍'], [92, 'FOXHOUND', '🦊'], [84, 'FOX', '🦊'], [76, 'DOBERMAN', '🐕'],
        [68, 'HOUND', '🐺'], [58, 'JACKAL', '🐾'], [48, 'PIGEON', '🕊'], [36, 'HIPPOPOTAMUS', '🦛'], [0, 'CHICKEN', '🐔']
    ];
    function computeRank() {
        const s = XP.stats;
        const secs = (performance.now() - s.start) / 1000;
        const par = 240 + currentLevelIndex * 90;
        let score = 100;
        score -= Math.min(45, s.alarms * 9);
        score -= s.errors * 6;
        score -= s.timeouts * 3;
        score -= Math.min(20, Math.max(0, (secs - par) / 15));
        score -= (XP.retries[currentLevelIndex] || 0) * 8;
        score += s.tags * 3 + Math.min(6, s.bestStreak);
        if (s.alarms === 0 && s.errors === 0) score = Math.max(score, 100);
        score = Math.round(Math.max(0, Math.min(110, score)));
        let r = RANKS.find(([min]) => score >= min);
        if (r[1] === 'BIG BOSS' && (s.alarms > 0 || s.errors > 0)) r = RANKS[1];
        return { score, name: r[1], icon: r[2], secs };
    }

    const baseDebrief = window.showDebriefing;
    window.showDebriefing = function (won) {
        stopHackTimer();
        baseDebrief(won);
        const s = XP.stats;
        const desc = $('debrief-desc');
        const rankEl = $('debrief-rank');
        if (!won) {
            XP.retries[currentLevelIndex] = (XP.retries[currentLevelIndex] || 0) + 1;
            return;
        }
        const r = computeRank();
        const mm = String(Math.floor(r.secs / 60)).padStart(2, '0'), ss = String(Math.floor(r.secs % 60)).padStart(2, '0');
        const weak = Object.entries(s.topicErrors).sort((a, b) => b[1] - a[1]).slice(0, 3);
        desc.innerHTML = `${desc.innerText}
            <div class="xp-stats">
                <div class="xp-stat"><b>${mm}:${ss}</b><span>TIEMPO</span></div>
                <div class="xp-stat"><b>${s.alarms}</b><span>ALARMAS</span></div>
                <div class="xp-stat"><b>${s.correct}/${s.correct + s.errors}</b><span>HACKS OK</span></div>
                <div class="xp-stat"><b>x${s.bestStreak}</b><span>MEJOR COMBO</span></div>
                <div class="xp-stat"><b>${s.cqc}</b><span>CQC</span></div>
                <div class="xp-stat"><b>${s.tags}/${s.tagsTotal}</b><span>DOG TAGS</span></div>
                <div class="xp-stat"><b>${s.chaffUsed}</b><span>NULL USADAS</span></div>
                <div class="xp-stat"><b>${r.score}</b><span>PUNTAJE</span></div>
            </div>
            ${weak.length ? `<div class="xp-weak">⚠ REPASAR: ${weak.map(([t, n]) => `${t} (${n})`).join(' · ')}</div>` : '<div class="xp-weak" style="color:#86efac">✔ Sin errores conceptuales registrados. Impecable.</div>'}`;
        rankEl.innerHTML = `<div class="xp-rank-big">${r.icon} ${r.name}</div><div style="font-size:10px;opacity:.7">CODENAME OBTENIDO // PUNTAJE ${r.score}</div>`;
        playTone(523, 0.12, 'square', 0.08);
        setTimeout(() => playTone(659, 0.12, 'square', 0.08), 140);
        setTimeout(() => playTone(784, 0.25, 'square', 0.08), 280);

        try {
            const prev = JSON.parse(localStorage.getItem(LS_RANK + currentLevelIndex) || 'null');
            if (!prev || r.score > prev.score) {
                localStorage.setItem(LS_RANK + currentLevelIndex, JSON.stringify({ score: r.score, name: r.name, icon: r.icon }));
                setTimeout(() => showToast('🏆 ¡NUEVO RÉCORD PERSONAL EN ESTA MISIÓN!'), 900);
            }
        } catch (e) { /* almacenamiento no disponible */ }
        XP.retries[currentLevelIndex] = 0;
    };

    const baseRenderCards = window.renderLevelCards;
    window.renderLevelCards = function () {
        baseRenderCards();
        document.querySelectorAll('#level-cards-container .level-card').forEach((card, i) => {
            try {
                const best = JSON.parse(localStorage.getItem(LS_RANK + i) || 'null');
                if (best) {
                    const d = document.createElement('div');
                    d.className = 'xp-card-rank';
                    d.textContent = `MEJOR RANGO: ${best.icon} ${best.name} (${best.score})`;
                    card.appendChild(d);
                }
            } catch (e) { /* noop */ }
        });
    };

    // -------------------------------------------------------------------------
    // 11. CODEC: tutorial de equipo nuevo + PSYCHO MANTIS
    // -------------------------------------------------------------------------
    codecScripts.xp_tutorial = [
        { speaker: 'CORONEL', text: 'Solid Byte, I+D de la cátedra actualizó tu equipo para la Operación Outer Heaven. Prestá atención.' },
        { speaker: 'CORONEL', text: '[SHIFT] para correr: sos más rápido, pero tus pasos hacen RUIDO y los centinelas van a investigar.' },
        { speaker: 'CORONEL', text: '[Q] CQC: acercate POR LA ESPALDA y dormí al guardia 25 segundos. Si otro centinela lo ve tirado... alarma general.' },
        { speaker: 'CORONEL', text: '[G] Granada NULL: anula la visión de los guardias y los láseres por 7 segundos. Cada terminal resuelta te da una más.' },
        { speaker: 'CORONEL', text: 'Las terminales ahora tienen TIEMPO LÍMITE y podés responder con las teclas 1-4. Y las balizas de los jefes usan cerraduras BIT LOCK: tenés que tipear el resultado exacto del código. No hay opciones que adivinar.' },
        { speaker: 'CORONEL', text: 'Encadená 3 respuestas correctas y tu próximo golpe al reactor será CRÍTICO. Y buscá las DOG TAGS escondidas: tu rango final depende de todo esto. Cambio y fuera.' }
    ];

    // -------------------------------------------------------------------------
    // 12. SISTEMA DE DIÁLOGOS DINÁMICOS & HUMOR TÁCTICO POR EL CODEC
    // -------------------------------------------------------------------------
    const codecDialogRotations = { coronel: 0, enlace: 0, capitan: 0, logica: 0, debugging: 0, algoritmos: 0 };

    function getDynamicCodecConversation(contactId) {
        const p = gameState.player;
        const isBox = p && p.inBox;
        const isLowHp = p && p.hp < 35;
        const isAlert = gameState.alertState === 'alert';

        if (isBox) {
            if (contactId === 'coronel') {
                return [
                    { speaker: 'SOLID BYTE', text: 'Coronel, me metí en una caja de cartón rotulada JAVA.ZIP.' },
                    { speaker: 'CORONEL', text: '¿Una caja de cartón? ¿Para qué, Byte?' },
                    { speaker: 'SOLID BYTE', text: 'No lo sé, Coronel... Sentí un llamado. Es cómoda, oscura y nadie me hace preguntas de compilación acá adentro. Es como estar encapsulado en un paquete privado sin dependencias externas.' },
                    { speaker: 'CORONEL', text: 'Byte, no te pongas filosófico. Si un centinela te ve moverte con la caja puesta, va a disparar primero y preguntar después. Mantenete quieto si pasan cerca. Cambio y fuera.' }
                ];
            } else if (contactId === 'capitan') {
                return [
                    { speaker: 'CAPITÁN', text: 'Solid Byte, ¿qué clase de diseño modular es esconderse bajo una caja?' },
                    { speaker: 'SOLID BYTE', text: 'Capitán, es una clase autocontenida. Entrada: sigilo. Salida: supervivencia.' },
                    { speaker: 'CAPITÁN', text: 'Mientras no rompas el principio de responsabilidad única ni tengas acoplamiento con los centinelas, te lo permito. Avanzá con sigilo.' }
                ];
            }
        }

        if (isAlert) {
            if (contactId === 'coronel') {
                return [
                    { speaker: 'CORONEL', text: '¡Solid Byte! ¡Tenés la alarma al rojo vivo en toda la subestación! ¿Por qué estás llamando por radio ahora?' },
                    { speaker: 'SOLID BYTE', text: '¡Tengo centinelas pisándome los talones!' },
                    { speaker: 'CORONEL', text: '¡Corré con [SHIFT] y doblá en la primera esquina para romper su línea de visión! Si estás acorralado, lanzá una granada NULL [G] o dormí al más cercano con CQC [Q]. ¡Cierro enlace!' }
                ];
            } else if (contactId === 'debugging') {
                return [
                    { speaker: 'TUTOR DE DEBUGGING // LAB', text: '¡Oye, asere! ¡Te tienen acorrala\'o como en novena entrada con dos outs!' },
                    { speaker: 'TUTOR DE DEBUGGING // LAB', text: '¡No te quedes parado ahí! Suéltales una granada NULL con la tecla [G] para anularles sus referencias visuales por 7 segundos y correte detrás de un muro perimetral.' }
                ];
            }
        }

        if (isLowHp) {
            if (contactId === 'enlace') {
                return [
                    { speaker: 'TUTORA DE ENLACE // SYS', text: '¡Solid Byte, atención! Tus constantes vitales cayeron por debajo del 35% de vida.' },
                    { speaker: 'SOLID BYTE', text: '¿El sistema no tiene un recolector de basura que me cure las heridas?' },
                    { speaker: 'TUTORA DE ENLACE // SYS', text: '¡El Garbage Collector solo libera memoria de objetos sin referencias en el Heap, no parcha balazos! Buscá una ración de café o vas a terminar arrojando un FatalError irrecuperable.' }
                ];
            }
        }

        const pools = {
            coronel: [
                [
                    { speaker: 'CORONEL', text: 'Solid Byte, recordá la regla de oro del sigilo: el sonido viaja.' },
                    { speaker: 'CORONEL', text: 'Al correr con [SHIFT] te desplazás un 60% más rápido, pero tus botas hacen ruido contra el suelo metálico. Los centinelas en las inmediaciones van a investigar la fuente del sonido con curiosidad (?).' },
                    { speaker: 'SOLID BYTE', text: 'Entendido. Caminar normal para no dejar huellas acústicas, correr solo para escapar o reposicionar.' }
                ],
                [
                    { speaker: 'CORONEL', text: 'En 1953 nació la Universidad Obrera Nacional en Santa Fe. Hoy, sus servidores albergan las actas de examen de toda la carrera.' },
                    { speaker: 'CORONEL', text: 'El malware que infectó estos sistemas intenta corromper las notas de SAO y AEDD. Si fallás, miles de alumnos van a tener que recursar en verano.' },
                    { speaker: 'SOLID BYTE', text: 'No en mi guardia, Coronel. Ese código va a quedar limpio antes de que cierre la mesa de examen.' }
                ],
                [
                    { speaker: 'SOLID BYTE', text: 'Coronel, encontré una ración de café en el laboratorio. Huele sospechosamente al cortado de la cantina de la facultad.' },
                    { speaker: 'CORONEL', text: 'Es el legendario café de la cantina central, Byte. Destilado a alta presión con 100% cafeína pura. Te restaura 50 puntos de vida de un solo trago.' },
                    { speaker: 'SOLID BYTE', text: 'Casi puedo escuchar las charlas de pasillo sobre el recuperatorio del segundo parcial...' }
                ]
            ],
            enlace: [
                [
                    { speaker: 'TUTORA DE ENLACE // SYS', text: 'Solid Byte, en esta frecuencia (140.96) podés gestionar la persistencia de tu misión en la memoria flash de tu navegador.' },
                    { speaker: 'TUTORA DE ENLACE // SYS', text: 'Al presionar "GUARDAR CHECKPOINT", respaldamos tu posición, vida, tarjetas de seguridad y terminales resueltas en localStorage. ¡Aprovechalo antes de entrar a las arenas de los jefes!' }
                ],
                [
                    { speaker: 'TUTORA DE ENLACE // SYS', text: 'En Java, la memoria se divide principalmente en Stack (pila de ejecución) y Heap (memoria dinámica).' },
                    { speaker: 'TUTORA DE ENLACE // SYS', text: 'Las variables locales y llamadas a métodos viven en el Stack de forma ordenada. Los objetos complejos y arreglos viven en el Heap. Si llenás el Stack con recursión infinita... ¡StackOverflowError!' },
                    { speaker: 'SOLID BYTE', text: 'Una lección clara: siempre definir un caso base sólido antes de llamar recursivamente.' }
                ],
                [
                    { speaker: 'TUTORA DE ENLACE // SYS', text: '"Quien no guarda sus fuentes antes de compilar, aprenderá a programar dos veces". Nunca olvides commitear tus cambios en Git, Byte.' }
                ]
            ],
            capitan: [
                [
                    { speaker: 'CAPITÁN', text: 'La metodología Top-Down de la Unidad 4 exige descomponer un problema complejo en submódulos pequeños y manejables.' },
                    { speaker: 'CAPITÁN', text: 'En vez de escribir un método "main" de 300 líneas incomprensible, creá métodos "public static" especializados: "cargarDatos()", "procesarCalculos()", "mostrarResultados()".' },
                    { speaker: 'SOLID BYTE', text: 'Divide y reinarás. Claridad conceptual ante todo.' }
                ],
                [
                    { speaker: 'CAPITÁN', text: 'Ojo con los nombres de variables y métodos en tus entregas, Byte.' },
                    { speaker: 'CAPITÁN', text: 'Nada de "int a, b, c, aux2, coso;". Usá identificadores autodocumentados: "cantEstudiantes", "totalSueldos", "promedioGeneral". Tu yo del futuro te lo va a agradecer cuando tengas que debugear a las 3 AM.' }
                ],
                [
                    { speaker: 'CAPITÁN', text: 'Recordá que en Java todos los parámetros primitivos se pasan estrictamente POR VALOR (por copia).' },
                    { speaker: 'CAPITÁN', text: 'Si dentro de un método modificás el parámetro "n = n * 2;", la variable original que pasaste desde el main NO cambia en lo absoluto. Su frame en el Call Stack es completamente independiente.' }
                ]
            ],
            logica: [
                [
                    { speaker: 'TUTORA DE LÓGICA // LAB', text: 'Solid Byte, repasemos el cortocircuito lógico con los operadores "&&" (AND) y "||" (OR).' },
                    { speaker: 'TUTORA DE LÓGICA // LAB', text: 'Si evaluás "(divisor != 0 && total / divisor > 10)", y divisor vale 0, la primera condición es falsa. Java NUNCA evalúa la segunda parte, protegiéndote de una ArithmeticException de división por cero.' },
                    { speaker: 'SOLID BYTE', text: 'Una muralla lógica elegante. El orden de los factores sí altera el resultado cuando hay excepciones.' }
                ],
                [
                    { speaker: 'TUTORA DE LÓGICA // LAB', text: 'Cuidado con los tipos primitivos numéricos en la Unidad 1 y 2.' },
                    { speaker: 'TUTORA DE LÓGICA // LAB', text: '"byte" va de -128 a 127 (8 bits), "int" usa 32 bits y "long" 64 bits. Si intentás asignar un int a un short sin casting "(short) x", el compilador javac te va a rebotar el código por pérdida de precisión.' }
                ],
                [
                    { speaker: 'TUTORA DE LÓGICA // LAB', text: 'El operador condicional ternario "condicion ? valorSiVerdadero : valorSiFalso" es muy útil para asignaciones concisas, pero no abuses anidando varios porque arruinás la legibilidad.' }
                ]
            ],
            debugging: [
                [
                    { speaker: 'TUTOR DE DEBUGGING // LAB', text: '¡Oye, asere! ¿Qué bola, mi hermano? Aquí en la trinchera del laboratorio.' },
                    { speaker: 'TUTOR DE DEBUGGING // LAB', text: 'Cuidado con el "==" cuando compares Strings. En Java "String a = \\"UTN\\"; String b = new String(\\"UTN\\");". Si haces "a == b" te va a dar FALSE porque compara posiciones de memoria en el Heap. ¡Usa siempre "a.equals(b)" o te botan del parcial cantao!' }
                ],
                [
                    { speaker: 'TUTOR DE DEBUGGING // LAB', text: '¡No te dejes engañar por el for traicionero! "for (int i = 0; i < 5; i++); { System.out.println(i); }". Ese punto y coma al final de la línea deja el cuerpo vacío y el bloque de abajo se ejecuta una sola vez. ¡Eso es una trampa mortal de compilador!' }
                ],
                [
                    { speaker: 'TUTOR DE DEBUGGING // LAB', text: 'Si los centinelas te tienen rodeado como en novena entrada con bases llenas, suéltales una granada NULL [G]. Mis algoritmos anulan sus referencias visuales por 7 segundos y puedes colarte por la compuerta como Pedro por su casa.' }
                ]
            ],
            algoritmos: [
                [
                    { speaker: 'TUTOR DE ALGORITMOS // LAB', text: 'Byte, en la Unidad 5 de arreglos, no confundas "capacidad física" con "elementos válidos".' },
                    { speaker: 'TUTOR DE ALGORITMOS // LAB', text: 'Si tu arreglo fue creado como "new int[100]" pero el usuario solo cargó 15 números, tu variable "tope" vale 15. Los bucles de búsqueda y recorrido deben iterar estrictamente "i < tope", ¡nunca hasta 100!' }
                ],
                [
                    { speaker: 'TUTOR DE ALGORITMOS // LAB', text: 'En matrices bidimensionales regulares, "matriz.length" te devuelve la cantidad de FILAS. Para saber las COLUMNAS de la primera fila, consultás "matriz[0].length".' },
                    { speaker: 'TUTOR DE ALGORITMOS // LAB', text: 'Recordá que Java maneja las matrices como "arreglos de arreglos". Si intentás acceder a "matriz[3][0]" en una matriz de 3 filas, vas a detonar un ArrayIndexOutOfBoundsException inmediato.' }
                ],
                [
                    { speaker: 'TUTOR DE ALGORITMOS // LAB', text: 'Para hacer el intercambio (swap) entre dos casilleros "v[i]" y "v[j]", la variable auxiliar "tmp" es innegociable: "int tmp = v[i]; v[i] = v[j]; v[j] = tmp;". Si omitís "tmp", el primer dato se sobreescribe y se pierde para siempre.' }
                ]
            ]
        };

        const contactPool = pools[contactId] || pools.coronel;
        const curIdx = codecDialogRotations[contactId] || 0;
        codecDialogRotations[contactId] = (curIdx + 1) % contactPool.length;
        return contactPool[curIdx];
    }

    const baseOpenCodec = window.openCodecDialog;
    window.openCodecDialog = function (key) {
        XP.lastCodecKey = key;
        baseOpenCodec(key);
        if (!key || key === 'call') {
            const contact = codecContacts[currentContactIndex];
            if (contact && !isMandatoryCodec) {
                currentCodecQueue = getDynamicCodecConversation(contact.id);
                currentCodecIndex = 0;
                renderCurrentCodecLine();
            }
        }
    };

    const baseTuneCodec = window.tuneCodecContact;
    window.tuneCodecContact = function (index) {
        baseTuneCodec(index);
        if (!isMandatoryCodec) {
            const contact = codecContacts[currentContactIndex];
            if (contact) {
                currentCodecQueue = getDynamicCodecConversation(contact.id);
                currentCodecIndex = 0;
                renderCurrentCodecLine();
            }
        }
    };

    const baseCloseCodec = window.closeCodecDialog;
    window.closeCodecDialog = function () {
        const last = XP.lastCodecKey;
        baseCloseCodec();
        XP.lastCodecKey = null;
        if (last === 'intro') {
            let seen = false;
            try { seen = localStorage.getItem(LS_TUTO) === '1'; localStorage.setItem(LS_TUTO, '1'); } catch (e) { /* noop */ }
            if (!seen) setTimeout(() => window.openCodecDialog('xp_tutorial'), 350);
            else setTimeout(() => showToast('[SHIFT] correr · [Q] CQC · [G] NULL · [1-4] responder'), 400);
        }
        if (last === 'boss_briefing_3' && !XP.mantisDone) {
            XP.mantisDone = true;
            setTimeout(startMantis, 500);
        }
    };

    function startMantis() {
        const s = XP.stats;
        const lines = [{ speaker: 'PSYCHO MANTIS', text: 'Ahhh... Solid Byte. Antes de que llegues a REX... déjame leer tu mente. Y tu caché.' }];
        const weak = Object.entries(s.topicErrors).sort((a, b) => b[1] - a[1])[0];
        if (weak) lines.push({ speaker: 'PSYCHO MANTIS', text: `Veo que «${weak[0]}» te costó ${weak[1]} ${weak[1] === 1 ? 'error' : 'errores'}. Tus neuronas tienen un off-by-one, ¿verdad?` });
        else lines.push({ speaker: 'PSYCHO MANTIS', text: '¿Ningún error en esta misión? Imposible... ¿Estudiaste? ¿O alguien te sopla las respuestas desde el fondo del aula?' });
        if (s.alarms > 0) lines.push({ speaker: 'PSYCHO MANTIS', text: `Activaste ${s.alarms} ${s.alarms === 1 ? 'alarma' : 'alarmas'}. Sigiloso como un System.out.println dentro de un bucle infinito.` });
        else lines.push({ speaker: 'PSYCHO MANTIS', text: 'Cero alarmas... Te movés como un comentario: nadie te lee.' });
        if (s.cqc > 0) lines.push({ speaker: 'PSYCHO MANTIS', text: `Dormiste a ${s.cqc} ${s.cqc === 1 ? 'centinela' : 'centinelas'}. Qué gesto tan... estático.` });
        try {
            const r0 = JSON.parse(localStorage.getItem(LS_RANK + '0') || 'null');
            if (r0) lines.push({ speaker: 'PSYCHO MANTIS', text: `Y en la primera misión obtuviste rango ${r0.name}... Interesante. Muy interesante.` });
        } catch (e) { /* noop */ }
        lines.push({ speaker: 'PSYCHO MANTIS', text: 'Ahora demostraré mi poder: cada vez que falles una baliza... ¡TUS CONTROLES SERÁN MÍOS!' });
        codecScripts.xp_mantis = lines;

        // Gag clásico del "cambio de canal"
        gag.style.display = 'block';
        playTone(60, 0.6, 'sawtooth', 0.05);
        setTimeout(() => {
            gag.style.display = 'none';
            document.body.classList.add('xp-glitch');
            window.openCodecDialog('xp_mantis');
            setTimeout(() => document.body.classList.remove('xp-glitch'), 1600);
        }, 1400);
    }

    // -------------------------------------------------------------------------
    // 13. FX TEXTOS FLOTANTES TÁCTICOS (ARCADE COMBAT TEXT)
    // -------------------------------------------------------------------------
    const floatingTexts = [];
    window.spawnFloatingText = function (x, y, text, color = '#00FF66') {
        try {
            floatingTexts.push({
                x, y,
                text,
                color,
                life: 1.15,
                maxLife: 1.15
            });
        } catch (e) {}
    };

    function updateFloatingTexts(dt) {
        try {
            for (let i = floatingTexts.length - 1; i >= 0; i--) {
                const ft = floatingTexts[i];
                ft.life -= dt;
                ft.y -= 22 * dt;
                if (ft.life <= 0) floatingTexts.splice(i, 1);
            }
        } catch (e) {}
    }

    function renderFloatingTexts(ctx) {
        try {
            if (!floatingTexts || !floatingTexts.length) return;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            floatingTexts.forEach(ft => {
                const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
                ctx.font = '700 12px "Share Tech Mono", monospace';
                ctx.fillStyle = ft.color;
                ctx.shadowColor = ft.color;
                ctx.shadowBlur = 8;
                ctx.globalAlpha = alpha;
                ctx.fillText(ft.text, ft.x, ft.y);
            });
            ctx.restore();
        } catch (e) {}
    }

    console.log('%c[METAL GEAR JAVA] Expansión Outer Heaven cargada', 'color:#00ff66');
})();
