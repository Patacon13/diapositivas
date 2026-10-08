/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: DYNAMIC LIGHTING & SHADOW RAYCASTING
 * Sistema de iluminación 2D en tiempo real:
 *  - Penumbra ambiental táctica (stealth mood)
 *  - Conos de linterna con recorte real contra muros (las luces no traspasan paredes)
 *  - Halo de visión periférica de Solid Byte
 *  - Balizas de emergencia estroboscópicas rojas en modo ALERTA
 *  - Resplandor emisivo de terminales, raciones y reactores de jefes
 * ============================================================================= */
(function() {
    'use strict';

    const lightCanvas = document.createElement('canvas');
    lightCanvas.width = 800;
    lightCanvas.height = 450;
    const lCtx = lightCanvas.getContext('2d');

    // Intersección rápida de rayo contra segmento de muro
    function getRayIntersection(px, py, dx, dy, x1, y1, x2, y2) {
        const r_px = px, r_py = py, r_dx = dx, r_dy = dy;
        const s_px = x1, s_py = y1, s_dx = x2 - x1, s_dy = y2 - y1;

        const r_mag = Math.hypot(r_dx, r_dy);
        const s_mag = Math.hypot(s_dx, s_dy);
        if (r_mag === 0 || s_mag === 0) return null;

        const denom = r_dx * s_dy - r_dy * s_dx;
        if (denom === 0) return null;

        const T2 = (r_dx * (s_py - r_py) + r_dy * (r_px - s_px)) / denom;
        const T1 = (s_px + s_dx * T2 - r_px) / (r_dx || 0.00001);

        if (T1 >= 0 && T2 >= 0 && T2 <= 1) {
            return T1; // Distancia escalada a lo largo de (dx, dy)
        }
        return null;
    }

    // Calcular distancia al muro más cercano en una dirección específica
    function castRayAgainstWalls(ox, oy, angle, maxDist, walls) {
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        let closestDist = maxDist;

        walls.forEach(w => {
            // Muro como 4 segmentos
            const segments = [
                [w.x, w.y, w.x + w.w, w.y],
                [w.x + w.w, w.y, w.x + w.w, w.y + w.h],
                [w.x + w.w, w.y + w.h, w.x, w.y + w.h],
                [w.x, w.y + w.h, w.x, w.y]
            ];

            segments.forEach(([x1, y1, x2, y2]) => {
                const t = getRayIntersection(ox, oy, dirX, dirY, x1, y1, x2, y2);
                if (t !== null && t < closestDist) {
                    closestDist = t;
                }
            });
        });

        return {
            x: ox + dirX * closestDist,
            y: oy + dirY * closestDist,
            dist: closestDist
        };
    }

    // -------------------------------------------------------------------------
    // RENDER PASS: ILUMINACIÓN DINÁMICA
    // -------------------------------------------------------------------------
    window.renderLightingPass = function(ctx) {
        const currentRoom = facilityRooms[gameState.currentRoomId];
        if (!currentRoom) return;

        const now = performance.now() * 0.001;

        // 1. Limpiar buffer de luz con penumbra suave (balance entre sigilo y claridad visual)
        let ambientAlpha = 0.38;
        let ambientColor = 'rgba(6, 14, 10, ';

        if (gameState.alertState === 'alert') {
            const strobe = Math.sin(now * 8) * 0.08;
            ambientAlpha = 0.32 + strobe;
            ambientColor = 'rgba(32, 6, 6, ';
        } else if (gameState.alertState === 'caution') {
            ambientAlpha = 0.35;
            ambientColor = 'rgba(22, 16, 6, ';
        }

        lCtx.globalCompositeOperation = 'source-over';
        lCtx.clearRect(0, 0, lightCanvas.width, lightCanvas.height);
        lCtx.fillStyle = ambientColor + ambientAlpha + ')';
        lCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);

        // 2. MODO "DESTINATION-OUT": Recortar fuentes de luz reales de la oscuridad
        lCtx.globalCompositeOperation = 'destination-out';

        // A. Halo de visión de Solid Byte (ampliado para mejor visibilidad)
        const p = gameState.player;
        const playerRadius = p.inBox ? 65 : 115;
        const pGlow = lCtx.createRadialGradient(p.x, p.y, 10, p.x, p.y, playerRadius);
        pGlow.addColorStop(0, 'rgba(0, 0, 0, 0.98)');
        pGlow.addColorStop(0.7, 'rgba(0, 0, 0, 0.7)');
        pGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        lCtx.fillStyle = pGlow;
        lCtx.beginPath();
        lCtx.arc(p.x, p.y, playerRadius, 0, Math.PI * 2);
        lCtx.fill();

        // B. Linternas de Centinelas con Shadow Raycasting (Polígono de visibilidad)
        if (currentRoom.guards) {
            currentRoom.guards.forEach(g => {
                const fov = g.fov || (Math.PI * 0.45);
                const viewDist = (g.viewDist || 155) * 1.15;
                const numRays = 18;
                const startAngle = g.angle - fov / 2;
                const step = fov / (numRays - 1);

                lCtx.save();
                lCtx.beginPath();
                lCtx.moveTo(g.x, g.y);

                for (let i = 0; i < numRays; i++) {
                    const ang = startAngle + i * step;
                    const hit = castRayAgainstWalls(g.x, g.y, ang, viewDist, currentRoom.walls || []);
                    lCtx.lineTo(hit.x, hit.y);
                }
                lCtx.closePath();

                const flashGrad = lCtx.createRadialGradient(g.x, g.y, 6, g.x, g.y, viewDist);
                flashGrad.addColorStop(0, 'rgba(0, 0, 0, 1)');
                flashGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.85)');
                flashGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

                lCtx.fillStyle = flashGrad;
                lCtx.fill();
                lCtx.restore();
            });
        }

        // C. Resplandor de Terminales de Seguridad
        if (currentRoom.terminals) {
            currentRoom.terminals.forEach(term => {
                const tx = term.x + term.w / 2;
                const ty = term.y + term.h / 2;
                const tGlow = lCtx.createRadialGradient(tx, ty, 6, tx, ty, 52);
                tGlow.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
                tGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                lCtx.fillStyle = tGlow;
                lCtx.beginPath();
                lCtx.arc(tx, ty, 52, 0, Math.PI * 2);
                lCtx.fill();
            });
        }

        // D. Raciones de Café Caliente
        if (currentRoom.items) {
            currentRoom.items.forEach(item => {
                if (!item.taken && item.type === 'coffee') {
                    const ix = item.x + 12, iy = item.y + 12;
                    const iGlow = lCtx.createRadialGradient(ix, iy, 4, ix, iy, 40);
                    iGlow.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
                    iGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    lCtx.fillStyle = iGlow;
                    lCtx.beginPath();
                    lCtx.arc(ix, iy, 40, 0, Math.PI * 2);
                    lCtx.fill();
                }
            });
        }

        // E. Rejillas Láser (Soporte omnidireccional)
        if (currentRoom.lasers) {
            currentRoom.lasers.forEach(laser => {
                const term = hackTerminals.find(t => t.id === laser.terminalId);
                const active = term ? !term.unlocked : true;
                if (active) {
                    lCtx.save();
                    lCtx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
                    lCtx.lineWidth = 26;
                    lCtx.beginPath();
                    lCtx.moveTo(laser.x1, laser.y1);
                    lCtx.lineTo(laser.x2, laser.y2);
                    lCtx.stroke();
                    lCtx.restore();
                }
            });
        }

        // F. Arena de Jefes (El reactor nuclear del jefe disipa la niebla)
        if (currentRoom.hasBoss && gameState.boss.hp > 0) {
            const bx = gameState.boss.x, by = gameState.boss.y;
            const bGlow = lCtx.createRadialGradient(bx, by, 30, bx, by, 220);
            bGlow.addColorStop(0, 'rgba(0, 0, 0, 0.95)');
            bGlow.addColorStop(0.7, 'rgba(0, 0, 0, 0.5)');
            bGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            lCtx.fillStyle = bGlow;
            lCtx.beginPath();
            lCtx.arc(bx, by, 220, 0, Math.PI * 2);
            lCtx.fill();
        }

        // 3. Estampar buffer de luz en el canvas principal
        ctx.save();
        ctx.drawImage(lightCanvas, 0, 0);

        // 4. BALIZA GIRATORIA DE EMERGENCIA EN EL TECHO (SIRENA EN ALERTA)
        if (gameState.alertState === 'alert') {
            const rotSpeed = now * 4.5;
            const sirenX = canvas.width / 2;
            const sirenY = canvas.height / 2;

            ctx.save();
            ctx.translate(sirenX, sirenY);
            ctx.rotate(rotSpeed);

            const sirenGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 480);
            sirenGrad.addColorStop(0, 'rgba(255, 42, 42, 0.16)');
            sirenGrad.addColorStop(1, 'rgba(255, 42, 42, 0)');

            ctx.fillStyle = sirenGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 480, -Math.PI * 0.25, Math.PI * 0.25);
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, 480, Math.PI * 0.75, Math.PI * 1.25);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }

        ctx.restore();
    };

    console.log('%c[GFX] Módulo de Iluminación y Raycasting Dinámico cargado.', 'color:#fbbf24');
})();
