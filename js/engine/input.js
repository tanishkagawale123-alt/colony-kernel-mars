/**
 * COLONY KERNEL: MARS - Input Controller
 * Handles WASD, Shift, Space, E interact, TAB Kernel mode, ESC, 1-5 hotkeys, and mouse rotation.
 */

class InputController {
    constructor() {
        this.keys = {};
        this.keysPressedThisFrame = {};
        this.mouse = { x: 0, y: 0, deltaX: 0, deltaY: 0, isDown: false };
        this.isPointerLocked = false;
        this.isUIActive = false; // When modal/Kernel OS is open

        this.setupListeners();
    }

    setupListeners() {
        window.addEventListener('keydown', (e) => {
            // Prevent default for game keys if not typing in input
            if (['Space', 'Tab', 'KeyE', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    if (e.code === 'Tab') e.preventDefault();
                }
            }

            if (!this.keys[e.code]) {
                this.keysPressedThisFrame[e.code] = true;
            }
            this.keys[e.code] = true;

            // Trigger global hotkeys
            if (e.code === 'Tab') {
                if (window.game) window.game.toggleKernelMode();
            } else if (e.code === 'Escape') {
                if (window.game) window.game.handleEscape();
            } else if (e.code === 'KeyE') {
                if (window.game) window.game.handleInteractKey();
            } else if (e.code === 'KeyR') {
                if (window.game && !this.isUIActive) window.game.toggleRoverMode();
            }
        });

        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isPointerLocked) {
                this.mouse.deltaX = e.movementX || 0;
                this.mouse.deltaY = e.movementY || 0;
            } else if (this.mouse.isDown && !this.isUIActive) {
                this.mouse.deltaX = e.movementX || 0;
                this.mouse.deltaY = e.movementY || 0;
            }
        });

        window.addEventListener('mousedown', (e) => {
            if (e.button === 0 && !this.isUIActive) {
                this.mouse.isDown = true;
                // Optional pointer lock request on canvas click
                if (e.target.tagName === 'CANVAS' && !this.isPointerLocked) {
                    // Try to request pointer lock if desired
                }
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.mouse.isDown = false;
            }
        });

        // Touch support for mobile / tablet
        let touchStartX = 0;
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0 && !this.isUIActive) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0 && !this.isUIActive) {
                const currentX = e.touches[0].clientX;
                const currentY = e.touches[0].clientY;
                this.mouse.deltaX = (currentX - touchStartX) * 0.7;
                this.mouse.deltaY = (currentY - touchStartY) * 0.7;
                touchStartX = currentX;
                touchStartY = currentY;
            }
        }, { passive: true });
    }

    isKeyDown(code) {
        if (this.isUIActive && code !== 'Escape' && code !== 'Tab') return false;
        return !!this.keys[code];
    }

    isKeyJustPressed(code) {
        return !!this.keysPressedThisFrame[code];
    }

    getMovementVector() {
        const move = { forward: 0, strafe: 0, sprint: false, jump: false };
        if (this.isUIActive) return move;

        if (this.isKeyDown('KeyW') || this.isKeyDown('ArrowUp')) move.forward += 1;
        if (this.isKeyDown('KeyS') || this.isKeyDown('ArrowDown')) move.forward -= 1;
        if (this.isKeyDown('KeyD') || this.isKeyDown('ArrowRight')) move.strafe += 1;
        if (this.isKeyDown('KeyA') || this.isKeyDown('ArrowLeft')) move.strafe -= 1;

        move.sprint = this.isKeyDown('ShiftLeft') || this.isKeyDown('ShiftRight');
        move.jump = this.isKeyDown('Space');

        return move;
    }

    update() {
        // Reset frame-specific inputs
        this.keysPressedThisFrame = {};
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
    }
}

window.inputController = new InputController();
