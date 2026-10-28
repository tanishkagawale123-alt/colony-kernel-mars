/**
 * COLONY KERNEL: MARS - Orbital 3rd-Person Follow Camera
 * Features smooth interpolation, mouse pitch/yaw control, collision avoidance, and cinematic modes.
 */

class GameCamera {
    constructor(camera, target) {
        this.camera = camera;
        this.target = target; // player mesh or group

        this.distance = 6.0;
        this.targetDistance = 6.0;
        this.minDistance = 2.5;
        this.maxDistance = 14.0;

        this.yaw = 0.0;
        this.pitch = 0.35; // slightly above shoulder
        this.minPitch = -0.3;
        this.maxPitch = 1.3;

        this.smoothPosition = new THREE.Vector3();
        this.smoothTarget = new THREE.Vector3();
        this.sensitivity = 0.003;

        // Cinematic mode variables
        this.isCinematic = false;
        this.cinematicTargetPos = new THREE.Vector3();
        this.cinematicLookAt = new THREE.Vector3();
        this.cinematicTimer = 0;
    }

    setTarget(target) {
        this.target = target;
    }

    startCinematic(cameraPos, lookAtPos, duration = 3.0) {
        this.isCinematic = true;
        this.cinematicTargetPos.copy(cameraPos);
        this.cinematicLookAt.copy(lookAtPos);
        this.cinematicTimer = duration;
    }

    stopCinematic() {
        this.isCinematic = false;
    }

    update(delta) {
        if (!this.camera) return;

        // Handle Mouse Delta rotation
        if (!window.inputController.isUIActive && (window.inputController.mouse.isDown || window.inputController.isPointerLocked)) {
            this.yaw -= window.inputController.mouse.deltaX * this.sensitivity;
            this.pitch += window.inputController.mouse.deltaY * this.sensitivity;
            this.pitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.pitch));
        }

        if (this.isCinematic) {
            this.camera.position.lerp(this.cinematicTargetPos, delta * 2.5);
            this.smoothTarget.lerp(this.cinematicLookAt, delta * 3.5);
            this.camera.lookAt(this.smoothTarget);
            return;
        }

        if (!this.target) return;

        // Calculate target point (slightly above player origin)
        const targetPos = this.target.position.clone().add(new THREE.Vector3(0, 1.4, 0));
        this.smoothTarget.lerp(targetPos, delta * 10);

        // Compute desired camera position in spherical coordinates around target
        const horizontalDist = this.distance * Math.cos(this.pitch);
        const verticalDist = this.distance * Math.sin(this.pitch);

        const offsetX = horizontalDist * Math.sin(this.yaw);
        const offsetZ = horizontalDist * Math.cos(this.yaw);
        const offsetY = verticalDist;

        const desiredPos = new THREE.Vector3(
            this.smoothTarget.x + offsetX,
            this.smoothTarget.y + offsetY,
            this.smoothTarget.z + offsetZ
        );

        // Prevent camera dipping below Martian ground level
        if (desiredPos.y < 0.6) desiredPos.y = 0.6;

        this.camera.position.lerp(desiredPos, delta * 9);
        this.camera.lookAt(this.smoothTarget);
    }
}
