
// Simple DevTools Toolkit for Content Editing
(function () {
    // Keybind: Ctrl + Shift + E
    const KEY_COMBINATION = {
        ctrlKey: true,
        shiftKey: true,
        key: 'E'
    };

    let isEditMode = false;
    let indicator = null;

    function toggleEditMode() {
        isEditMode = !isEditMode;

        // Toggle Design Mode
        document.designMode = isEditMode ? 'on' : 'off';

        // Show/Hide Indicator
        updateIndicator();

        // Optional: Console log
        console.log(`[UCPS DevTools] Edit Mode: ${isEditMode ? 'ENABLED' : 'DISABLED'}`);
    }

    function updateIndicator() {
        if (isEditMode) {
            if (!indicator) {
                indicator = document.createElement('div');
                indicator.style.position = 'fixed';
                indicator.style.bottom = '10px';
                indicator.style.right = '10px';
                indicator.style.padding = '8px 12px';
                indicator.style.background = '#ff0055';
                indicator.style.color = '#fff';
                indicator.style.borderRadius = '4px';
                indicator.style.fontFamily = 'monospace';
                indicator.style.fontSize = '12px';
                indicator.style.zIndex = '9999';
                indicator.style.pointerEvents = 'none'; // click through
                indicator.style.boxShadow = '0 0 10px rgba(255, 0, 85, 0.5)';
                indicator.innerText = 'DEV MODE: EDITABLE';
                document.body.appendChild(indicator);
            } else {
                indicator.style.display = 'block';
            }
        } else {
            if (indicator) {
                indicator.style.display = 'none';
            }
        }
    }

    document.addEventListener('keydown', (e) => {
        // Check for key combo
        if (e.ctrlKey === KEY_COMBINATION.ctrlKey &&
            e.shiftKey === KEY_COMBINATION.shiftKey &&
            e.key.toUpperCase() === KEY_COMBINATION.key) {
            e.preventDefault();
            toggleEditMode();
        }
    });

    console.log('[UCPS DevTools] Loaded. Press Ctrl+Shift+E to toggle edit mode.');
})();
