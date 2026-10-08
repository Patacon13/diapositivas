/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: INDUSTRIAL SCENERY & PARTICLE SYSTEMS
 * Ambientación visual cibernética avanzada:
 *  - Suelo de paneles industriales, rejillas y remaches
 *  - Racks de servidores con LEDs binarios
 *  - Charcos de refrigerante con brillo especular
 *  - Trazas de circuitos de datos en el suelo con pulsos de luz viajando
 *  - Huellas de botas tácticas que se desvanecen
 *  - Rejillas láser de plasma con arcos voltaicos crepitantes
 *  - Pantallas CRT de terminales con scanlines y código en cascada
 *  - Vapor volumétrico, chispas de impacto y polvo
 * ============================================================================= */
(function() {
    'use strict';

    const particles = [];
    const footprints = [];
    const steamVents = [
        { x: 120, y: 70, timer: 0 },
        { x: 680, y: 380, timer: 1.5 },
        { x: 260, y: 410, timer: 2.8 }
    ];

    let lastStepX = 0, lastStepY = 0;

    // Emitir partículas
    window.spawnParticles = function(x, y, count, color, speed = 2, maxLife = 0.6) {
        for (let i = 0; i < count; i++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = (0.5 + Math.random() * 0.8) * speed;
            particles.push({
                x, y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: maxLife * (0.6 + Math.random() * 0.4),
                maxLife: maxLife,
                color: color,
                size: 1.5 + Math.random() * 2
            });
        }
    };

    // Actualizar física de partículas y huellas
    window.updateGFXParticles = function(dt) {
        // 1. Vapor en chimeneas industriales
        steamVents.forEach(vent => {
            vent.timer -= dt;
            if (vent.timer <= 0) {
                vent.timer = 2.5 + Math.random() * 2;
                for (let i = 0; i < 8; i++) {
                    particles.push({
                        x: vent.x + (Math.random() - 0.5) * 10,
                        y: vent.y,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: - (1.2 + Math.random() * 1.5),
                        life: 1.2,
                        maxLife: 1.2,
                        color: 'rgba(203, 213, 225, 0.45)',
                        size: 3 + Math.random() * 4,
                        isSteam: true
                    });
                }
            }
        });

        // 2. Huellas y polvo de Solid Byte al caminar
        const p = typeof gameState !== 'undefined' ? gameState.player : null;
        if (p && !p.inBox) {
            const moving = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => gameState.keys && gameState.keys[k]);
            if (moving) {
                const distSinceStep = Math.hypot(p.x - lastStepX, p.y - lastStepY);
                if (distSinceStep > 22) {
                    lastStepX = p.x;
                    lastStepY = p.y;
                    // Dejar huella de bota
                    footprints.push({
                        x: p.x,
                        y: p.y,
                        dir: p.dir,
                        life: 4.5,
                        maxLife: 4.5,
                        roomId: typeof gameState !== 'undefined' ? gameState.currentRoomId : 'dock'
                    });
                    if (footprints.length > 50) footprints.shift();
                }

                if (Math.random() < 0.25) {
                    particles.push({
                        x: p.x - Math.cos(p.dir) * 8 + (Math.random() - 0.5) * 6,
                        y: p.y - Math.sin(p.dir) * 8 + (Math.random() - 0.5) * 6,
                        vx: -Math.cos(p.dir) * 0.4 + (Math.random() - 0.5) * 0.4,
                        vy: -Math.sin(p.dir) * 0.4 + (Math.random() - 0.5) * 0.4,
                        life: 0.4,
                        maxLife: 0.4,
                        color: 'rgba(71, 85, 105, 0.4)',
                        size: 2
                    });
                }
            }
        }

        // 3. Simular partículas
        for (let i = particles.length - 1; i >= 0; i--) {
            const pt = particles[i];
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.life -= dt;
            if (pt.isSteam) {
                pt.size += dt * 5;
                pt.vx += (Math.random() - 0.5) * 0.1;
            }
            if (pt.life <= 0) particles.splice(i, 1);
        }

        // 4. Desvanecer huellas
        for (let i = footprints.length - 1; i >= 0; i--) {
            footprints[i].life -= dt;
            if (footprints[i].life <= 0) footprints.splice(i, 1);
        }
    };

    // -------------------------------------------------------------------------
    // RENDER: SUELO TÁCTICO, CIRCUITOS Y HUELLAS
    // -------------------------------------------------------------------------
    window.renderDecorFloor = function(ctx) {
        const currentRoom = facilityRooms[gameState.currentRoomId];
        if (!currentRoom) return;

        const now = performance.now() * 0.001;
        ctx.save();

        // 1. Huellas tácticas de botas en el suelo (solo sala actual)
        const curRoomId = typeof gameState !== 'undefined' ? gameState.currentRoomId : null;
        footprints.forEach(fp => {
            if (fp.roomId !== curRoomId) return;
            const alpha = Math.max(0, fp.life / fp.maxLife) * 0.35;
            ctx.save();
            ctx.translate(fp.x, fp.y);
            ctx.rotate(fp.dir);
            ctx.fillStyle = `rgba(15, 23, 42, ${alpha})`;
            ctx.fillRect(-3, -2, 6, 3.5);
            ctx.fillRect(-2, 2.5, 4, 2);
            ctx.restore();
        });

        // 2. Trazas de Circuitos de Datos en el Suelo (Neon Conduit Lines)
        ctx.save();
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.14)';
        ctx.lineWidth = 1.5;

        // Trazado de canaletas
        const conduits = [
            [[70, 225], [140, 225], [140, 100], [380, 100]],
            [[380, 100], [380, 44]],
            [[500, 225], [680, 225], [680, 320]],
            [[140, 225], [140, 350], [320, 350]]
        ];

        conduits.forEach(line => {
            ctx.beginPath();
            ctx.moveTo(line[0][0], line[0][1]);
            for (let i = 1; i < line.length; i++) {
                ctx.lineTo(line[i][0], line[i][1]);
            }
            ctx.stroke();
        });

        // Paquetes de luz de datos viajando por las líneas
        conduits.forEach((line, lineIdx) => {
            const totalSteps = line.length - 1;
            const progress = (now * 0.8 + lineIdx * 0.4) % totalSteps;
            const segIdx = Math.floor(progress);
            const t = progress - segIdx;
            const p1 = line[segIdx];
            const p2 = line[segIdx + 1];
            if (p1 && p2) {
                const px = p1[0] + (p2[0] - p1[0]) * t;
                const py = p1[1] + (p2[1] - p1[1]) * t;

                ctx.fillStyle = '#00FF66';
                ctx.shadowColor = '#00FF66';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(px, py, 2.4, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        });
        ctx.restore();

        // 4. Rejillas de ventilación metálicas industriales
        const vents = [
            { x: 50, y: 50, w: 36, h: 24 },
            { x: 710, y: 50, w: 36, h: 24 },
            { x: 50, y: 370, w: 36, h: 24 },
            { x: 710, y: 370, w: 36, h: 24 }
        ];

        vents.forEach(v => {
            ctx.fillStyle = '#06190F';
            ctx.fillRect(v.x, v.y, v.w, v.h);
            ctx.strokeStyle = '#00FF66';
            ctx.lineWidth = 1;
            ctx.strokeRect(v.x, v.y, v.w, v.h);

            ctx.strokeStyle = '#0F5132';
            ctx.lineWidth = 1.2;
            for (let lx = v.x + 4; lx < v.x + v.w - 2; lx += 4) {
                ctx.beginPath();
                ctx.moveTo(lx, v.y + 2);
                ctx.lineTo(lx, v.y + v.h - 2);
                ctx.stroke();
            }
        });

        // 5. Racks de Servidores con LEDs de actividad
        const racks = [
            { x: 380, y: 44, w: 40, h: 14 },
            { x: 430, y: 44, w: 40, h: 14 }
        ];

        racks.forEach((rk, idx) => {
            ctx.fillStyle = '#0F172A';
            ctx.fillRect(rk.x, rk.y, rk.w, rk.h);
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1;
            ctx.strokeRect(rk.x, rk.y, rk.w, rk.h);

            for (let i = 0; i < 5; i++) {
                const blink = Math.sin(now * 5 * (i + 1) + idx) > 0;
                ctx.fillStyle = blink ? (i === 4 ? '#EF4444' : (i === 2 ? '#38BDF8' : '#00FF66')) : '#064E3B';
                ctx.fillRect(rk.x + 4 + i * 7, rk.y + 5, 3.5, 3.5);
            }
        });

        // 6. Franjas de Seguridad Táctica (Hazard Stripes) en Umbrales de Puertas
        if (currentRoom.doors) {
            currentRoom.doors.forEach(d => {
                ctx.save();
                ctx.translate(d.x, d.y);
                ctx.fillStyle = '#1E293B';
                ctx.fillRect(0, 0, d.w, d.h);

                ctx.strokeStyle = '#F59E0B';
                ctx.lineWidth = 2.5;
                const isHoriz = d.w > d.h;
                if (isHoriz) {
                    for (let sx = -d.h; sx < d.w + d.h; sx += 8) {
                        ctx.beginPath();
                        ctx.moveTo(sx, 0);
                        ctx.lineTo(sx + d.h, d.h);
                        ctx.stroke();
                    }
                } else {
                    for (let sy = -d.w; sy < d.h + d.w; sy += 8) {
                        ctx.beginPath();
                        ctx.moveTo(0, sy);
                        ctx.lineTo(d.w, sy + d.w);
                        ctx.stroke();
                    }
                }
                ctx.restore();
            });
        }

        // 7. Rejillas Láser de Plasma Crepitante (Efecto Eléctrico Mejorado)
        if (currentRoom.lasers) {
            currentRoom.lasers.forEach(laser => {
                const term = hackTerminals.find(t => t.id === laser.terminalId);
                const isBlocked = term ? !term.unlocked : true;
                if (isBlocked) {
                    ctx.save();

                    // Emisores metálicos en los extremos
                    ctx.fillStyle = '#334155';
                    ctx.fillRect(laser.x1 - 6, laser.y1 - 3, 12, 6);
                    ctx.fillRect(laser.x2 - 6, laser.y2 - 3, 12, 6);

                    // Resplandor difuso de plasma rojo
                    ctx.strokeStyle = 'rgba(255, 42, 42, 0.4)';
                    ctx.lineWidth = 7;
                    ctx.beginPath();
                    ctx.moveTo(laser.x1, laser.y1);
                    ctx.lineTo(laser.x2, laser.y2);
                    ctx.stroke();

                    // Núcleo del rayo
                    ctx.strokeStyle = '#FF2A2A';
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = '#FF2A2A';
                    ctx.shadowBlur = 12;
                    ctx.beginPath();
                    ctx.moveTo(laser.x1, laser.y1);
                    ctx.lineTo(laser.x2, laser.y2);
                    ctx.stroke();

                    // Arcos voltaicos / crepitar eléctrico
                    const jitter1 = (Math.random() - 0.5) * 5;
                    const midY = (laser.y1 + laser.y2) / 2;
                    ctx.strokeStyle = '#FFF';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(laser.x1, laser.y1);
                    ctx.lineTo(laser.x1 + jitter1, midY);
                    ctx.lineTo(laser.x2, laser.y2);
                    ctx.stroke();

                    ctx.restore();
                }
            });
        }

        ctx.restore();
    };

    // Renderizar partículas
    window.renderGFXParticles = function(ctx) {
        ctx.save();
        particles.forEach(pt => {
            const alpha = Math.max(0, pt.life / pt.maxLife);
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = pt.color;
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
        ctx.restore();
    };

    window.DECOR = window.DECOR || {};
    window.DECOR.clearFootprints = function(roomId) {
        if (roomId) {
            for (let i = footprints.length - 1; i >= 0; i--) {
                if (footprints[i].roomId === roomId) footprints.splice(i, 1);
            }
        } else {
            footprints.length = 0;
        }
    };

    console.log('%c[GFX] Módulo de Escenografía Avanzada y Circuitos cargado.', 'color:#a78bfa');
})();
