/* =============================================================================
 * METAL GEAR JAVA // GFX ENGINE: CODEC RETRO AUDIO-VISUAL OVERHAUL
 * Ambientación visual y sonora táctica para el comunicador CODEC:
 *  - VU-Meter interactivo con barras de ecualizador sincronizadas con el diálogo.
 *  - Malla de fósforo CRT y scanlines sobre los marcos de retratos tácticos.
 *  - Animación facial procedural (parpadeo de ojos y sincro labial / talk cycle).
 *  - Ruido blanco de sintonización analógica al cambiar frecuencias de radio.
 * ============================================================================= */
(function() {
    'use strict';

    let vumeterTimer = null;
    let blinkState = false;
    let talkPhase = 0;

    // -------------------------------------------------------------------------
    // 1. ECUALIZADOR DINÁMICO DE BARRAS (VU-METER)
    // -------------------------------------------------------------------------
    let lastMsgText = '';
    let textChangeGrace = 0;

    function updateVUMeter() {
        const codecScreen = document.getElementById('codec-screen');
        if (!codecScreen || codecScreen.style.display !== 'flex') return;

        // Detección robusta de typing (timer activo, flag global o texto mutando)
        let isTyping = Boolean(window.isCodecTyping) || Boolean(window.typewriterTimer);
        const msgElem = document.getElementById('codec-message');
        if (msgElem) {
            const currentText = msgElem.textContent || '';
            if (currentText !== lastMsgText) {
                lastMsgText = currentText;
                textChangeGrace = 4; // Mantener modulación 4 frames
            }
        }
        if (textChangeGrace > 0) {
            textChangeGrace--;
            isTyping = true;
        }

        const bars = document.querySelectorAll('#codec-vumeter .vumeter-bar');
        if (!bars || bars.length === 0) return;

        const now = performance.now() * 0.01;

        bars.forEach((bar, idx) => {
            let h = 3;
            if (isTyping) {
                // Ondas armónicas de 5 bandas simulando modulación de voz humana
                const wave = Math.sin(now * 2.2 + idx * 1.1) * 0.55 + Math.cos(now * 3.4 - idx * 0.6) * 0.45;
                const peak = Math.max(0, wave);
                h = Math.floor(4 + peak * 14);
            } else {
                // Ruido de fondo en reposo (carrier signal tenue de radiofrecuencia)
                h = (idx === 2) ? 5 : (3 + Math.floor(Math.sin(now * 0.5 + idx) * 2));
            }
            bar.style.height = `${Math.max(2, Math.min(18, h))}px`;
            bar.style.backgroundColor = isTyping ? '#00FF66' : '#008F39';
            bar.style.boxShadow = isTyping ? '0 0 8px #00FF66' : 'none';
        });

        // ---------------------------------------------------------------------
        // 2. PARPADEO Y SINCRONIZACIÓN LABIAL PROCEDURAL
        // ---------------------------------------------------------------------
        if (Math.random() < 0.012) {
            blinkState = true;
            setTimeout(() => { blinkState = false; }, 120);
        }

        const contactFrame = document.getElementById('codec-contact-portrait');
        if (contactFrame) {
            // Animar boca con la clase unificada .codec-mouth o fallbacks
            const mouthTargets = contactFrame.querySelectorAll('.codec-mouth, .codec-mouth *, path[stroke="#B45309"], line[stroke="#FFFFFF"], path[stroke="#D7A984"]');
            if (mouthTargets.length > 0 && isTyping) {
                talkPhase += 0.45;
                const mouthOpen = Math.sin(talkPhase) > 0;
                mouthTargets.forEach(m => {
                    m.style.transform = mouthOpen ? 'scaleY(1.9)' : 'scaleY(1.0)';
                    m.style.transformOrigin = '50% 56%';
                });
            } else if (mouthTargets.length > 0) {
                mouthTargets.forEach(m => {
                    m.style.transform = 'scaleY(1.0)';
                });
            }
        }
    }

    // Iniciar bucle de actualización del ecualizador
    setInterval(updateVUMeter, 45);

    // -------------------------------------------------------------------------
    // 3. EFECTO DE BARRIDO DE FRECUENCIA ANALÓGICA AL CAMBIAR DE CONTACTO
    // -------------------------------------------------------------------------
    window.triggerCodecFrequencyNoise = function() {
        try {
            // Sintetizar estática de sintonizador militar con Web Audio API (chiptune noise)
            const audioCtx = window.getAudioContext && window.getAudioContext();
            if (audioCtx && audioCtx.state === 'running' && !gameState.soundMuted) {
                const bufferSize = audioCtx.sampleRate * 0.08; // 80ms de estática
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * 0.15;
                }
                const noise = audioCtx.createBufferSource();
                noise.buffer = buffer;
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1800;

                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

                noise.connect(filter);
                filter.connect(gain);
                gain.connect(audioCtx.destination);
                noise.start();
            }
        } catch (e) {
            // Silencioso
        }

        // Efecto visual de parpadeo de scanlines en los retratos
        const portraits = document.querySelectorAll('.portrait-frame');
        portraits.forEach(p => {
            p.style.filter = 'brightness(1.8) contrast(1.4) hue-rotate(90deg)';
            setTimeout(() => {
                p.style.filter = 'none';
            }, 90);
        });
    };

    // Auto-hook a tuneCodecContact
    const _baseTune = window.tuneCodecContact;
    if (typeof _baseTune === 'function') {
        window.tuneCodecContact = function(idx) {
            _baseTune(idx);
            window.triggerCodecFrequencyNoise();
        };
    }

    // Inyectar estilos CSS para scanlines sobre retratos del Codec
    try {
        const style = document.createElement('style');
        style.textContent = `
            .portrait-frame::after {
                content: " ";
                display: block;
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.4) 50%),
                            linear-gradient(90deg, rgba(0, 255, 102, 0.06), rgba(0, 0, 0, 0.02));
                background-size: 100% 3px, 4px 100%;
                pointer-events: none;
                border-radius: 6px;
            }
            .vumeter-bar {
                transition: height 0.04s cubic-bezier(0.1, 0.9, 0.2, 1);
            }
        `;
        document.head.appendChild(style);
    } catch (e) {}

    console.log('%c[GFX] Módulo de Efectos Audiovisuales de CODEC cargado.', 'color:#38bdf8');
})();
