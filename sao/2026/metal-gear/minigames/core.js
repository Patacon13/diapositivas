/* =============================================================================
 * METAL GEAR JAVA // MINIGAMES CORE FRAMEWORK
 * Framework unificado para minijuegos interactivos de estructuras de datos:
 *  - Ventana táctica militar HUD (Overlay de ciberseguridad)
 *  - Manejador de excepciones Java en pantalla con traceback visual
 *  - Integración directa con recompensas de sigilo (HP, Keycards, aturdimiento)
 * ============================================================================= */
(function() {
    'use strict';

    // Inyectar estilos CSS para la consola de minijuegos
    const css = document.createElement('style');
    css.textContent = `
        .minigame-overlay {
            position: fixed;
            inset: 0;
            background: rgba(3, 7, 18, 0.94);
            backdrop-filter: blur(8px);
            z-index: 10000;
            display: none;
            justify-content: center;
            align-items: center;
            font-family: 'Share Tech Mono', monospace;
            padding: 20px;
        }
        .minigame-window {
            width: 100%;
            max-width: 820px;
            background: #020617;
            border: 2px solid #00FF66;
            box-shadow: 0 0 35px rgba(0, 255, 102, 0.25);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            position: relative;
        }
        .minigame-header {
            background: #064E3B;
            padding: 10px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #00FF66;
            color: #A7F3D0;
            letter-spacing: 2px;
            font-size: 13px;
            font-weight: 700;
        }
        .minigame-body {
            padding: 20px;
            display: flex;
            flex-direction: column;
            gap: 16px;
            color: #F8FAFC;
        }
        .minigame-prompt {
            background: rgba(15, 23, 42, 0.85);
            border-left: 4px solid #38BDF8;
            padding: 12px 16px;
            font-size: 13px;
            line-height: 1.5;
            color: #E2E8F0;
        }
        .minigame-prompt code {
            color: #38BDF8;
            background: rgba(56, 189, 248, 0.15);
            padding: 2px 6px;
            border-radius: 3px;
        }
        .minigame-exception {
            background: rgba(127, 29, 29, 0.85);
            border-left: 4px solid #EF4444;
            padding: 10px 14px;
            color: #FCA5A5;
            font-size: 12px;
            display: none;
            animation: shakeExp 0.3s ease-in-out;
        }
        @keyframes shakeExp {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-6px); }
            75% { transform: translateX(6px); }
        }
        .minigame-actions {
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            border-top: 1px solid #1E293B;
            padding: 14px 20px;
            background: #090D16;
        }
    `;
    document.head.appendChild(css);

    // Contenedor principal en el DOM
    const overlay = document.createElement('div');
    overlay.className = 'minigame-overlay';
    overlay.id = 'minigame-screen';
    overlay.innerHTML = `
        <div class="minigame-window">
            <div class="minigame-header">
                <span id="mg-title"><i class="fa-solid fa-microchip"></i> SUBRUTINA DE MEMORIA</span>
                <button class="hud-btn" id="mg-close-btn" style="border-color:#EF4444; color:#EF4444; padding:4px 10px; font-size:11px;">
                    <i class="fa-solid fa-xmark"></i> ABORTAR
                </button>
            </div>
            <div class="minigame-body" id="mg-content">
                <!-- Inyectado dinámicamente -->
            </div>
            <div class="minigame-exception" id="mg-exception">
                <i class="fa-solid fa-triangle-exclamation"></i> <span id="mg-exception-text">java.lang.Exception</span>
            </div>
            <div class="minigame-actions" id="mg-footer">
                <!-- Botones de acción del minijuego -->
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('mg-close-btn').onclick = () => window.closeMinigame();

    window.openMinigameModal = function(title, promptHtml, contentHtml, footerHtml) {
        document.getElementById('mg-title').innerHTML = title;
        document.getElementById('mg-content').innerHTML = `
            <div class="minigame-prompt">${promptHtml}</div>
            <div id="mg-interactive-area">${contentHtml}</div>
        `;
        document.getElementById('mg-footer').innerHTML = footerHtml || '';
        document.getElementById('mg-exception').style.display = 'none';
        overlay.style.display = 'flex';
        playSFX('hack-success');
    };

    window.closeMinigame = function() {
        overlay.style.display = 'none';
    };

    window.showJavaException = function(exceptionClass, message) {
        const expBox = document.getElementById('mg-exception');
        const expText = document.getElementById('mg-exception-text');
        expText.innerHTML = `<strong>${exceptionClass}:</strong> ${message}`;
        expBox.style.display = 'block';
        playSFX('damage');
        gameState.screenShake = 0.3;
    };

    console.log('%c[MINIGAMES] Core Framework listo.', 'color:#10b981');
})();
