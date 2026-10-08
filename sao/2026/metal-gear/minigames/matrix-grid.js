/* =============================================================================
 * METAL GEAR JAVA // MINIGAME: MATRIX GRID (MATRICES BIDIMENSIONALES)
 * Simulación visual de memoria física para Matrices 2D:
 *  - Recorrido por filas (Row-Major) vs columnas (Column-Major)
 *  - Diagonal principal y secundaria
 *  - Detección de ArrayIndexOutOfBoundsException y fallas de flujo
 * ============================================================================= */
(function() {
    'use strict';

    const css = document.createElement('style');
    css.textContent = `
        .matrix-grid-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            margin: 20px 0;
        }
        .matrix-row {
            display: flex;
            gap: 8px;
        }
        .matrix-cell {
            width: 64px;
            height: 64px;
            background: #0F172A;
            border: 2px solid #334155;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: all 0.2s ease;
            user-select: none;
        }
        .matrix-cell:hover {
            border-color: #38BDF8;
            transform: scale(1.05);
            box-shadow: 0 0 14px rgba(56, 189, 248, 0.4);
        }
        .matrix-cell.selected {
            border-color: #00FF66;
            background: #064E3B;
            box-shadow: 0 0 16px rgba(0, 255, 102, 0.6);
        }
        .matrix-cell-val {
            font-size: 20px;
            font-weight: 900;
            color: #F8FAFC;
        }
        .matrix-cell-coord {
            font-size: 9.5px;
            color: #94A3B8;
            letter-spacing: 0.5px;
        }
    `;
    document.head.appendChild(css);

    let matrixData = [];
    let requiredSequence = [];
    let currentStep = 0;
    let onMatrixComplete = null;

    // Iniciar minijuego de Diagonal Principal
    window.startMatrixDiagonalMinigame = function(callback) {
        onMatrixComplete = callback;
        matrixData = [
            [14, 5, 23],
            [9, 42, 17],
            [88, 31, 99]
        ];
        requiredSequence = ['0,0', '1,1', '2,2'];
        currentStep = 0;
        renderMatrixUI();
    };

    function renderMatrixUI() {
        const title = '<i class="fa-solid fa-table-cells"></i> MATRIX GRID // DIAGONAL PRINCIPAL (f == c)';
        const prompt = `
            <strong>DIRECTIVA CIBERNÉTICA:</strong> Activá todas las celdas de memoria pertenecientes a la <strong>Diagonal Principal</strong> <code>(fila == columna)</code>.<br>
            Cuidado: pulsar un índice fuera de la diagonal disparará una alerta de excepción.
        `;

        let gridHtml = '<div class="matrix-grid-wrapper">';
        for (let r = 0; r < matrixData.length; r++) {
            gridHtml += '<div class="matrix-row">';
            for (let c = 0; c < matrixData[r].length; c++) {
                const coord = `${r},${c}`;
                const isSelected = requiredSequence.slice(0, currentStep).includes(coord);
                gridHtml += `
                    <div class="matrix-cell ${isSelected ? 'selected' : ''}" onclick="window.clickMatrixCell(${r}, ${c})">
                        <span class="matrix-cell-val">${matrixData[r][c]}</span>
                        <span class="matrix-cell-coord">[${r}][${c}]</span>
                    </div>
                `;
            }
            gridHtml += '</div>';
        }
        gridHtml += '</div>';

        const footer = `
            <span style="font-size:12px; color:#A7F3D0; align-self:center;">PROGRESO DIAGONAL: ${currentStep} / ${requiredSequence.length}</span>
        `;

        window.openMinigameModal(title, prompt, gridHtml, footer);
    }

    window.clickMatrixCell = function(r, c) {
        const coord = `${r},${c}`;
        const targetCoord = requiredSequence[currentStep];

        if (r !== c) {
            window.showJavaException('IndexMismatchException', `La celda [${r}][${c}] no pertenece a la diagonal principal. Condición obligatoria: (r == c).`);
            return;
        }

        if (coord === targetCoord) {
            currentStep++;
            playTone(550 + currentStep * 120, 0.08, 'sine', 0.1);
            renderMatrixUI();

            if (currentStep >= requiredSequence.length) {
                setTimeout(() => {
                    playSFX('hack-success');
                    showToast("¡MATRIZ SINCRONIZADA! Diagonal principal verificada con éxito.");
                    window.closeMinigame();
                    if (onMatrixComplete) onMatrixComplete();
                }, 500);
            }
        }
    };

    console.log('%c[MINIGAMES] Matrix Grid cargado.', 'color:#a78bfa');
})();
