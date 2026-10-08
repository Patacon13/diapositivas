/* =============================================================================
 * METAL GEAR JAVA // MINIGAME: ARRAY VAULT (ARREGLOS UNIDIMENSIONALES)
 * Simulación visual de memoria física para Arreglos 1D:
 *  - Swap y Bubble Sort paso a paso con validación de adyacencia
 *  - Corrimiento de inserción con prevención de sobreescritura de datos
 *  - Excepciones Java en tiempo real si el estudiante rompe invariantes
 * ============================================================================= */
(function() {
    'use strict';

    // Inyectar estilos para el renderizado del vector
    const css = document.createElement('style');
    css.textContent = `
        .array-vault-container {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            margin: 24px 0;
            flex-wrap: wrap;
        }
        .array-cell {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 72px;
            background: #0F172A;
            border: 2px solid #334155;
            padding: 8px 4px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            user-select: none;
        }
        .array-cell:hover {
            border-color: #38BDF8;
            transform: translateY(-4px);
            box-shadow: 0 4px 14px rgba(56, 189, 248, 0.3);
        }
        .array-cell.selected {
            border-color: #F59E0B;
            background: #451A03;
            transform: translateY(-6px);
            box-shadow: 0 0 18px rgba(245, 158, 11, 0.5);
        }
        .array-cell.sorted {
            border-color: #00FF66;
            background: #064E3B;
        }
        .array-val {
            font-size: 26px;
            font-weight: 900;
            color: #00FF66;
            text-shadow: 0 0 8px rgba(0, 255, 102, 0.6);
            margin: 6px 0;
        }
        .array-idx {
            font-size: 11px;
            color: #94A3B8;
            letter-spacing: 1px;
        }
        .array-addr {
            font-size: 9px;
            color: #475569;
            font-family: monospace;
        }
        .array-swap-bar {
            display: flex;
            justify-content: center;
            gap: 8px;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(css);

    let currentArray = [];
    let selectedIndices = [];
    let onCompleteCallback = null;

    // Iniciar minijuego de Bubble Sort paso a paso
    window.startBubbleSortMinigame = function(callback) {
        onCompleteCallback = callback;
        // Vector inicial desordenado
        currentArray = [54, 18, 92, 31, 7];
        selectedIndices = [];
        renderArrayVaultUI();
    };

    function renderArrayVaultUI() {
        const title = '<i class="fa-solid fa-arrow-down-1-9"></i> ARRAY VAULT // BUBBLE SORT PASO A PASO';
        const prompt = `
            <strong>DIRECTIVA DE REORDENAMIENTO:</strong> Seleccioná <strong>dos índices adyacentes</strong> <code>(i, i+1)</code> para ejecutar un intercambio <code>swap(i, i+1)</code> si están desordenados.<br>
            La memoria debe quedar ordenada en sentido ascendente de menor a mayor.
        `;

        let cellsHtml = '<div class="array-vault-container">';
        currentArray.forEach((val, idx) => {
            const isSel = selectedIndices.includes(idx);
            const isSorted = isArraySorted() && selectedIndices.length === 0;
            cellsHtml += `
                <div class="array-cell ${isSel ? 'selected' : ''} ${isSorted ? 'sorted' : ''}" onclick="window.selectArrayCell(${idx})">
                    <span class="array-addr">0x${(idx * 4).toString(16).toUpperCase().padStart(2, '0')}</span>
                    <span class="array-val">${val}</span>
                    <span class="array-idx">[${idx}]</span>
                </div>
            `;
        });
        cellsHtml += '</div>';

        const footer = `
            <button class="hud-btn" onclick="window.executeArraySwap()" style="background:rgba(0, 255, 102, 0.2); border-color:#00FF66;">
                <i class="fa-solid fa-repeat"></i> EJECUTAR SWAP
            </button>
        `;

        window.openMinigameModal(title, prompt, cellsHtml, footer);
    }

    window.selectArrayCell = function(idx) {
        if (selectedIndices.includes(idx)) {
            selectedIndices = selectedIndices.filter(i => i !== idx);
        } else {
            if (selectedIndices.length < 2) {
                selectedIndices.push(idx);
            } else {
                selectedIndices = [selectedIndices[1], idx];
            }
        }
        renderArrayVaultUI();
    };

    window.executeArraySwap = function() {
        if (selectedIndices.length !== 2) {
            window.showJavaException('IllegalArgumentException', 'Debés seleccionar exactamente 2 celdas para el swap.');
            return;
        }

        const [i, j] = selectedIndices.sort((a, b) => a - b);

        // 1. Validar adyacencia
        if (j - i !== 1) {
            window.showJavaException('AssertionError', `Bubble Sort solo permite comparar elementos adyacentes. Índices seleccionados: [${i}] y [${j}].`);
            return;
        }

        // 2. Validar condición de orden
        if (currentArray[i] <= currentArray[j]) {
            window.showJavaException('LogicError', `currentArray[${i}] (${currentArray[i]}) ya es menor o igual a currentArray[${j}] (${currentArray[j]}). Este intercambio rompería la estabilidad.`);
            return;
        }

        // Ejecutar swap
        const tmp = currentArray[i];
        currentArray[i] = currentArray[j];
        currentArray[j] = tmp;

        selectedIndices = [];
        playTone(660, 0.08, 'square', 0.1);
        renderArrayVaultUI();

        // Verificar si se completó el ordenamiento
        if (isArraySorted()) {
            setTimeout(() => {
                playSFX('hack-success');
                showToast("¡ARRAY VAULT DESBLOQUEADO! Vector ordenado con éxito (+25 HP / Subrutina OK)");
                if (gameState.player) gameState.player.hp = Math.min(100, gameState.player.hp + 25);
                updateHealthHUD();
                window.closeMinigame();
                if (onCompleteCallback) onCompleteCallback();
            }, 600);
        }
    };

    function isArraySorted() {
        for (let i = 0; i < currentArray.length - 1; i++) {
            if (currentArray[i] > currentArray[i + 1]) return false;
        }
        return true;
    }

    console.log('%c[MINIGAMES] Array Vault cargado.', 'color:#38bdf8');
})();
