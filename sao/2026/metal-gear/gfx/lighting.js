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

    // Intersección exacta de rayo contra segmento de muro
    function getRayIntersection(px, py, dx, dy, x1, y1, x2, y2) {
        const sx = x2 - x1, sy = y2 - y1;
        const denom = sx * dy - sy * dx;
        if (Math.abs(denom) < 1e-9) return null;

        const ax_px = x1 - px, ay_py = y1 - py;
        const t1 = (sx * ay_py - sy * ax_px) / denom;
        const t2 = (dx * ay_py - dy * ax_px) / denom;

        if (t1 >= 0 && t2 >= 0 && t2 <= 1) {
            return t1; // Distancia euclídea a lo largo de (dx, dy)
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

    function distToSegment(px, py, x1, y1, x2, y2) {
        const dx = x2 - x1, dy = y2 - y1;
        const l2 = dx * dx + dy * dy;
        if (l2 === 0) return Math.hypot(px - x1, py - y1);
        let t = ((px - x1) * dx + (py - y1) * dy) / l2;
        t = Math.max(0, Math.min(1, t));
        return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
    }

    function getRoomCeilingLamps(room) {
        if (!room) return [];
        if (room.ceilingLamps) return room.ceilingLamps;

        const lampsByRoom = {
            dock: [
                { x: 100, y: 70, radius: 105, intensity: 0.85 },
                { x: 320, y: 80, radius: 110, intensity: 0.85 },
                { x: 610, y: 340, radius: 115, intensity: 0.85 }
            ],
            corridor_u1: [
                { x: 120, y: 225, radius: 115, intensity: 0.85 },
                { x: 400, y: 225, radius: 120, intensity: 0.85 },
                { x: 680, y: 225, radius: 115, intensity: 0.85 }
            ],
            filtration_u1: [
                { x: 150, y: 120, radius: 115, intensity: 0.85 },
                { x: 600, y: 120, radius: 115, intensity: 0.85 },
                { x: 380, y: 340, radius: 120, intensity: 0.85 }
            ],
            arena_vulcan: [
                { x: 400, y: 225, radius: 200, intensity: 0.95 },
                { x: 200, y: 120, radius: 130, intensity: 0.80 },
                { x: 600, y: 330, radius: 130, intensity: 0.80 }
            ],
            warehouse_entry: [
                { x: 140, y: 120, radius: 115, intensity: 0.85 },
                { x: 500, y: 120, radius: 115, intensity: 0.85 },
                { x: 320, y: 340, radius: 115, intensity: 0.85 }
            ],
            warehouse_junction: [
                { x: 150, y: 225, radius: 115, intensity: 0.85 },
                { x: 400, y: 225, radius: 125, intensity: 0.85 },
                { x: 650, y: 225, radius: 115, intensity: 0.85 }
            ],
            loop_storage: [
                { x: 200, y: 140, radius: 120, intensity: 0.85 },
                { x: 580, y: 140, radius: 120, intensity: 0.85 },
                { x: 380, y: 340, radius: 120, intensity: 0.85 }
            ],
            modular_lab_u2: [
                { x: 180, y: 140, radius: 120, intensity: 0.85 },
                { x: 580, y: 140, radius: 120, intensity: 0.85 },
                { x: 380, y: 330, radius: 120, intensity: 0.85 }
            ],
            arena_olympo: [
                { x: 400, y: 225, radius: 210, intensity: 1.0 },
                { x: 220, y: 130, radius: 130, intensity: 0.80 },
                { x: 580, y: 320, radius: 130, intensity: 0.80 }
            ],
            vector_vault: [
                { x: 160, y: 120, radius: 115, intensity: 0.85 },
                { x: 580, y: 120, radius: 115, intensity: 0.85 },
                { x: 360, y: 340, radius: 120, intensity: 0.85 }
            ],
            transit_conduit: [
                { x: 150, y: 225, radius: 120, intensity: 0.85 },
                { x: 400, y: 225, radius: 125, intensity: 0.85 },
                { x: 650, y: 225, radius: 120, intensity: 0.85 }
            ],
            string_archive: [
                { x: 200, y: 140, radius: 120, intensity: 0.85 },
                { x: 600, y: 140, radius: 120, intensity: 0.85 },
                { x: 400, y: 340, radius: 120, intensity: 0.85 }
            ],
            matrix_center: [
                { x: 180, y: 130, radius: 120, intensity: 0.85 },
                { x: 580, y: 130, radius: 120, intensity: 0.85 },
                { x: 380, y: 330, radius: 120, intensity: 0.85 }
            ],
            sorting_subcore: [
                { x: 180, y: 140, radius: 120, intensity: 0.85 },
                { x: 600, y: 140, radius: 120, intensity: 0.85 },
                { x: 380, y: 330, radius: 120, intensity: 0.85 }
            ],
            rex_core: [
                { x: 400, y: 225, radius: 220, intensity: 1.0 },
                { x: 200, y: 140, radius: 130, intensity: 0.85 },
                { x: 600, y: 330, radius: 130, intensity: 0.85 }
            ]
        };

        return lampsByRoom[room.id] || [
            { x: 220, y: 225, radius: 120, intensity: 0.8 },
            { x: 580, y: 225, radius: 120, intensity: 0.8 }
        ];
    }

    function checkRayWall(x1, y1, x2, y2, walls) {
        if (typeof window.isRayBlockedByWalls === 'function') {
            return window.isRayBlockedByWalls(x1, y1, x2, y2, walls);
        }
        if (typeof isRayBlockedByWalls === 'function') {
            return isRayBlockedByWalls(x1, y1, x2, y2, walls);
        }
        return false;
    }

    function getAmbientLightLevel(x, y, room) {
        if (!room) return 0.5;
        let totalLight = 0.08; // Penumbra oscura táctica base

        // En sirena roja de ALERTA, la baliza estroboscópica ilumina el hangar
        if (typeof gameState !== 'undefined' && gameState.alertState === 'alert') {
            totalLight += 0.22;
        }

        const walls = room.walls || [];

        // 1. Lámparas cenitales
        const lamps = getRoomCeilingLamps(room);
        for (let i = 0; i < lamps.length; i++) {
            const lamp = lamps[i];
            const d = Math.hypot(x - lamp.x, y - lamp.y);
            if (d < lamp.radius) {
                if (!checkRayWall(lamp.x, lamp.y, x, y, walls)) {
                    totalLight += (1 - d / lamp.radius) * (lamp.intensity || 0.85);
                }
            }
        }

        // 2. Terminales de seguridad
        if (room.terminals) {
            for (let i = 0; i < room.terminals.length; i++) {
                const term = room.terminals[i];
                const tx = term.x + term.w / 2, ty = term.y + term.h / 2;
                const d = Math.hypot(x - tx, y - ty);
                if (d < 65 && !checkRayWall(tx, ty, x, y, walls)) {
                    totalLight += (1 - d / 65) * 0.75;
                }
            }
        }

        // 3. Raciones
        if (room.items) {
            for (let i = 0; i < room.items.length; i++) {
                const item = room.items[i];
                if (!item.taken && item.type === 'coffee') {
                    const ix = item.x + 12, iy = item.y + 12;
                    const d = Math.hypot(x - ix, y - iy);
                    if (d < 50 && !checkRayWall(ix, iy, x, y, walls)) {
                        totalLight += (1 - d / 50) * 0.6;
                    }
                }
            }
        }

        // 4. Barreras láser
        if (room.lasers) {
            for (let i = 0; i < room.lasers.length; i++) {
                const laser = room.lasers[i];
                const d = distToSegment(x, y, laser.x1, laser.y1, laser.x2, laser.y2);
                if (d < 45) {
                    totalLight += (1 - d / 45) * 0.7;
                }
            }
        }

        // 5. Reactor del jefe
        if (room.hasBoss && typeof gameState !== 'undefined' && gameState.boss && gameState.boss.hp > 0) {
            const d = Math.hypot(x - gameState.boss.x, y - gameState.boss.y);
            if (d < 220) {
                totalLight += (1 - d / 220) * 0.9;
            }
        }

        // Oclusión de muros: estar a menos de 22px de un muro profundiza la sombra (wall-hug camo)
        if (walls.length > 0) {
            let nearWall = false;
            for (let i = 0; i < walls.length; i++) {
                const w = walls[i];
                const cx = Math.max(w.x, Math.min(x, w.x + w.w));
                const cy = Math.max(w.y, Math.min(y, w.y + w.h));
                if (Math.hypot(x - cx, y - cy) <= 22) {
                    nearWall = true;
                    break;
                }
            }
            if (nearWall) {
                totalLight *= 0.72;
            }
        }

        return Math.max(0.06, Math.min(1.0, totalLight));
    }

    function getGuardEffectiveViewDist(g, p, room) {
        const baseDist = g.viewDist || 150;
        if (!p || !room) return baseDist;

        // En alerta de combate, los centinelas están al 100% de reflejos
        if (typeof gameState !== 'undefined' && gameState.alertState === 'alert') {
            return baseDist;
        }

        // Nivel de iluminación en la posición de Solid Byte
        const lightLevel = getAmbientLightLevel(p.x, p.y, room);

        // Verificar si Solid Byte está en movimiento activo
        let isMoving = false;
        if (typeof gameState !== 'undefined' && gameState.keys) {
            isMoving = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => gameState.keys[k]);
        }
        if (p._isMoving) isMoving = true;

        if (isMoving) {
            // En movimiento: la silueta humana en desplazamiento rompe el camuflaje de penumbra.
            // La linterna y la vista periférica captan el movimiento con un alcance del 80% al 100% de la distancia base.
            const motionFactor = 0.80 + 0.20 * Math.min(1.0, lightLevel / 0.7);
            return Math.max(115, baseDist * motionFactor);
        } else {
            // Quieto en la sombra: camuflaje táctico óptimo (reducción de más del 50-65% de visión de linterna)
            const shadowFactor = 0.35 + 0.65 * Math.min(1.0, lightLevel / 0.7);
            let effectiveDist = baseDist * shadowFactor;
            if (lightLevel < 0.4) {
                effectiveDist *= 0.85;
            }
            return Math.max(45, effectiveDist);
        }
    }

    window.getAmbientLightLevel = getAmbientLightLevel;
    window.getGuardEffectiveViewDist = getGuardEffectiveViewDist;
    window.getRoomCeilingLamps = getRoomCeilingLamps;

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

        // G. Lámparas Cenitales Industriales (Recortar penumbra)
        const ceilingLamps = getRoomCeilingLamps(currentRoom);
        ceilingLamps.forEach(lamp => {
            const lGlow = lCtx.createRadialGradient(lamp.x, lamp.y, 10, lamp.x, lamp.y, lamp.radius);
            lGlow.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
            lGlow.addColorStop(0.65, 'rgba(0, 0, 0, 0.55)');
            lGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            lCtx.fillStyle = lGlow;
            lCtx.beginPath();
            lCtx.arc(lamp.x, lamp.y, lamp.radius, 0, Math.PI * 2);
            lCtx.fill();
        });

        // 2b. Halos tenues de luz cálida en el suelo bajo las lámparas
        ceilingLamps.forEach(lamp => {
            const floorGrad = ctx.createRadialGradient(lamp.x, lamp.y, 6, lamp.x, lamp.y, lamp.radius * 0.9);
            floorGrad.addColorStop(0, 'rgba(255, 235, 190, 0.08)');
            floorGrad.addColorStop(0.7, 'rgba(255, 235, 190, 0.02)');
            floorGrad.addColorStop(1, 'rgba(255, 235, 190, 0)');
            ctx.fillStyle = floorGrad;
            ctx.beginPath();
            ctx.arc(lamp.x, lamp.y, lamp.radius * 0.9, 0, Math.PI * 2);
            ctx.fill();
        });

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
