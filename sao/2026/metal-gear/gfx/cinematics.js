/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: CINEMATIC CAMERA & KOJIMA PRESENTATION
 * Dirección cinematográfica de culto PlayStation 1:
 *  - Desplazamiento de cámara dinámico en sigilo (Wall-Hug & Look-Ahead).
 *  - Barras Letterbox anamórficas de alerta cinemática.
 *  - Visor claustrofóbico al estar dentro de la Caja de Cartón (JAVA.ZIP).
 *  - Boss Title Cards procedurales con tipografía militar de presentación.
 * ============================================================================= */
(function() {
    'use strict';

    const CINE = {
        camX: 0,
        camY: 0,
        targetCamX: 0,
        targetCamY: 0,
        letterbox: 0,        // 0 a 1 (altura de barras negras cinemáticas)
        alertSlam: 0,
        prevAlert: 'normal',
        bossTitleTimer: 0,
        bossTitleData: null,
        lastBossRoomSeen: null
    };

    const BOSS_TITLES = {
        vulcan: {
            name: 'VULCAN BYTEMASTER',
            sub: 'BRIGADA BLINDADA // AMENAZA DE OVERFLOW Y RECOLECTOR DE BASURA',
            quote: '«Los punteros sin inicializar serán purgados de la memoria.»'
        },
        olympo: {
            name: 'CYBER OLYMPO',
            sub: 'PROCESADOR HEXAPODO // SALTO DE DIRECCIÓN DE RETORNO',
            quote: '«No podés interceptar lo que se ejecuta en el bus de datos.»'
        },
        rex: {
            name: 'METAL GEAR REX // JVM TITAN',
            sub: 'PLATAFORMA BÍPEDA // PROCESAMIENTO CONCURRENTE MULTI-HILO',
            quote: '«El garbage collector no te salvará de la sincronización forzada.»'
        }
    };

    // -------------------------------------------------------------------------
    // 1. DIRECTOR DE CÁMARA & FÍSICA CINEMÁTICA
    // -------------------------------------------------------------------------
    window.updateCinematics = function(dt) {
        const p = gameState.player;
        if (!p) return;

        // A. Look-Ahead sutil en la dirección de la marcha o al pegarse a paredes
        const isMoving = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].some(k => gameState.keys[k]);
        const lookDist = p.inBox ? 4 : (isMoving ? 14 : 6);
        CINE.targetCamX = Math.cos(p.dir) * lookDist;
        CINE.targetCamY = Math.sin(p.dir) * lookDist;

        // Suavizado exponencial (damping de cámara)
        CINE.camX += (CINE.targetCamX - CINE.camX) * Math.min(1, dt * 5);
        CINE.camY += (CINE.targetCamY - CINE.camY) * Math.min(1, dt * 5);

        // B. Transición de Alerta -> Letterbox Slam
        if (gameState.alertState === 'alert') {
            CINE.letterbox = Math.min(1, CINE.letterbox + dt * 4.5);
            if (CINE.prevAlert !== 'alert') {
                CINE.alertSlam = 1.0; // Flash cinemático de impacto inicial
            }
        } else {
            CINE.letterbox = Math.max(0, CINE.letterbox - dt * 2.2);
        }
        CINE.prevAlert = gameState.alertState;

        if (CINE.alertSlam > 0) {
            CINE.alertSlam = Math.max(0, CINE.alertSlam - dt * 3.5);
        }

        // C. Detección de entrada a la sala del Boss para mostrar la Title Card
        const room = facilityRooms[gameState.currentRoomId];
        if (room && room.hasBoss && gameState.boss.hp > 0) {
            if (CINE.lastBossRoomSeen !== gameState.currentRoomId) {
                CINE.lastBossRoomSeen = gameState.currentRoomId;
                const bType = gameState.boss.type || 'vulcan';
                CINE.bossTitleData = BOSS_TITLES[bType] || BOSS_TITLES.vulcan;
                CINE.bossTitleTimer = 4.2; // 4.2 segundos en pantalla
            }
        } else {
            if (!room || !room.hasBoss) CINE.lastBossRoomSeen = null;
        }

        if (CINE.bossTitleTimer > 0) {
            CINE.bossTitleTimer -= dt;
        }
    };

    // -------------------------------------------------------------------------
    // 2. RENDER DE OVERLAYS CINEMÁTICOS
    // -------------------------------------------------------------------------
    window.renderCinematicsOverlay = function(ctx) {
        const p = gameState.player;
        const now = performance.now() * 0.001;

        ctx.save();

        // A. Visor de la Caja de Cartón (JAVA.ZIP Cam)
        if (p && p.inBox) {
            // Viñeta oscura con textura de cartón en los cuatro bordes
            const boxVignette = ctx.createRadialGradient(400, 225, 120, 400, 225, 420);
            boxVignette.addColorStop(0, 'rgba(30, 20, 10, 0.15)');
            boxVignette.addColorStop(0.7, 'rgba(40, 25, 10, 0.55)');
            boxVignette.addColorStop(1, 'rgba(20, 10, 5, 0.92)');
            ctx.fillStyle = boxVignette;
            ctx.fillRect(0, 0, 800, 450);

            // Marco superior e inferior de solapas de cartón
            ctx.fillStyle = 'rgba(120, 53, 15, 0.85)';
            ctx.fillRect(0, 0, 800, 18);
            ctx.fillRect(0, 432, 800, 18);

            // Cinta de embalar central sutil
            ctx.fillStyle = 'rgba(253, 230, 138, 0.25)';
            ctx.fillRect(390, 0, 20, 450);

            // Retícula de ranura de espionaje en el centro
            ctx.strokeStyle = '#D97706';
            ctx.lineWidth = 1.2;
            ctx.strokeRect(340, 210, 120, 30);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
            ctx.fillRect(340, 210, 120, 30);

            ctx.fillStyle = '#FDE68A';
            ctx.font = 'bold 8.5px Share Tech Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText('▲ JAVA.ZIP // VISOR DE INFILTRACIÓN ▲', 400, 228);
        }

        // B. Barras Letterbox Cinematográficas (Alerta Táctica)
        if (CINE.letterbox > 0) {
            const barH = CINE.letterbox * 26; // Altura máxima 26px
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, 800, barH);
            ctx.fillRect(0, 450 - barH, 800, barH);

            // Línea roja neón de alerta en el borde del letterbox
            ctx.strokeStyle = `rgba(255, 42, 42, ${CINE.letterbox * 0.75})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(0, barH);
            ctx.lineTo(800, barH);
            ctx.moveTo(0, 450 - barH);
            ctx.lineTo(800, 450 - barH);
            ctx.stroke();

            // Etiqueta cinematográfica superior en alerta máxima
            if (CINE.letterbox > 0.7) {
                ctx.fillStyle = '#FF2A2A';
                ctx.font = 'bold 9px Share Tech Mono, monospace';
                ctx.textAlign = 'right';
                ctx.fillText('! CODE 01 // COMBATE EN CURSO', 788, barH - 7);
            }
        }

        // C. Flash de Detección Inicial (Slam Impact)
        if (CINE.alertSlam > 0) {
            ctx.fillStyle = `rgba(255, 0, 40, ${CINE.alertSlam * 0.35})`;
            ctx.fillRect(0, 0, 800, 450);
        }

        // D. Boss Title Card Estilo Kojima (Presentación cinemática militar)
        if (CINE.bossTitleTimer > 0 && CINE.bossTitleData) {
            const alpha = Math.min(1, CINE.bossTitleTimer > 3.6 ? (4.2 - CINE.bossTitleTimer) * 2.5 : (CINE.bossTitleTimer / 1.2));
            const cardY = 330;

            ctx.save();
            ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

            // Franja de fondo translúcida de estilo militar
            ctx.fillStyle = 'rgba(2, 18, 8, 0.88)';
            ctx.fillRect(40, cardY, 720, 68);
            ctx.strokeStyle = '#00FF66';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(40, cardY, 720, 68);

            // Borde superior acento cian
            ctx.fillStyle = '#38BDF8';
            ctx.fillRect(40, cardY, 720, 2.5);

            // Nombre del Boss con sombra verde fósforo
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowColor = '#00FF66';
            ctx.shadowBlur = 10;
            ctx.font = '900 18px Poppins, Share Tech Mono, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(CINE.bossTitleData.name, 60, cardY + 26);
            ctx.shadowBlur = 0;

            // Subtítulo táctico
            ctx.fillStyle = '#38BDF8';
            ctx.font = 'bold 9.5px Share Tech Mono, monospace';
            ctx.fillText(CINE.bossTitleData.sub, 60, cardY + 42);

            // Cita / Filosofía de diseño
            ctx.fillStyle = '#94A3B8';
            ctx.font = 'italic 8.5px Share Tech Mono, monospace';
            ctx.fillText(CINE.bossTitleData.quote, 60, cardY + 58);

            // Badge de Cátedra UTN FRSF a la derecha
            ctx.textAlign = 'right';
            ctx.fillStyle = '#FFB000';
            ctx.font = 'bold 9px Share Tech Mono, monospace';
            ctx.fillText('TARGET IDENTIFIED // SAO 2026', 740, cardY + 24);

            ctx.restore();
        }

        ctx.restore();
    };

    // Auto-hook a updateGame y draw
    const _baseUpdateGFX = window.updateGFXParticles;
    window.updateGFXParticles = function(dt) {
        if (_baseUpdateGFX) _baseUpdateGFX(dt);
        if (window.updateCinematics) window.updateCinematics(dt);
    };

    const _baseRenderPS1 = window.renderPS1PostFX;
    window.renderPS1PostFX = function(ctx) {
        if (window.renderCinematicsOverlay) window.renderCinematicsOverlay(ctx);
        if (_baseRenderPS1) _baseRenderPS1(ctx);
    };

    console.log('%c[GFX] Módulo de Dirección Cinemática y Boss Title Cards cargado.', 'color:#f43f5e');
})();
