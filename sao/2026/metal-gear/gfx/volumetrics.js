/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: VOLUMETRICS, SPARKS & HEAT HAZE
 * Efectos volumétricos y pirotecnia táctica de culto retro:
 *  - Dispersión volumétrica de Tyndall (polvo iluminado al cruzar láseres y linternas).
 *  - Chispas balísticas angulares y marcas de impacto en muros de hormigón.
 *  - Distorsión de calor térmico (Heat Haze Shimmer) en reactores de jefes y railguns.
 * ============================================================================= */
(function() {
    'use strict';

    const ambientDust = [];
    const ballisticSparks = [];
    const impactDecals = [];

    // Inicializar partículas de polvo ambiental suspendidas en la sala
    for (let i = 0; i < 35; i++) {
        ambientDust.push({
            x: Math.random() * 800,
            y: Math.random() * 450,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            size: 0.8 + Math.random() * 1.4,
            alpha: 0.15 + Math.random() * 0.25
        });
    }

    function distToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const l2 = dx * dx + dy * dy;
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    // -------------------------------------------------------------------------
    // 1. GENERADOR DE CHISPAS Y REBOTES BALÍSTICOS
    // -------------------------------------------------------------------------
    window.spawnBallisticImpact = function(x, y, normalX = 0, normalY = -1, count = 8) {
        impactDecals.push({
            x, y,
            radius: 2.5 + Math.random() * 2.0,
            life: 8.0,
            maxLife: 8.0
        });

        const baseAngle = Math.atan2(normalY, normalX);
        for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.5) * Math.PI * 0.8;
            const ang = baseAngle + spread;
            const spd = 2.0 + Math.random() * 4.5;
            ballisticSparks.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: 0.35 + Math.random() * 0.3,
                maxLife: 0.65,
                color: Math.random() < 0.6 ? '#FDE047' : '#F97316',
                size: 1.0 + Math.random() * 1.5
            });
        }
    };

    // -------------------------------------------------------------------------
    // 2. ACTUALIZACIÓN DE FÍSICA VOLUMÉTRICA
    // -------------------------------------------------------------------------
    window.updateVolumetrics = function(dt) {
        // A. Movimiento sutil del polvo atmosférico
        ambientDust.forEach(d => {
            d.x += d.vx;
            d.y += d.vy;
            if (d.x < 0) d.x = 800;
            if (d.x > 800) d.x = 0;
            if (d.y < 0) d.y = 450;
            if (d.y > 450) d.y = 0;
        });

        // B. Simulación balística de chispas
        for (let i = ballisticSparks.length - 1; i >= 0; i--) {
            const spk = ballisticSparks[i];
            spk.x += spk.vx;
            spk.y += spk.vy;
            spk.vy += dt * 3.5; // Gravedad leve hacia abajo
            spk.life -= dt;
            if (spk.life <= 0) ballisticSparks.splice(i, 1);
        }

        // C. Desvanecimiento de marcas en muros
        for (let i = impactDecals.length - 1; i >= 0; i--) {
            impactDecals[i].life -= dt;
            if (impactDecals[i].life <= 0) impactDecals.splice(i, 1);
        }

        // D. Spawnear chispas en colisión de proyectiles de jefe
        if (gameState.boss && gameState.boss.projectiles) {
            const walls = (facilityRooms[gameState.currentRoomId] || {}).walls || [];
            gameState.boss.projectiles.forEach(pr => {
                walls.forEach(w => {
                    if (pr.x >= w.x && pr.x <= w.x + w.w && pr.y >= w.y && pr.y <= w.y + w.h) {
                        if (Math.random() < 0.25) {
                            window.spawnBallisticImpact(pr.x, pr.y, 0, -1, 3);
                        }
                    }
                });
            });
        }
    };

    // -------------------------------------------------------------------------
    // 3. RENDER DE EFECTO TYNDALL, CHISPAS Y DISTORSIÓN TÉRMICA
    // -------------------------------------------------------------------------
    window.renderVolumetrics = function(ctx) {
        const room = facilityRooms[gameState.currentRoomId];
        if (!room) return;
        const now = performance.now() * 0.001;

        ctx.save();

        // 1. Decals de impacto en muros/suelo
        impactDecals.forEach(dec => {
            const alpha = Math.max(0, dec.life / dec.maxLife) * 0.5;
            ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
            ctx.beginPath();
            ctx.arc(dec.x, dec.y, dec.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.6})`;
            ctx.fillRect(dec.x - 1, dec.y - 1, 2, 2);
        });

        // 2. Chispas balísticas brillantes
        ballisticSparks.forEach(spk => {
            const alpha = Math.max(0, spk.life / spk.maxLife);
            ctx.save();
            ctx.fillStyle = spk.color;
            ctx.shadowColor = spk.color;
            ctx.shadowBlur = 6;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(spk.x, spk.y, spk.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 3. Dispersión Tyndall en Haces Láser (Segment Distance para ángulos arbitrarios)
        if (room.lasers) {
            room.lasers.forEach(laser => {
                const term = hackTerminals.find(t => t.id === laser.terminalId);
                const isBlocked = term ? !term.unlocked : true;
                if (!isBlocked) return;

                ambientDust.forEach(d => {
                    const dist = distToSegment(d.x, d.y, laser.x1, laser.y1, laser.x2, laser.y2);
                    if (dist < 12) {
                        ctx.save();
                        ctx.fillStyle = '#FFFFFF';
                        ctx.shadowColor = '#FF2A2A';
                        ctx.shadowBlur = 8;
                        ctx.beginPath();
                        ctx.arc(d.x, d.y, d.size * 1.8, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                });
            });
        }

        // 4. Distorsión de Calor Térmico (Heat Haze Shimmer) en Boss Cores
        if (room.hasBoss && gameState.boss && gameState.boss.hp > 0) {
            const boss = gameState.boss;
            const coreX = boss.x - (boss.type === 'vulcan' ? 40 : 0);
            const coreY = boss.y;
            const isHot = boss.state === 'stunned' || boss.laserSweeping;

            if (isHot) {
                const hazeCount = 5;
                ctx.save();
                for (let h = 0; h < hazeCount; h++) {
                    const waveOffset = (now * 6 + h * 0.8) % 35;
                    const waveWidth = 24 + h * 6;
                    const waveAlpha = Math.max(0, (1 - waveOffset / 35)) * 0.35;
                    const waveJitter = Math.sin(now * 14 + h) * 4;

                    ctx.strokeStyle = `rgba(255, 176, 0, ${waveAlpha})`;
                    ctx.lineWidth = 1.6;
                    ctx.beginPath();
                    ctx.moveTo(coreX - waveWidth / 2 + waveJitter, coreY - waveOffset);
                    ctx.quadraticCurveTo(coreX + waveJitter, coreY - waveOffset - 6, coreX + waveWidth / 2 + waveJitter, coreY - waveOffset);
                    ctx.stroke();
                }
                ctx.restore();
            }
        }

        ctx.restore();
    };

    // Auto-hook a updateGame y draw
    const _baseUpdateGFX = window.updateGFXParticles;
    window.updateGFXParticles = function(dt) {
        if (_baseUpdateGFX) _baseUpdateGFX(dt);
        if (window.updateVolumetrics) window.updateVolumetrics(dt);
    };

    const _baseRenderParticles = window.renderGFXParticles;
    window.renderGFXParticles = function(ctx) {
        if (_baseRenderParticles) _baseRenderParticles(ctx);
        if (window.renderVolumetrics) window.renderVolumetrics(ctx);
    };

    console.log('%c[GFX] Módulo de Dispersión Tyndall, Chispas Balísticas y Calor cargado.', 'color:#fbbf24');
})();
