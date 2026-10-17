/**
 * =============================================================================
 * METAL GEAR JAVA 3D // CYBER-TACTICAL AUDIO & FORMANT RADIO COMMS ENGINE
 * 100% Web Audio API Procedural — CERO uso de voces robóticas TTS del navegador.
 *  - Sintetizador Vocal por Formantes con perfiles únicos por personaje
 *  - Efecto de Radio Militar (Squelch Burst + Bandpass Walkie-Talkie)
 *  - Barks de Radio para Centinelas (?, !, CQC, Sabotaje)
 *  - Banda Sonora Adaptativa Cyber-Stealth a 125 BPM (Sneaking/Caution/Alert/Boss)
 * =============================================================================
 */
(function () {
    'use strict';

    const VOICE_PROFILES = {
        'SOLID BYTE': { base: 116, wave: 'sawtooth', f1: 760, q: 3.5, vol: 0.055 },
        'CORONEL': { base: 94, wave: 'sawtooth', f1: 620, q: 4.0, vol: 0.06 },
        'TUTORA DE ENLACE // SYS': { base: 235, wave: 'triangle', f1: 1420, q: 2.8, vol: 0.055 },
        'CAPITÁN': { base: 132, wave: 'square', f1: 880, q: 3.2, vol: 0.048 },
        'TUTORA DE LÓGICA // LAB': { base: 248, wave: 'triangle', f1: 1520, q: 2.8, vol: 0.055 },
        'TUTOR DE DEBUGGING // LAB': { base: 156, wave: 'sawtooth', f1: 1080, q: 3.0, vol: 0.052 },
        'TUTOR DE ALGORITMOS // LAB': { base: 142, wave: 'triangle', f1: 960, q: 3.0, vol: 0.055 },
        'PSYCHO MANTIS': { base: 182, wave: 'sawtooth', f1: 1250, q: 6.0, vol: 0.055, detune: 18 }
    };

    let audioCtx = null;
    let masterGain = null;
    let soundEnabled = true;
    let musicTheme = 'none';
    let musicInterval = null;
    let musicStep = 0;
    let noiseBufCache = null;
    let lastDamageTime = 0;

    function getCtx() {
        if (!soundEnabled) return null;
        if (!audioCtx) {
            const AC = window.AudioContext || window.webkitAudioContext;
            if (AC) {
                audioCtx = new AC();
                masterGain = audioCtx.createGain();
                masterGain.gain.value = 0.36;
                masterGain.connect(audioCtx.destination);
            }
        }
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume().catch(() => {});
        }
        return audioCtx;
    }

    function getNoiseBuffer(ctx) {
        if (noiseBufCache) return noiseBufCache;
        const sr = ctx.sampleRate || 44100;
        const len = Math.floor(sr * 0.25);
        const buf = ctx.createBuffer(1, len, sr);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        noiseBufCache = buf;
        return buf;
    }

    function playTone(freq, duration, type = 'sine', vol = 0.08, delay = 0) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        try {
            const now = (ctx.currentTime || 0) + delay;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(Math.max(24, freq), now);
            g.gain.setValueAtTime(Math.max(0.0001, vol), now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.015, duration));
            osc.connect(g);
            g.connect(masterGain);
            osc.start(now);
            osc.stop(now + duration + 0.01);
        } catch (e) {}
    }

    // -------------------------------------------------------------------------
    // 1. RADIO SQUELCH & FORMANT VOICE SYNTHESIZER (CERO WEB SPEECH API)
    // -------------------------------------------------------------------------
    function playRadioSquelch(isOpen = true) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        try {
            const now = ctx.currentTime || 0;
            // 1. Ruido blanco filtrado tipo Walkie-Talkie ("Kshhh")
            const nSrc = ctx.createBufferSource();
            nSrc.buffer = getNoiseBuffer(ctx);
            const filt = ctx.createBiquadFilter();
            filt.type = 'bandpass';
            filt.frequency.setValueAtTime(1450, now);
            filt.Q.setValueAtTime(2.4, now);
            const nGain = ctx.createGain();
            nGain.gain.setValueAtTime(0.08, now);
            nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
            nSrc.connect(filt);
            filt.connect(nGain);
            nGain.connect(masterGain);
            nSrc.start(now);
            nSrc.stop(now + 0.05);

            // 2. Doble chirp táctico de transmisión
            if (isOpen) {
                playTone(1480, 0.035, 'sine', 0.06, 0.02);
                playTone(1975, 0.055, 'sine', 0.07, 0.055);
            } else {
                playTone(1760, 0.03, 'sine', 0.05, 0.01);
                playTone(1175, 0.045, 'sine', 0.05, 0.04);
            }
        } catch (e) {}
    }

    function playVoiceBlip(speakerName, charStr) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        if (!charStr || charStr === ' ' || charStr === '.' || charStr === ',') return;

        const profile = VOICE_PROFILES[speakerName] || VOICE_PROFILES['CORONEL'];
        try {
            const now = ctx.currentTime || 0;
            const code = typeof charStr === 'number' ? charStr : (String(charStr).charCodeAt(0) || 65);
            // Variación melódica natural según la letra sin parecer robot plano
            const pitchMod = ((code * 13) % 29) - 14;
            const freq = Math.max(65, profile.base + pitchMod * (profile.base > 180 ? 1.8 : 0.9));

            const osc = ctx.createOscillator();
            const filt = ctx.createBiquadFilter();
            const g = ctx.createGain();

            osc.type = profile.wave;
            osc.frequency.setValueAtTime(freq, now);
            osc.frequency.linearRampToValueAtTime(freq * 0.94, now + 0.036);

            filt.type = 'bandpass';
            filt.frequency.setValueAtTime(profile.f1 + pitchMod * 12, now);
            filt.Q.setValueAtTime(profile.q || 3.0, now);

            g.gain.setValueAtTime(0.001, now);
            g.gain.linearRampToValueAtTime(profile.vol, now + 0.006);
            g.gain.exponentialRampToValueAtTime(0.0008, now + 0.038);

            osc.connect(filt);
            filt.connect(g);
            g.connect(masterGain);

            osc.start(now);
            osc.stop(now + 0.042);

            if (profile.detune) {
                const osc2 = ctx.createOscillator();
                osc2.type = 'triangle';
                osc2.frequency.setValueAtTime(freq + profile.detune, now);
                osc2.connect(filt);
                osc2.start(now);
                osc2.stop(now + 0.042);
            }
        } catch (e) {}
    }

    function playGuardBark(type) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        playRadioSquelch(true);
        if (type === 'curious') {
            // "¿Eh? ¿Qué fue eso?" -> Entonación ascendente interrogativa
            playTone(125, 0.06, 'sawtooth', 0.06, 0.05);
            playTone(148, 0.07, 'sawtooth', 0.065, 0.12);
            playTone(195, 0.11, 'sawtooth', 0.075, 0.20);
        } else if (type === 'alert') {
            // "¡CONTACTO HOSTIL!" -> Urgente y marcial
            playTone(210, 0.06, 'sawtooth', 0.08, 0.04);
            playTone(185, 0.06, 'sawtooth', 0.08, 0.11);
            playTone(240, 0.12, 'sawtooth', 0.09, 0.18);
        } else if (type === 'cqc') {
            // "¡Ugh!" -> Derribo táctico
            playTone(135, 0.07, 'sawtooth', 0.09, 0.01);
            playTone(72, 0.16, 'triangle', 0.11, 0.07);
        }
    }

    // -------------------------------------------------------------------------
    // 2. EFECTOS DE SONIDO TÁCTICOS 3D (SFX)
    // -------------------------------------------------------------------------
    function playSFX(name) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        const now = ctx.currentTime || 0;

        switch (name) {
            case 'alert': {
                // El mítico sonido "¡!" de MGS reinventado con pegada moderna
                [0, 0.055, 0.11].forEach((d, idx) => {
                    playTone(880 + idx * 310, 0.08, 'sawtooth', 0.14, d);
                    playTone(1320 + idx * 380, 0.08, 'square', 0.10, d);
                });
                playGuardBark('alert');
                break;
            }
            case 'curious': {
                playGuardBark('curious');
                break;
            }
            case 'cqc': {
                playGuardBark('cqc');
                break;
            }
            case 'dash': {
                playTone(320, 0.05, 'sine', 0.07, 0);
                playTone(180, 0.09, 'triangle', 0.06, 0.03);
                break;
            }
            case 'knock': {
                playTone(180, 0.045, 'triangle', 0.14, 0);
                playTone(140, 0.055, 'triangle', 0.12, 0.11);
                break;
            }
            case 'emp': {
                for (let i = 0; i < 6; i++) {
                    playTone(900 - i * 110, 0.06, 'sawtooth', 0.07, i * 0.035);
                }
                break;
            }
            case 'sabotage': {
                playTone(440, 0.06, 'square', 0.09, 0);
                playTone(660, 0.06, 'square', 0.09, 0.06);
                playTone(880, 0.12, 'sawtooth', 0.11, 0.12);
                playTone(110, 0.28, 'sawtooth', 0.14, 0.18);
                break;
            }
            case 'hack-success': {
                playTone(523.25, 0.07, 'triangle', 0.09, 0);
                playTone(659.25, 0.07, 'triangle', 0.09, 0.07);
                playTone(783.99, 0.07, 'triangle', 0.09, 0.14);
                playTone(1046.5, 0.18, 'sine', 0.11, 0.21);
                break;
            }
            case 'door-open': {
                playTone(240, 0.08, 'sine', 0.07, 0);
                playTone(360, 0.11, 'sine', 0.07, 0.06);
                break;
            }
            case 'door-locked': {
                playTone(150, 0.08, 'sawtooth', 0.09, 0);
                playTone(120, 0.11, 'sawtooth', 0.09, 0.09);
                break;
            }
            case 'coffee': {
                playTone(587.33, 0.07, 'sine', 0.09, 0);
                playTone(880.0, 0.14, 'sine', 0.10, 0.08);
                break;
            }
            case 'box': {
                playTone(220, 0.05, 'triangle', 0.08, 0);
                playTone(330, 0.07, 'sine', 0.07, 0.04);
                break;
            }
            case 'visor': {
                playTone(620, 0.04, 'sine', 0.06, 0);
                playTone(1240, 0.08, 'sine', 0.06, 0.035);
                break;
            }
            case 'boss-laser': {
                playTone(740, 0.09, 'sawtooth', 0.09, 0);
                playTone(370, 0.14, 'sawtooth', 0.09, 0.05);
                break;
            }
            case 'boss-hit': {
                playTone(95, 0.22, 'sawtooth', 0.16, 0);
                playTone(580, 0.12, 'square', 0.11, 0.04);
                break;
            }
            case 'boss-roar': {
                playTone(82, 0.32, 'sawtooth', 0.14, 0);
                playTone(65, 0.38, 'sawtooth', 0.14, 0.12);
                break;
            }
            case 'damage': {
                if (now - lastDamageTime < 0.16) return;
                lastDamageTime = now;
                playTone(115, 0.09, 'sawtooth', 0.12, 0);
                playTone(78, 0.11, 'square', 0.10, 0.04);
                break;
            }
            case 'game-over': {
                playTone(392.0, 0.18, 'sawtooth', 0.11, 0);
                playTone(349.23, 0.18, 'sawtooth', 0.11, 0.20);
                playTone(311.13, 0.22, 'sawtooth', 0.11, 0.40);
                playTone(261.63, 0.55, 'sawtooth', 0.13, 0.64);
                break;
            }
            case 'codec-ring':
            case 'codec-open': {
                playRadioSquelch(true);
                break;
            }
            case 'codec-click': {
                playTone(1350, 0.02, 'sine', 0.04, 0);
                break;
            }
        }
    }

    // -------------------------------------------------------------------------
    // 3. BANDA SONORA ADAPTATIVA CYBER-STEALTH (125 BPM)
    // -------------------------------------------------------------------------
    const STEP_MS = 120; // 125 BPM semicorchea
    const sneakBass = [73.42, 0, 73.42, 87.31, 0, 73.42, 98.0, 87.31, 73.42, 0, 73.42, 87.31, 110.0, 98.0, 87.31, 82.41];
    const sneakPad  = [293.66, 0, 0, 0, 349.23, 0, 0, 0, 329.63, 0, 0, 0, 261.63, 0, 0, 0];
    const alertBass = [110, 110, 130.81, 110, 146.83, 110, 164.81, 146.83, 110, 110, 130.81, 110, 174.61, 164.81, 146.83, 130.81];
    const alertLead = [440, 0, 523.25, 493.88, 440, 0, 659.25, 587.33, 698.46, 0, 659.25, 523.25, 587.33, 659.25, 698.46, 783.99];
    const bossBass  = [65.41, 65.41, 77.78, 65.41, 87.31, 77.78, 65.41, 98.0, 65.41, 65.41, 77.78, 65.41, 103.83, 98.0, 87.31, 77.78];

    function playKick(vol = 0.14) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        try {
            const now = ctx.currentTime || 0;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(135, now);
            osc.frequency.exponentialRampToValueAtTime(34, now + 0.09);
            g.gain.setValueAtTime(vol, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
            osc.connect(g);
            g.connect(masterGain);
            osc.start(now);
            osc.stop(now + 0.12);
        } catch (e) {}
    }

    function playHat(vol = 0.03) {
        const ctx = getCtx();
        if (!ctx || !masterGain) return;
        try {
            const now = ctx.currentTime || 0;
            const src = ctx.createBufferSource();
            src.buffer = getNoiseBuffer(ctx);
            const hp = ctx.createBiquadFilter();
            hp.type = 'highpass';
            hp.frequency.setValueAtTime(6500, now);
            const g = ctx.createGain();
            g.gain.setValueAtTime(vol, now);
            g.gain.exponentialRampToValueAtTime(0.0008, now + 0.028);
            src.connect(hp);
            hp.connect(g);
            g.connect(masterGain);
            src.start(now);
            src.stop(now + 0.032);
        } catch (e) {}
    }

    function onMusicTick() {
        if (!soundEnabled || musicTheme === 'none') return;
        const s = musicStep % 16;
        musicStep++;

        if (musicTheme === 'sneaking' || musicTheme === 'caution') {
            if (sneakBass[s] > 0) playTone(sneakBass[s], 0.16, 'triangle', 0.065);
            if (sneakPad[s] > 0) playTone(sneakPad[s], 0.36, 'sine', 0.025);
            if (s % 4 === 0) playKick(0.08);
            if (s % 2 === 1) playHat(musicTheme === 'caution' ? 0.035 : 0.018);
            if (musicTheme === 'caution' && s % 2 === 0) {
                playTone(sneakBass[s] * 2 || 220, 0.08, 'sine', 0.03);
            }
        } else if (musicTheme === 'alert') {
            if (alertBass[s] > 0) playTone(alertBass[s], 0.11, 'sawtooth', 0.06);
            if (alertLead[s] > 0) playTone(alertLead[s], 0.10, 'square', 0.038);
            if (s % 2 === 0) playKick(0.14);
            playHat(0.035);
        } else if (musicTheme === 'boss' || musicTheme === 'boss-rage') {
            if (bossBass[s] > 0) playTone(bossBass[s], 0.12, 'sawtooth', 0.075);
            if (alertLead[s] > 0) playTone(alertLead[s] * 0.75, 0.11, 'sawtooth', 0.042);
            if (s % 2 === 0) playKick(0.16);
            if (s % 2 === 1) playHat(0.04);
        }
    }

    function setMusicTheme(theme) {
        musicTheme = theme || 'none';
        if (musicTheme === 'none') {
            if (musicInterval) {
                clearInterval(musicInterval);
                musicInterval = null;
            }
            return;
        }
        if (!musicInterval) {
            musicInterval = setInterval(onMusicTick, STEP_MS);
        }
    }

    function toggleAudio() {
        soundEnabled = !soundEnabled;
        if (!soundEnabled && musicInterval) {
            clearInterval(musicInterval);
            musicInterval = null;
        } else if (soundEnabled && musicTheme !== 'none' && !musicInterval) {
            musicInterval = setInterval(onMusicTick, STEP_MS);
        }
        return soundEnabled;
    }

    window.MGS3D_AUDIO = {
        getCtx,
        initAudio: getCtx,
        playTone,
        playSFX,
        playRadioSquelch,
        playVoiceBlip,
        playGuardBark,
        setMusicTheme,
        toggleAudio,
        toggleMute: () => !toggleAudio(),
        isSoundEnabled: () => soundEnabled
    };
})();
