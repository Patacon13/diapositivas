/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: PHYSICAL REACTIVITY & BIO-ECG MONITOR
 * Micro-detalles reactivos y bio-telemetría táctica de culto:
 *  - Vibración física y estallidos de polvo en rejillas metálicas al pisarlas.
 *  - Cables industriales colgantes con oscilación pendular catenaria.
 *  - Monitor Bio-Médico ECG (electrocardiograma con pulso cardíaco) en el HUD.
 * ============================================================================= */
(function() {
    'use strict';

    // Estado de las 4 rejillas de ventilación de la base
    const GRATES = [
        { x: 50, y: 50, w: 36, h: 24, vibrate: 0 },
        { x: 710, y: 50, w: 36, h: 24, vibrate: 0 },
        { x: 50, y: 370, w: 36, h: 24, vibrate: 0 },
        { x: 710, y: 370, w: 36, h: 24, vibrate: 0 }
    ];

    // Cables colgantes industriales en salas clave
    const CABLES = [
        { x1: 90, y1: 0, x2: 240, y2: 0, sag: 38, phase: 0 },
        { x1: 560, y1: 0, x2: 710, y2: 0, sag: 42, phase: 1.2 },
        { x1: 300, y1: 44, x2: 500, y2: 44, sag: 28, phase: 2.5 }
    ];

    const grateDust = [];
    let ecgBeatTimer = 0;

    // -------------------------------------------------------------------------
    // 1. FÍSICA REACTIVA DEL ENTORNO
    // -------------------------------------------------------------------------
    window.updateReactivity = function(dt) {
        const p = gameState.player;
        if (!p) return;

        const isMoving = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => gameState.keys[k]);

        // A. Detección de pisada en rejillas metálicas
        GRATES.forEach(grate => {
            if (grate.vibrate > 0) {
                grate.vibrate = Math.max(0, grate.vibrate - dt * 6.0);
            }

            const inGrate = p.x >= grate.x && p.x <= grate.x + grate.w &&
                            p.y >= grate.y && p.y <= grate.y + grate.h;

            if (inGrate && isMoving && grate.vibrate <= 0.1) {
                grate.vibrate = 1.0;
                if (window.playTone && !gameState.soundMuted) {
                    try { window.playTone(180, 0.03, 'triangle', 0.04); } catch(e){}
                }
                // Expulsar motas de polvo de óxido
                for (let i = 0; i < 4; i++) {
                    grateDust.push({
                        x: grate.x + Math.random() * grate.w,
                        y: grate.y + Math.random() * grate.h,
                        vx: (Math.random() - 0.5) * 1.2,
                        vy: - (0.8 + Math.random() * 1.4),
                        size: 1.2 + Math.random() * 1.5,
                        life: 0.45,
                        maxLife: 0.45
                    });
                }
            }
        });

        // B. Actualizar partículas de polvo de rejilla
        for (let i = grateDust.length - 1; i >= 0; i--) {
            const d = grateDust[i];
            d.x += d.vx;
            d.y += d.vy;
            d.life -= dt;
            if (d.life <= 0) grateDust.splice(i, 1);
        }

        // C. Oscilación pendular de cables colgantes
        CABLES.forEach(c => {
            const distToP = Math.hypot(p.x - (c.x1 + c.x2) / 2, p.y - c.y1);
            const playerImpulse = (distToP < 70 && isMoving) ? 0.08 : 0.015;
            c.phase += playerImpulse;
        });

        // D. Monitor Bio-ECG en el HUD
        const isCritical = p.hp < 35;
        const beatRate = isCritical ? 2.5 : 1.2;
        ecgBeatTimer += dt * beatRate;

        const lifeBar = document.getElementById('life-bar');
        if (lifeBar) {
            if (isCritical) {
                const flash = Math.sin(ecgBeatTimer * 8) > 0;
                lifeBar.style.backgroundColor = flash ? '#EF4444' : '#B91C1C';
                lifeBar.style.boxShadow = flash ? '0 0 12px #EF4444' : 'none';
            } else {
                lifeBar.style.backgroundColor = '#00FF66';
                lifeBar.style.boxShadow = '0 0 8px rgba(0, 255, 102, 0.4)';
            }
        }
    };

    // -------------------------------------------------------------------------
    // 2. RENDER DE CABLES Y REJILLAS VIBRANTES
    // -------------------------------------------------------------------------
    window.renderReactivityWorld = function(ctx) {
        ctx.save();

        // A. Rejillas metálicas reactivas con lamas y vibración física
        GRATES.forEach(grate => {
            const jx = grate.vibrate > 0 ? (Math.random() - 0.5) * grate.vibrate * 4 : 0;
            const jy = grate.vibrate > 0 ? (Math.random() - 0.5) * grate.vibrate * 4 : 0;

            ctx.save();
            ctx.translate(grate.x + jx, grate.y + jy);

            // Marco metálico
            ctx.fillStyle = '#06190F';
            ctx.fillRect(0, 0, grate.w, grate.h);
            ctx.strokeStyle = grate.vibrate > 0 ? '#38BDF8' : '#00FF66';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(0, 0, grate.w, grate.h);

            // Ranuras de ventilación (slits)
            ctx.strokeStyle = grate.vibrate > 0 ? '#6EE7B7' : '#0F5132';
            ctx.lineWidth = 1.5;
            for (let lx = 4; lx < grate.w - 2; lx += 4) {
                ctx.beginPath();
                ctx.moveTo(lx, 2);
                ctx.lineTo(lx, grate.h - 2);
                ctx.stroke();
            }

            // Remaches en esquinas
            ctx.fillStyle = '#10B981';
            ctx.fillRect(1.5, 1.5, 2, 2);
            ctx.fillRect(grate.w - 3.5, 1.5, 2, 2);
            ctx.fillRect(1.5, grate.h - 3.5, 2, 2);
            ctx.fillRect(grate.w - 3.5, grate.h - 3.5, 2, 2);

            ctx.restore();
        });

        // B. Cables colgantes con catenaria oscilante
        CABLES.forEach(c => {
            const swing = Math.sin(c.phase) * 6;
            const midX = (c.x1 + c.x2) / 2;
            const midY = (c.y1 + c.y2) / 2 + c.sag + swing;

            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = 2.4;
            ctx.beginPath();
            ctx.moveTo(c.x1, c.y1);
            ctx.quadraticCurveTo(midX, midY, c.x2, c.y2);
            ctx.stroke();

            // Sombra tenue del cable proyectada en el suelo
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(c.x1, c.y1 + 18);
            ctx.quadraticCurveTo(midX, midY + 18, c.x2, c.y2 + 18);
            ctx.stroke();
        });

        // C. Polvo de óxido saliendo de rejillas
        grateDust.forEach(d => {
            const alpha = Math.max(0, d.life / d.maxLife);
            ctx.fillStyle = `rgba(180, 83, 9, ${alpha * 0.75})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    };

    // Auto-hook a updateGame y draw
    const _baseUpdateGFX = window.updateGFXParticles;
    window.updateGFXParticles = function(dt) {
        if (_baseUpdateGFX) _baseUpdateGFX(dt);
        if (window.updateReactivity) window.updateReactivity(dt);
    };

    const _baseRenderParticles = window.renderGFXParticles;
    window.renderGFXParticles = function(ctx) {
        if (_baseRenderParticles) _baseRenderParticles(ctx);
        if (window.renderReactivityWorld) window.renderReactivityWorld(ctx);
    };

    console.log('%c[GFX] Módulo de Reactividad Física y Bio-ECG cargado.', 'color:#10b981');
})();
