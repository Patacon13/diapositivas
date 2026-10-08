/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: PS1 DITHERING & SOLITON SONAR POST-FX
 * Fiel recreación del renderizado de PlayStation 1 (1998):
 *  - Matriz de Bayer 4x4 para simular el dithering de 16-bit del framebuffer PS1.
 *  - Haz de barrido giratorio de sonar Soliton Radar con persistencia de fósforo.
 *  - Aberración cromática y aberración de señal analógica en alarmas y disparos.
 * ============================================================================= */
(function() {
    'use strict';

    // -------------------------------------------------------------------------
    // 1. GENERACIÓN DE PATRÓN DE DITHERING BAYER 4x4 (PS1 HARDWARE TEXTURE)
    // -------------------------------------------------------------------------
    let ditherPattern = null;

    function initBayerDitherPattern() {
        if (ditherPattern) return;
        try {
            const dCanvas = document.createElement('canvas');
            dCanvas.width = 4;
            dCanvas.height = 4;
            const dCtx = dCanvas.getContext('2d');
            if (!dCtx) return;

            // Matriz clásica de Bayer 4x4 normalizada
            const bayer = [
                0,  8,  2, 10,
                12, 4, 14,  6,
                3, 11,  1,  9,
                15, 7, 13,  5
            ];

            const imgData = dCtx.createImageData(4, 4);
            for (let i = 0; i < 16; i++) {
                const threshold = bayer[i] / 16.0;
                const val = Math.floor(threshold * 32); // Sutil textura de 16-bit
                const idx = i * 4;
                imgData.data[idx]     = 0;   // R
                imgData.data[idx + 1] = 20;  // G (tinte militar verdoso)
                imgData.data[idx + 2] = 8;   // B
                imgData.data[idx + 3] = val; // Alfa sutil
            }
            dCtx.putImageData(imgData, 0, 0);

            const dummyCanvas = document.createElement('canvas');
            const dummyCtx = dummyCanvas.getContext('2d');
            if (dummyCtx && dummyCtx.createPattern) {
                ditherPattern = dummyCtx.createPattern(dCanvas, 'repeat');
            }
        } catch (e) {
            // Silencioso en entornos headless
        }
    }

    initBayerDitherPattern();

    // -------------------------------------------------------------------------
    // 2. RADAR SOLITON: HAZ DE BARRIDO SONAR & PINGS ACÚSTICOS
    // -------------------------------------------------------------------------
    let sweepAngle = 0;

    window.renderSolitonSweep = function(ctx) {
        const rx = 665, ry = 14, rw = 120, rh = 90;
        const cx = rx + rw / 2;
        const cy = ry + rh / 2;

        const now = performance.now() * 0.001;
        sweepAngle = (now * 2.2) % (Math.PI * 2);

        ctx.save();
        // Recortar al rectángulo del radar
        ctx.beginPath();
        ctx.rect(rx, ry, rw, rh);
        ctx.clip();

        // A. Haz cónico de barrido giratorio (Sonar Radar Sweep)
        const sweepGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rw * 0.7);
        sweepGrad.addColorStop(0, 'rgba(0, 255, 102, 0.45)');
        sweepGrad.addColorStop(0.5, 'rgba(0, 255, 102, 0.2)');
        sweepGrad.addColorStop(1, 'rgba(0, 255, 102, 0)');

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(sweepAngle);

        ctx.fillStyle = sweepGrad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, rw * 0.75, -0.4, 0);
        ctx.closePath();
        ctx.fill();

        // Línea principal brillante del haz
        ctx.strokeStyle = '#00FF66';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#00FF66';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(rw * 0.75, 0);
        ctx.stroke();
        ctx.restore();

        // B. Rejilla de sonar concéntrica sutil
        ctx.strokeStyle = 'rgba(0, 255, 102, 0.12)';
        ctx.lineWidth = 1;
        for (let r = 20; r <= 55; r += 18) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    };

    // -------------------------------------------------------------------------
    // 3. CAPA DE DITHERING PS1 Y POST-PROCESADO
    // -------------------------------------------------------------------------
    window.renderPS1PostFX = function(ctx) {
        if (!ctx) return;

        // A. Aplicar patrón de dithering Bayer sobre la pantalla completa
        if (ditherPattern) {
            ctx.save();
            ctx.globalCompositeOperation = 'overlay';
            ctx.fillStyle = ditherPattern;
            ctx.fillRect(0, 0, 800, 450);
            ctx.restore();
        }

        // B. Aberración cromática analógica en caso de alerta roja o impacto
        if (gameState.alertState === 'alert') {
            const now = performance.now() * 0.001;
            const flicker = Math.sin(now * 25) * 2;
            if (Math.abs(flicker) > 1.2) {
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = 'rgba(255, 0, 40, 0.05)';
                ctx.fillRect(flicker, 0, 800, 450);
                ctx.fillStyle = 'rgba(0, 200, 255, 0.04)';
                ctx.fillRect(-flicker, 0, 800, 450);
                ctx.restore();
            }
        }

        // C. Dibujar el barrido de Soliton Radar
        window.renderSolitonSweep(ctx);
    };

    // Auto-hook al final del ciclo de dibujado (post-procesado global)
    const _baseDraw = window.draw;
    window.draw = function() {
        if (_baseDraw) _baseDraw();
        if (window.renderPS1PostFX) window.renderPS1PostFX(ctx);
    };

    console.log('%c[GFX] Módulo de Dithering PS1 y Sonar Soliton cargado.', 'color:#34d399');
})();
