/**
 * COLONY KERNEL: MARS - Pixel Companion Robot
 * Floating Mars robot pet with dynamic LED face expressions, follow AI, emotion beeps, and dances.
 */

class PixelCompanion {
    constructor(scene, playerTarget) {
        this.scene = scene;
        this.playerTarget = playerTarget; // mesh or position

        this.mood = 'happy'; // 'happy', 'worried', 'danger', 'scan', 'dance', 'idle'
        this.faceExpressions = {
            happy: '^__^',
            idle: 'o_o',
            worried: 'O2?',
            danger: '>_<',
            scan: '*-*',
            dance: '♪(^o^)♪'
        };

        this.hoverHeight = 1.35;
        this.hoverOffset = new THREE.Vector3(-1.2, 1.35, -1.0);
        this.currentPos = new THREE.Vector3(0, 1.35, 6);
        this.velocity = new THREE.Vector3();

        this.danceTimer = 0;
        this.scanTimer = 0;
        this.beepTimer = 4.0;

        this.buildMesh();
    }

    buildMesh() {
        this.group = new THREE.Group();

        // 1. Robot Body Sphere
        const bodyGeom = new THREE.SphereGeometry(0.32, 16, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x00f0ff,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x003344
        });
        this.bodyMesh = new THREE.Mesh(bodyGeom, bodyMat);
        this.bodyMesh.castShadow = true;
        this.group.add(this.bodyMesh);

        // 2. LED Matrix Face Screen
        const faceGeom = new THREE.PlaneGeometry(0.36, 0.22);
        this.faceCanvas = document.createElement('canvas');
        this.faceCanvas.width = 128;
        this.faceCanvas.height = 64;
        this.faceCtx = this.faceCanvas.getContext('2d');
        this.drawFace('^__^');

        this.faceTexture = new THREE.CanvasTexture(this.faceCanvas);
        const faceMat = new THREE.MeshBasicMaterial({
            map: this.faceTexture,
            transparent: true
        });

        this.faceScreen = new THREE.Mesh(faceGeom, faceMat);
        this.faceScreen.position.set(0, 0.05, 0.3);
        this.group.add(this.faceScreen);

        // 3. Small Floating Ears / Antennas
        for (let i = 0; i < 2; i++) {
            const earGeom = new THREE.ConeGeometry(0.08, 0.2, 8);
            const earMat = new THREE.MeshStandardMaterial({ color: 0xff0077, roughness: 0.3 });
            const ear = new THREE.Mesh(earGeom, earMat);
            ear.position.set((i * 2 - 1) * 0.28, 0.25, 0);
            ear.rotation.z = (i * 2 - 1) * -Math.PI / 4;
            this.group.add(ear);
        }

        // 4. Thruster Ring
        const ringGeom = new THREE.TorusGeometry(0.2, 0.04, 8, 16);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        this.thrusterRing = new THREE.Mesh(ringGeom, ringMat);
        this.thrusterRing.rotation.x = Math.PI / 2;
        this.thrusterRing.position.y = -0.28;
        this.group.add(this.thrusterRing);

        this.group.position.copy(this.currentPos);
        this.scene.add(this.group);
    }

    drawFace(text) {
        if (!this.faceCtx) return;
        this.faceCtx.fillStyle = '#0a101f';
        this.faceCtx.fillRect(0, 0, 128, 64);

        this.faceCtx.fillStyle = '#00ffcc';
        this.faceCtx.font = 'bold 26px monospace';
        this.faceCtx.textAlign = 'center';
        this.faceCtx.textBaseline = 'middle';
        this.faceCtx.fillText(text, 64, 32);

        if (this.faceTexture) this.faceTexture.needsUpdate = true;
    }

    setMood(mood) {
        if (this.mood === mood) return;
        this.mood = mood;
        const expr = this.faceExpressions[mood] || '^__^';
        this.drawFace(expr);

        if (mood === 'danger' || mood === 'worried') {
            if (window.soundEngine) window.soundEngine.playPixelBeep('danger');
        } else if (mood === 'dance') {
            this.danceTimer = 3.5;
            if (window.soundEngine) window.soundEngine.playPixelBeep('dance');
        } else if (mood === 'scan') {
            this.scanTimer = 2.0;
            if (window.soundEngine) window.soundEngine.playPixelBeep('happy');
        }
    }

    update(delta) {
        if (!this.playerTarget) return;

        // Hover bobbing calculation
        const time = Date.now() * 0.003;
        const bob = Math.sin(time * 3) * 0.12;

        // Desired target position relative to player
        const playerPos = this.playerTarget.position;
        const targetWorldPos = new THREE.Vector3(
            playerPos.x + this.hoverOffset.x,
            playerPos.y + this.hoverHeight + bob,
            playerPos.z + this.hoverOffset.z
        );

        // Smooth follow physics
        this.group.position.lerp(targetWorldPos, delta * 4.5);

        // Rotation & Dance
        if (this.danceTimer > 0) {
            this.danceTimer -= delta;
            this.group.rotation.y += delta * 12.0; // Happy spin
            this.group.position.y += Math.abs(Math.sin(time * 10)) * 0.2;
            if (this.danceTimer <= 0) {
                this.setMood('happy');
            }
        } else {
            // Face the forward direction of player
            this.group.rotation.y = this.playerTarget.rotation.y;
        }

        // Random happy beeps occasionally when calm
        this.beepTimer -= delta;
        if (this.beepTimer <= 0) {
            this.beepTimer = 12 + Math.random() * 15;
            if (this.mood === 'happy' || this.mood === 'idle') {
                if (window.soundEngine) window.soundEngine.playPixelBeep('happy');
            }
        }
    }
}
