/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: PROCEDURAL SPRITES & SKELETAL RIGGING
 * Renderizado de alta definición en Canvas 2D sin dependencias de imágenes.
 *  - Solid Byte: Sneaking Suit, botas tácticas con ciclo de marcha, bandana
 *    con física de tela/viento, arma con silenciador, caja 3D con ojos espía.
 *  - Centinelas: Uniforme táctico, casco militar, visor NVG con brillo de estado,
 *    rifle con linterna montada, ciclo de patrulla y pose de derribo CQC.
 * ============================================================================= */
(function() {
    'use strict';

    const GFX = {
        playerWalk: 0,
        playerLastX: 0,
        playerLastY: 0,
        bandanaPoints: [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 }
        ],
        blinkTimer: 0,
        isBlinking: false
    };

    // -------------------------------------------------------------------------
    // 1. SPRITE PROCEDURAL: SOLID BYTE
    // -------------------------------------------------------------------------
    window.renderCustomPlayer = function(p, ctx) {
        if (!p) return false;

        const now = performance.now() * 0.001;

        // Calcular desplazamiento para ciclo de caminata
        const dx = p.x - (GFX.playerLastX || p.x);
        const dy = p.y - (GFX.playerLastY || p.y);
        const distMoved = Math.hypot(dx, dy);
        GFX.playerLastX = p.x;
        GFX.playerLastY = p.y;

        const isMoving = distMoved > 0.15;
        if (isMoving) {
            GFX.playerWalk += distMoved * 0.35;
        } else {
            // Respiración / Idle suave
            GFX.playerWalk = Math.sin(now * 2) * 0.1;
        }

        // Parpadeo de ojos en la caja
        GFX.blinkTimer -= 0.016;
        if (GFX.blinkTimer <= 0) {
            GFX.isBlinking = !GFX.isBlinking;
            GFX.blinkTimer = GFX.isBlinking ? 0.15 : (2.5 + Math.random() * 2);
        }

        ctx.save();

        // Sombra suave proyectada en el suelo
        ctx.save();
        ctx.translate(p.x, p.y + 4);
        ctx.scale(1, 0.55);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        const shadowRadius = p.inBox ? 22 : 16;
        ctx.arc(0, 0, shadowRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // MODO CAJA DE CARTÓN TÁCTICA ("THE ORANGE // JAVA.ZIP")
        if (p.inBox) {
            ctx.save();
            ctx.translate(p.x, p.y);
            const boxBob = isMoving ? Math.sin(GFX.playerWalk * 2) * 2 : 0;
            ctx.translate(0, boxBob);

            // Cuerpo de la caja (gradiente 3D cartón craft)
            const boxGrad = ctx.createLinearGradient(-18, -18, 18, 18);
            boxGrad.addColorStop(0, '#D97706');
            boxGrad.addColorStop(0.5, '#B45309');
            boxGrad.addColorStop(1, '#92400E');
            ctx.fillStyle = boxGrad;
            ctx.beginPath();
            ctx.roundRect ? ctx.roundRect(-18, -16, 36, 32, 3) : ctx.rect(-18, -16, 36, 32);
            ctx.fill();

            // Bordes biselados de la caja
            ctx.strokeStyle = '#78350F';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pliegue central y cinta adhesiva superior
            ctx.strokeStyle = '#92400E';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, -16);
            ctx.lineTo(0, 16);
            ctx.stroke();

            // Cinta de embalar
            ctx.fillStyle = 'rgba(253, 230, 138, 0.35)';
            ctx.fillRect(-5, -16, 10, 32);

            // Sello serigrafiado "JAVA.ZIP"
            ctx.fillStyle = '#451A03';
            ctx.font = '900 7px Share Tech Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText("JAVA.ZIP", 0, -4);
            ctx.font = '700 5.5px Share Tech Mono, monospace';
            ctx.fillStyle = '#78350F';
            ctx.fillText("▲ FRAGILE ▲", 0, 4);

            // Ranuras frontales para espiar
            ctx.fillStyle = '#1C1917';
            ctx.fillRect(-7, 8, 5, 2.5);
            ctx.fillRect(2, 8, 5, 2.5);

            // Ojos de Solid Byte asomándose por la ranura
            if (!GFX.isBlinking) {
                ctx.fillStyle = '#38BDF8'; // Iris táctico cian
                ctx.fillRect(-5, 9, 2, 1.2);
                ctx.fillRect(4, 9, 2, 1.2);
            }

            // Pies asomando por abajo al caminar
            if (isMoving) {
                const footOff = Math.sin(GFX.playerWalk) * 5;
                ctx.fillStyle = '#1E293B';
                ctx.fillRect(-12, 14 + footOff, 6, 4);
                ctx.fillRect(6, 14 - footOff, 6, 4);
            }

            ctx.restore();
            ctx.restore();
            return true;
        }

        // MODO SOLID BYTE AL DESCUBIERTO (SNEAKING SUIT + RIGGING)
        ctx.translate(p.x, p.y);
        ctx.rotate(p.dir - Math.PI / 2);

        const legSwing = Math.sin(GFX.playerWalk) * 7;
        const armSwing = Math.cos(GFX.playerWalk) * 5;

        // 1. Botas tácticas de combate
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;

        // Pierna Izquierda
        ctx.save();
        ctx.translate(-7, -legSwing);
        ctx.fillRect(-3, -2, 6, 9);
        ctx.strokeRect(-3, -2, 6, 9);
        ctx.restore();

        // Pierna Derecha
        ctx.save();
        ctx.translate(7, legSwing);
        ctx.fillRect(-3, -2, 6, 9);
        ctx.strokeRect(-3, -2, 6, 9);
        ctx.restore();

        // 2. Torso (Sneaking Suit blindado con Kevlar)
        const suitGrad = ctx.createLinearGradient(-10, -10, 10, 10);
        suitGrad.addColorStop(0, '#334155');
        suitGrad.addColorStop(0.5, '#1E293B');
        suitGrad.addColorStop(1, '#0F172A');

        ctx.fillStyle = suitGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 11, 8.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Arnés táctico y hombreras
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-9, -7, 18, 4);
        ctx.fillStyle = '#00FF66'; // Insignia luminosa miniatura
        ctx.fillRect(-2, -5, 4, 1.5);

        // Halo de camuflaje táctico en sombra
        const curRoom = (typeof facilityRooms !== 'undefined' && typeof gameState !== 'undefined') ? facilityRooms[gameState.currentRoomId] : null;
        const pLight = (typeof window.getAmbientLightLevel === 'function' && curRoom) ? window.getAmbientLightLevel(p.x, p.y, curRoom) : 0.5;
        if (pLight < 0.35) {
            ctx.save();
            ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 4]);
            ctx.beginPath();
            ctx.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // 3. Brazos sosteniendo arma (SOCOM silenciada)
        ctx.fillStyle = '#1E293B';
        // Brazo izquierdo (apoyo)
        ctx.save();
        ctx.translate(-7, 2 - armSwing * 0.3);
        ctx.rotate(0.35);
        ctx.fillRect(-2, 0, 5, 11);
        ctx.restore();

        // Brazo derecho (empuñadura)
        ctx.save();
        ctx.translate(6, 2 + armSwing * 0.3);
        ctx.rotate(-0.2);
        ctx.fillRect(-2, 0, 5, 12);
        ctx.restore();

        // SOCOM Silenciada (apuntando al frente, +X relativo en rotación global)
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(4, 7, 3, 10); // Cuerpo pistola
        ctx.fillStyle = '#334155';
        ctx.fillRect(4.5, 17, 2, 7); // Silenciador cilíndrico
        ctx.fillStyle = '#00FF66';
        ctx.fillRect(5, 23, 1, 1); // Mira de tritio verde fosforescente

        // Destello de disparo silenciado en combate
        if (p.shotFlash > 0) {
            ctx.fillStyle = '#FDE047';
            ctx.shadowColor = '#F59E0B';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(5.5, 25, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            p.shotFlash = Math.max(0, p.shotFlash - 0.05);
        }

        // 4. Cabeza
        // Cabello castaño oscuro
        ctx.fillStyle = '#1C1917';
        ctx.beginPath();
        ctx.arc(0, -1, 6.5, 0, Math.PI * 2);
        ctx.fill();

        // Rostro y tono de piel
        ctx.fillStyle = '#D4A373';
        ctx.beginPath();
        ctx.arc(0, 1, 4.5, 0, Math.PI);
        ctx.fill();

        // 5. Bandana Táctica Verde Neón (Cátedra Edition)
        ctx.fillStyle = '#00FF66';
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 4;
        ctx.fillRect(-6.5, -3, 13, 2.4);
        ctx.shadowBlur = 0;

        // Cola de la bandana ondeando hacia atrás
        const trailTime = now * 8;
        const wave1 = Math.sin(trailTime) * 3 - (isMoving ? 3 : 0);
        const wave2 = Math.cos(trailTime * 0.9) * 4 - (isMoving ? 6 : 0);

        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-2, -3);
        ctx.quadraticCurveTo(-7 + wave1, -7, -13 + wave2, -10 + wave1);
        ctx.stroke();

        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(1, -3);
        ctx.quadraticCurveTo(-4 + wave2, -8, -11 + wave1, -13 + wave2);
        ctx.stroke();

        ctx.restore();
        return true;
    };

    // -------------------------------------------------------------------------
    // 2. SPRITE PROCEDURAL: CENTINELA MILITAR (PATRULLA / ALERTA / DERRIBO)
    // -------------------------------------------------------------------------
    window.renderCustomGuard = function(g, ctx) {
        if (!g) return false;

        const now = performance.now() * 0.001;
        g._walkTimer = (g._walkTimer || 0) + (g.speed || 1) * 0.04;

        ctx.save();

        // CONO DE VISIÓN REALISTA CON VOLUMETRÍA Y PENUMBRA
        ctx.save();
        const fov = g.fov || (Math.PI * 0.45);
        const viewDist = g.viewDist || 155;

        let coneColorInner, coneColorOuter, coneLineColor;
        if (gameState.alertState === 'alert') {
            coneColorInner = 'rgba(255, 42, 42, 0.35)';
            coneColorOuter = 'rgba(255, 42, 42, 0.02)';
            coneLineColor  = 'rgba(255, 42, 42, 0.85)';
        } else if (g._inspectingBox || g._trackingFootprints) {
            coneColorInner = 'rgba(56, 189, 248, 0.32)';
            coneColorOuter = 'rgba(56, 189, 248, 0.02)';
            coneLineColor  = 'rgba(56, 189, 248, 0.85)';
        } else if (gameState.alertState === 'caution' || g.investigateTimer > 0) {
            coneColorInner = 'rgba(251, 191, 36, 0.28)';
            coneColorOuter = 'rgba(251, 191, 36, 0.02)';
            coneLineColor  = 'rgba(251, 191, 36, 0.75)';
        } else {
            coneColorInner = 'rgba(0, 255, 102, 0.18)';
            coneColorOuter = 'rgba(0, 255, 102, 0.01)';
            coneLineColor  = 'rgba(0, 255, 102, 0.5)';
        }

        const coneGrad = ctx.createRadialGradient(g.x, g.y, 8, g.x, g.y, viewDist);
        coneGrad.addColorStop(0, coneColorInner);
        coneGrad.addColorStop(0.7, coneColorInner);
        coneGrad.addColorStop(1, coneColorOuter);

        ctx.fillStyle = coneGrad;
        ctx.strokeStyle = coneLineColor;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.arc(g.x, g.y, viewDist, g.angle - fov / 2, g.angle + fov / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Línea central de mira láser táctica
        ctx.strokeStyle = coneLineColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        ctx.moveTo(g.x, g.y);
        ctx.lineTo(g.x + Math.cos(g.angle) * viewDist, g.y + Math.sin(g.angle) * viewDist);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();

        // SOMBRA DEL CENTINELA
        ctx.save();
        ctx.translate(g.x, g.y + 4);
        ctx.scale(1, 0.55);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.arc(0, 0, g.radius || 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // CUERPO DEL CENTINELA ORIENTADO
        ctx.translate(g.x, g.y);
        ctx.rotate(g.angle);

        const legPatrol = Math.sin(g._walkTimer) * 6;

        // Botas Militares
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-6, -3 - legPatrol, 5, 8);
        ctx.fillRect(2, -3 + legPatrol, 5, 8);

        // Uniforme de Combate y Chaleco Antibalas
        let armorColor1 = '#1E293B', armorColor2 = '#0F172A';
        if (gameState.alertState === 'alert') {
            armorColor1 = '#7F1D1D';
            armorColor2 = '#450A0A';
        } else if (gameState.alertState === 'caution') {
            armorColor1 = '#78350F';
            armorColor2 = '#451A03';
        }

        const armorGrad = ctx.createLinearGradient(-11, -9, 11, 9);
        armorGrad.addColorStop(0, armorColor1);
        armorGrad.addColorStop(1, armorColor2);

        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 12, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Mochila táctica con radio / batería
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-10, -5, 4, 10);
        // Antena de radio
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-9, -5);
        ctx.lineTo(-14, -10);
        ctx.stroke();

        // Rifle Automático Táctico
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(4, 3, 14, 3); // Cañón del arma
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(7, 4, 4, 4); // Cargador
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(17, 3, 2, 3); // Bocacha

        // Linterna montada en el rifle (brillo emisor)
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.fillRect(16, 2, 2.5, 2);
        ctx.shadowBlur = 0;

        // Casco Militar Táctico
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 6.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Visor Táctico NVG (Lentes con brillo según el estado)
        let visorColor = '#00FF66';
        if (gameState.alertState === 'alert') visorColor = '#FF2A2A';
        else if (gameState.alertState === 'caution' || g.investigateTimer > 0) visorColor = '#FFB000';

        ctx.fillStyle = visorColor;
        ctx.shadowColor = visorColor;
        ctx.shadowBlur = 6;
        ctx.fillRect(3, -3, 3, 6);
        ctx.shadowBlur = 0;

        ctx.restore();

        // ÍCONOS DINÁMICOS METÁLICOS "! // ?"
        if (gameState.alertState === 'alert') {
            ctx.save();
            ctx.translate(g.x, g.y - 24);
            const bounce = Math.abs(Math.sin(now * 10)) * 5;
            ctx.translate(0, -bounce);
            ctx.fillStyle = '#FF2A2A';
            ctx.shadowColor = '#FF2A2A';
            ctx.shadowBlur = 12;
            ctx.font = '900 24px Share Tech Mono, Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("!", 0, 0);
            ctx.restore();
        } else if (gameState.alertState === 'caution' || g.investigateTimer > 0) {
            ctx.save();
            ctx.translate(g.x, g.y - 22);
            const bounce = Math.abs(Math.sin(now * 8)) * 3;
            ctx.translate(0, -bounce);
            ctx.fillStyle = '#FFB000';
            ctx.shadowColor = '#FFB000';
            ctx.shadowBlur = 10;
            ctx.font = '900 22px Share Tech Mono, Poppins, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText("?", 0, 0);
            ctx.restore();
        }

        return true;
    };

    // -------------------------------------------------------------------------
    // 3. SPRITE PROCEDURAL: CENTINELA DERRIBADO POR CQC (SLEEPING GUARD)
    // -------------------------------------------------------------------------
    window.renderCustomSleepingGuard = function(sg, ctx) {
        if (!sg || !ctx) return false;

        const sx = typeof sg.x === 'number' && Number.isFinite(sg.x) ? sg.x : 0;
        const sy = typeof sg.y === 'number' && Number.isFinite(sg.y) ? sg.y : 0;
        const sRadius = typeof sg.radius === 'number' && Number.isFinite(sg.radius) ? sg.radius : 13;
        const sAngle = typeof sg.angle === 'number' && Number.isFinite(sg.angle) ? sg.angle : 0;
        const sSleep = typeof sg.sleep === 'number' && Number.isFinite(sg.sleep) ? sg.sleep : 0;
        const maxSleep = typeof sg.maxSleep === 'number' && sg.maxSleep > 0 ? sg.maxSleep : 25;
        const sleepRatio = Math.max(0, Math.min(1, sSleep / maxSleep));

        const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() * 0.001 : Date.now() * 0.001;
        const breathe = Math.sin(now * 2.2 + sx * 0.1) * 0.75;

        // 1. Sombra suave y difusa proyectada en el suelo
        ctx.save();
        ctx.translate(sx, sy + 4);
        ctx.scale(1.4, 0.65);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.arc(0, 0, sRadius * 1.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 2. Rifle táctico caído y desprendido en el suelo
        ctx.save();
        ctx.translate(sx + 13, sy + 7);
        ctx.rotate(0.35);
        // Sombra del arma caída
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(-2, 1, 16, 3);
        // Cañón y cajón de mecanismos
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(0, 0, 14, 3);
        // Cargador táctico
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(5, 2, 4, 3.5);
        // Bocacha apagallamas
        ctx.fillStyle = '#CBD5E1';
        ctx.fillRect(14, 0, 2, 3);
        // Linterna montada apagada / sin emisión
        ctx.fillStyle = '#475569';
        ctx.fillRect(12, -1, 2.5, 1.5);
        ctx.restore();

        // 3. Centinela tendido de lado (CQC Knockdown / Sleeper pose)
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(sAngle + Math.PI / 2);

        // Botas militares relajadas en el piso
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-14, -2, 6, 4);
        ctx.fillRect(-11, 2, 6, 4);

        // Piernas con uniforme táctico
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(-9, -1.5, 7, 3);
        ctx.fillRect(-6, 2, 6, 3);

        // Torso y chaleco táctico antibalas con oscilación de respiración
        const armorGrad = ctx.createLinearGradient(-8, -6, 8, 6);
        armorGrad.addColorStop(0, '#1E293B');
        armorGrad.addColorStop(1, '#0F172A');
        ctx.fillStyle = armorGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 10 + breathe * 0.4, 7.5, 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Mochila táctica / radio en la espalda sobre el piso
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(-6, -7, 4.5, 6);
        // Antena de radio torcida sobre el piso
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-5, -7);
        ctx.lineTo(-10, -11);
        ctx.stroke();

        // Brazo caído y guante táctico
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(1, 2, 6, 3);
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(7, 2.5, 2.5, 2.5);

        // Casco militar táctico inclinado / ladeado (tilted helmet)
        ctx.save();
        ctx.translate(7, -0.5);
        ctx.rotate(0.28 + breathe * 0.04);
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.arc(0, 0, 6.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Visor táctico NVG apagado (sin energía)
        ctx.fillStyle = '#475569';
        ctx.fillRect(2.5, -2, 2.2, 4);
        ctx.restore();

        ctx.restore();

        // 4. Efecto Zzz retro PS1 animado con oscilación
        ctx.save();
        const zSeed = ((sg.id || 0) * 1.7) + sx * 0.05;
        const zIndex = Math.floor(((now + zSeed) * 2.5) % 3) + 1;
        const zBob = Math.sin((now + zSeed) * 3) * 2;
        ctx.font = 'bold 11px "Share Tech Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#38BDF8';
        ctx.shadowColor = '#0284C7';
        ctx.shadowBlur = 8;
        ctx.fillText('Z'.repeat(zIndex), sx + 12, sy - 12 + zBob);
        ctx.restore();

        // 5. Barra táctica de duración de sueño (CQC Stun Gauge)
        ctx.save();
        const barW = 26;
        const barH = 3;
        const barX = sx - barW / 2;
        const barY = sy + 16;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(barX, barY, barW, barH);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(barX, barY, barW * sleepRatio, barH);
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(barX, barY, barW, barH);
        ctx.restore();

        return true;
    };

    console.log('%c[GFX] Módulo de Sprites Procedurales cargado.', 'color:#38bdf8');
})();
