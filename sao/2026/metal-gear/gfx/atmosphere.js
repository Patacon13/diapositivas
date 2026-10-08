/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: ATMOSPHERE & ARCTIC COLD SYSTEM
 * Inspirado en la atmósfera gélida de Shadow Moses (Metal Gear Solid 1998):
 *  - Condensación de respiración fría (vaho de Solid Byte y centinelas).
 *  - Charcos de refrigerante interactivos con ondas de superficie y salpicaduras.
 *  - Rastro de huellas húmedas tras atravesar fluidos.
 *  - Micro-vaho ambiental y polvo en suspensión iluminado.
 * ============================================================================= */
(function() {
    'use strict';

    const breathPuffs = [];
    const waterRipples = [];
    const wetFootprints = [];
    const snowFlakes = [];

    // Flurries de nieve ártica en suspensión (Shadow Moses Blizzard)
    for (let i = 0; i < 45; i++) {
        snowFlakes.push({
            x: Math.random() * 800,
            y: Math.random() * 450,
            vx: -0.8 - Math.random() * 1.5,
            vy: 0.3 + Math.random() * 0.7,
            size: 0.8 + Math.random() * 1.6,
            alpha: 0.25 + Math.random() * 0.55
        });
    }

    let playerBreathTimer = 1.0;
    let playerWetSteps = 0;
    let lastFootprintX = -999;
    let lastFootprintY = -999;
    const guardBreathTimers = new WeakMap();

    // Charcos interactivos por coordenadas de sala
    const PUDDLES = [
        { x: 210, y: 140, rx: 34, ry: 19 },
        { x: 540, y: 310, rx: 44, ry: 24 },
        { x: 380, y: 225, rx: 30, ry: 16 }
    ];

    function isInsideEllipse(px, py, cx, cy, rx, ry) {
        const dx = px - cx;
        const dy = py - cy;
        return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1.0;
    }

    // -------------------------------------------------------------------------
    // 1. SISTEMA DE RESPIRACIÓN Y VAHO ÁRTICO
    // -------------------------------------------------------------------------
    function emitBreathPuff(x, y, dir, isPlayer = false, isHeavy = false) {
        // La boca está desplazada unos píxeles al frente de la cabeza
        const mouthDist = isPlayer ? 8 : 7;
        const ox = x + Math.cos(dir) * mouthDist;
        const oy = y + Math.sin(dir) * mouthDist;

        const count = isHeavy ? 4 : 2;
        const baseSpeed = isHeavy ? 1.6 : 0.9;

        for (let i = 0; i < count; i++) {
            const spread = (Math.random() - 0.5) * 0.4;
            const puffAngle = dir + spread;
            const speed = baseSpeed * (0.8 + Math.random() * 0.4);

            breathPuffs.push({
                x: ox,
                y: oy,
                vx: Math.cos(puffAngle) * speed + (Math.random() - 0.5) * 0.2,
                vy: Math.sin(puffAngle) * speed + (Math.random() - 0.5) * 0.2 - 0.15, // Ligera elevación térmica
                size: 2.0 + Math.random() * 1.5,
                maxSize: 6.5 + Math.random() * 3.0,
                alpha: 0.55 + Math.random() * 0.2,
                maxLife: 1.1 + Math.random() * 0.4,
                life: 1.1 + Math.random() * 0.4
            });
        }
    }

    // -------------------------------------------------------------------------
    // 2. SISTEMA DE CHARCOS Y ONDAS DE FLUIDO
    // -------------------------------------------------------------------------
    function createWaterSplash(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 0.8 + Math.random() * 1.6;
            breathPuffs.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 1.2 + Math.random() * 1.2,
                maxSize: 0.5,
                alpha: 0.65,
                maxLife: 0.35,
                life: 0.35,
                isSplash: true
            });
        }
    }

    function triggerRipple(x, y, maxRadius = 24) {
        waterRipples.push({
            x, y,
            radius: 3,
            maxRadius,
            alpha: 0.65,
            speed: 38 + Math.random() * 12
        });
    }

    // -------------------------------------------------------------------------
    // ACTUALIZACIÓN DE FÍSICA ATMOSFÉRICA (dt)
    // -------------------------------------------------------------------------
    window.updateAtmosphere = function(dt) {
        const p = gameState.player;
        if (!p) return;

        const isMoving = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => gameState.keys[k]);
        const isSprinting = isMoving && gameState.keys['shift'] && !p.inBox;

        // A. Respiración de Solid Byte
        playerBreathTimer -= dt;
        if (playerBreathTimer <= 0) {
            emitBreathPuff(p.x, p.y, p.dir, true, isSprinting);
            // Si corre, jadea más rápido
            playerBreathTimer = isSprinting ? (0.8 + Math.random() * 0.4) : (2.4 + Math.random() * 1.2);
        }

        // B. Interacción con charcos (Solid Byte)
        let inPuddle = false;
        PUDDLES.forEach(puddle => {
            if (isInsideEllipse(p.x, p.y, puddle.x, puddle.y, puddle.rx, puddle.ry)) {
                inPuddle = true;
                if (isMoving && Math.random() < 0.28) {
                    triggerRipple(p.x, p.y, 20);
                    createWaterSplash(p.x, p.y, 3);
                }
            }
        });

        if (inPuddle) {
            playerWetSteps = 8; // Pasos húmedos restantes
        } else if (isMoving && !p.inBox && playerWetSteps > 0) {
            const distFromLastFp = Math.hypot(p.x - lastFootprintX, p.y - lastFootprintY);
            if (distFromLastFp >= 18) {
                playerWetSteps--;
                lastFootprintX = p.x;
                lastFootprintY = p.y;
                wetFootprints.push({
                    x: p.x,
                    y: p.y,
                    dir: p.dir,
                    life: 5.0,
                    maxLife: 5.0,
                    id: 'wfp_' + Math.random().toString(36).substr(2, 9)
                });
                if (wetFootprints.length > 50) wetFootprints.shift();
            }
        }

        // C. Respiración e interacción de Centinelas
        const room = facilityRooms[gameState.currentRoomId];
        if (room && room.guards) {
            room.guards.forEach(g => {
                let gTimer = guardBreathTimers.get(g) || (1.5 + Math.random() * 2);
                gTimer -= dt;
                if (gTimer <= 0) {
                    const alertState = gameState.alertState;
                    const isHeavy = alertState === 'alert' || g.investigateTimer > 0;
                    emitBreathPuff(g.x, g.y, g.angle, false, isHeavy);
                    gTimer = isHeavy ? (1.0 + Math.random() * 0.6) : (2.8 + Math.random() * 1.8);
                }
                guardBreathTimers.set(g, gTimer);

                // Pisadas de centinelas en charcos
                PUDDLES.forEach(puddle => {
                    if (isInsideEllipse(g.x, g.y, puddle.x, puddle.y, puddle.rx, puddle.ry)) {
                        if (Math.random() < 0.18) {
                            triggerRipple(g.x, g.y, 16);
                            createWaterSplash(g.x, g.y, 2);
                        }
                    }
                });
            });
        }

        // D. Actualizar motas de vaho y salpicaduras
        for (let i = breathPuffs.length - 1; i >= 0; i--) {
            const b = breathPuffs[i];
            b.x += b.vx;
            b.y += b.vy;
            b.life -= dt;
            const progress = 1.0 - (b.life / b.maxLife);
            b.size = b.size + (b.maxSize - b.size) * (dt * 1.8);
            b.alpha = (1.0 - progress) * (b.isSplash ? 0.7 : 0.5);

            if (b.life <= 0) breathPuffs.splice(i, 1);
        }

        // E. Actualizar ondas de fluido
        for (let i = waterRipples.length - 1; i >= 0; i--) {
            const rip = waterRipples[i];
            rip.radius += rip.speed * dt;
            rip.alpha = (1.0 - rip.radius / rip.maxRadius) * 0.65;
            if (rip.radius >= rip.maxRadius || rip.alpha <= 0) {
                waterRipples.splice(i, 1);
            }
        }

        // F. Actualizar huellas húmedas
        for (let i = wetFootprints.length - 1; i >= 0; i--) {
            wetFootprints[i].life -= dt;
            if (wetFootprints[i].life <= 0) wetFootprints.splice(i, 1);
        }

        // G. Actualizar partículas de nieve ártica
        snowFlakes.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            if (s.x < 0) s.x = 800;
            if (s.y > 450) s.y = 0;
        });
    };

    // -------------------------------------------------------------------------
    // RENDER: CHARCOS, ONDAS, HUELLAS HÚMEDAS Y NUBES DE VAHO
    // -------------------------------------------------------------------------
    window.renderAtmosphereFloor = function(ctx) {
        ctx.save();
        const now = performance.now() * 0.001;

        // 0. Render de TODOS los charcos de refrigerante activos
        PUDDLES.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);

            // Capa de fluido químico esmeralda/teal
            ctx.fillStyle = 'rgba(6, 78, 59, 0.35)';
            ctx.beginPath();
            ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, Math.PI * 2);
            ctx.fill();

            // Tensión superficial luminosa
            ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
            ctx.lineWidth = 1.3;
            ctx.stroke();

            // Reflejo especular cenital dinámico
            const shimmer = Math.sin(now * 2.2 + p.x * 0.1) * (p.rx * 0.18);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
            ctx.beginPath();
            ctx.ellipse(-p.rx * 0.25 + shimmer, -p.ry * 0.2, p.rx * 0.32, p.ry * 0.2, 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        // 1. Huellas húmedas con brillo reflectivo
        wetFootprints.forEach(fp => {
            const alpha = Math.max(0, fp.life / fp.maxLife);
            ctx.save();
            ctx.translate(fp.x, fp.y);
            ctx.rotate(fp.dir);
            ctx.fillStyle = `rgba(15, 76, 58, ${alpha * 0.45})`;
            ctx.fillRect(-3.5, -2.5, 7, 4.5);
            ctx.fillRect(-2, 2.5, 4, 3);
            // Reflejo húmedo especular central
            ctx.fillStyle = `rgba(167, 243, 208, ${alpha * 0.3})`;
            ctx.fillRect(-1.5, -1, 3, 2);
            ctx.restore();
        });

        // 2. Ondas concéntricas en la superficie del refrigerante
        waterRipples.forEach(rip => {
            ctx.save();
            ctx.strokeStyle = `rgba(45, 212, 191, ${Math.max(0, rip.alpha)})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.58, 0, 0, Math.PI * 2);
            ctx.stroke();

            // Segunda micro-onda concéntrica interna
            if (rip.radius > 6) {
                ctx.strokeStyle = `rgba(167, 243, 208, ${Math.max(0, rip.alpha * 0.4)})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.ellipse(rip.x, rip.y, rip.radius * 0.55, rip.radius * 0.32, 0, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        });

        ctx.restore();
    };

    // Render de nubes de vapor/vaho y ventisca de nieve
    window.renderAtmosphereOver = function(ctx) {
        ctx.save();

        // 1. Nieve ártica suspendida (Shadow Moses flurries)
        snowFlakes.forEach(s => {
            ctx.fillStyle = `rgba(224, 242, 254, ${s.alpha * 0.6})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // 2. Nubes de vaho por encima de los personajes
        breathPuffs.forEach(b => {
            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, b.alpha));
            if (b.isSplash) {
                ctx.fillStyle = '#2DD4BF';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Vaho frío blanco-azulado traslúcido
                const vahoGrad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.size);
                vahoGrad.addColorStop(0, 'rgba(224, 242, 254, 0.7)');
                vahoGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.35)');
                vahoGrad.addColorStop(1, 'rgba(186, 230, 253, 0)');
                ctx.fillStyle = vahoGrad;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
        ctx.restore();
    };

    // API pública para rastreo de huellas húmedas por la IA centinela
    window.getWetFootprints = function() {
        return wetFootprints;
    };

    window.spawnWetFootprint = function(x, y, dir = 0, life = 5.0) {
        const fp = {
            x, y, dir,
            life, maxLife: life,
            id: 'wfp_' + Math.random().toString(36).substr(2, 9)
        };
        wetFootprints.push(fp);
        return fp;
    };

    window.ATMOSPHERE = window.ATMOSPHERE || {};
    window.ATMOSPHERE.wetFootprints = wetFootprints;

    // Auto-hook en el pipeline de renderizado y actualización
    const _origUpdate = window.updateGFXParticles;
    window.updateGFXParticles = function(dt) {
        if (_origUpdate) _origUpdate(dt);
        if (window.updateAtmosphere) window.updateAtmosphere(dt);
    };

    const _origFloor = window.renderDecorFloor;
    window.renderDecorFloor = function(ctx) {
        if (_origFloor) _origFloor(ctx);
        if (window.renderAtmosphereFloor) window.renderAtmosphereFloor(ctx);
    };

    const _origParticles = window.renderGFXParticles;
    window.renderGFXParticles = function(ctx) {
        if (_origParticles) _origParticles(ctx);
        if (window.renderAtmosphereOver) window.renderAtmosphereOver(ctx);
    };

    console.log('%c[GFX] Módulo de Atmósfera y Vaho Ártico cargado.', 'color:#38bdf8');
})();
