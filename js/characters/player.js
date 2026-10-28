/**
 * COLONY KERNEL: MARS - Player Controller
 * Handles 3rd-person movement, sprinting, jumping, collision, wall-bump confusion, and customization.
 */

class PlayerController {
    constructor(scene, cameraController) {
        this.scene = scene;
        this.cameraController = cameraController;

        // Customization profile
        this.customization = {
            suitColor: 0xe2e8f0,
            accentColor: 0x00f0ff,
            visorColor: 0x102a43,
            skinColor: 0xffd1a4,
            backpackColor: 0x334155
        };

        this.rig = new CharacterRig(Object.assign({ isPlayer: true }, this.customization));
        this.mesh = this.rig.group;
        this.mesh.position.set(0, 0, 8); // Start in front of Kernel Tower
        this.scene.add(this.mesh);

        this.velocity = new THREE.Vector3();
        this.isGrounded = true;
        this.moveSpeed = 5.2;
        this.sprintSpeed = 9.0;
        this.jumpForce = 7.5;
        this.gravity = 18.0;

        this.stepTimer = 0;
        this.wallBumpTimer = 0;
        this.isWallStuck = false;

        // Emote / action timers
        this.overrideAnimation = null;
        this.overrideTimer = 0;

        // Rover vehicle mode
        this.isRoverActive = false;
        this.roverWheels = [];
        this.buildRoverChassis();

        // Story objective tracking
        this.hasMoved = false;
        this.hasJumped = false;
    }

    buildRoverChassis() {
        const roverGroup = new THREE.Group();
        roverGroup.name = 'playerRover';

        // Chassis body
        const bodyGeom = new THREE.BoxGeometry(1.6, 0.45, 2.2);
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
        const body = new THREE.Mesh(bodyGeom, bodyMat);
        body.position.y = 0.35;
        roverGroup.add(body);

        // Neon Trim
        const trimGeom = new THREE.BoxGeometry(1.65, 0.08, 2.25);
        const trimMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
        const trim = new THREE.Mesh(trimGeom, trimMat);
        trim.position.y = 0.42;
        roverGroup.add(trim);

        // Headlights
        const lightGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8);
        lightGeom.rotateX(Math.PI / 2);
        const lightMat = new THREE.MeshBasicMaterial({ color: 0xffffaa });
        for (let i = 0; i < 2; i++) {
            const hl = new THREE.Mesh(lightGeom, lightMat);
            hl.position.set((i * 2 - 1) * 0.55, 0.35, 1.12);
            roverGroup.add(hl);
        }

        // 4 Wheels
        this.roverWheels = [];
        const wheelGeom = new THREE.CylinderGeometry(0.32, 0.32, 0.28, 12);
        wheelGeom.rotateZ(Math.PI / 2);
        const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0e17, roughness: 0.8 });

        const wheelOffsets = [
            [-0.9, 0.32, 0.75],
            [0.9, 0.32, 0.75],
            [-0.9, 0.32, -0.75],
            [0.9, 0.32, -0.75]
        ];
        wheelOffsets.forEach(pos => {
            const w = new THREE.Mesh(wheelGeom, wheelMat);
            w.position.set(pos[0], pos[1], pos[2]);
            roverGroup.add(w);
            this.roverWheels.push(w);
        });

        roverGroup.visible = false;
        this.mesh.add(roverGroup);
        this.roverMesh = roverGroup;
    }

    toggleRoverMode() {
        this.isRoverActive = !this.isRoverActive;
        if (this.roverMesh) {
            this.roverMesh.visible = this.isRoverActive;
        }
        if (this.isRoverActive) {
            this.moveSpeed = 12.5;
            this.sprintSpeed = 17.5;
            if (window.soundEngine) window.soundEngine.playDroneThrust();
            if (window.game) window.game.showToast('🚀 ROVER MOBILITY ENGAGED [R] — Max Speed 65 km/h!', 'info');
        } else {
            this.moveSpeed = 5.2;
            this.sprintSpeed = 9.0;
            if (window.soundEngine) window.soundEngine.playClick();
            if (window.game) window.game.showToast('Astronaut Foot Patrol Mode [R]', 'info');
        }
    }

    applyCustomization(newColors) {
        Object.assign(this.customization, newColors);
        this.rig.setColors(
            this.customization.suitColor,
            this.customization.accentColor,
            this.customization.visorColor
        );
    }

    triggerEmote(animName, duration = 3.0) {
        this.overrideAnimation = animName;
        this.overrideTimer = duration;
        this.rig.setAnimation(animName);
    }

    update(delta) {
        const move = window.inputController.getMovementVector();
        const cameraYaw = this.cameraController.yaw;

        // Handle override animation (e.g. emote, celebration, confusion)
        if (this.overrideTimer > 0) {
            this.overrideTimer -= delta;
            this.rig.updateAnimation(delta);
            if (this.overrideTimer <= 0) {
                this.overrideAnimation = null;
            }
            return;
        }

        // Calculate world movement direction based on camera yaw
        let moveX = 0;
        let moveZ = 0;

        if (move.forward !== 0 || move.strafe !== 0) {
            // Forward vector relative to camera yaw
            const forwardX = -Math.sin(cameraYaw);
            const forwardZ = -Math.cos(cameraYaw);

            // Right vector
            const rightX = -Math.sin(cameraYaw + Math.PI / 2);
            const rightZ = -Math.cos(cameraYaw + Math.PI / 2);

            moveX = forwardX * move.forward + rightX * move.strafe;
            moveZ = forwardZ * move.forward + rightZ * move.strafe;

            // Normalize
            const len = Math.sqrt(moveX * moveX + moveZ * moveZ);
            if (len > 0.001) {
                moveX /= len;
                moveZ /= len;
            }
        }

        const currentSpeed = move.sprint ? this.sprintSpeed : this.moveSpeed;
        const isMoving = (move.forward !== 0 || move.strafe !== 0);

        if (isMoving) {
            this.velocity.x = moveX * currentSpeed;
            this.velocity.z = moveZ * currentSpeed;

            // Track movement for Mission 01 objective
            if (!this.hasMoved) {
                this.hasMoved = true;
                if (this.hasJumped && window.game && window.game.missionDirector) {
                    window.game.missionDirector.checkObjective('move');
                }
            }

            // Animate rover wheels if active
            if (this.isRoverActive && this.roverWheels) {
                this.roverWheels.forEach(w => {
                    w.rotation.x += delta * (move.sprint ? 24 : 16);
                });
            }

            // Smoothly rotate character toward movement direction
            const targetRotation = Math.atan2(moveX, moveZ);
            const currentRotation = this.mesh.rotation.y;
            let diff = targetRotation - currentRotation;
            while (diff < -Math.PI) diff += Math.PI * 2;
            while (diff > Math.PI) diff -= Math.PI * 2;
            this.mesh.rotation.y += diff * delta * 12;

            // Footstep audio
            this.stepTimer += delta * (move.sprint ? 1.6 : 1.0);
            if (this.stepTimer > 0.35 && this.isGrounded) {
                this.stepTimer = 0;
                if (window.soundEngine) {
                    if (this.isRoverActive) {
                        window.soundEngine.playDroneThrust();
                    } else {
                        window.soundEngine.playFootstep();
                    }
                }
            }
        } else {
            this.velocity.x *= 0.75;
            this.velocity.z *= 0.75;
        }

        // Jump
        if (move.jump && this.isGrounded) {
            this.velocity.y = this.jumpForce;
            this.isGrounded = false;
            if (window.soundEngine) window.soundEngine.playJump();

            // Track jump for Mission 01 objective
            if (!this.hasJumped) {
                this.hasJumped = true;
                if (this.hasMoved && window.game && window.game.missionDirector) {
                    window.game.missionDirector.checkObjective('move');
                }
            }
        }

        // Gravity
        if (!this.isGrounded) {
            this.velocity.y -= this.gravity * delta;
        }

        // Position Integration
        const prevPos = this.mesh.position.clone();
        this.mesh.position.x += this.velocity.x * delta;
        this.mesh.position.y += this.velocity.y * delta;
        this.mesh.position.z += this.velocity.z * delta;

        // Ground constraint
        if (this.mesh.position.y <= 0) {
            this.mesh.position.y = 0;
            this.velocity.y = 0;
            this.isGrounded = true;
        }

        // World boundary constraint (Radius 75m)
        const distFromCenter = Math.sqrt(this.mesh.position.x * this.mesh.position.x + this.mesh.position.z * this.mesh.position.z);
        if (distFromCenter > 75) {
            const angle = Math.atan2(this.mesh.position.z, this.mesh.position.x);
            this.mesh.position.x = Math.cos(angle) * 75;
            this.mesh.position.z = Math.sin(angle) * 75;

            // Funny wall bump confusion detection
            if (isMoving) {
                this.wallBumpTimer += delta;
                if (this.wallBumpTimer > 1.5) {
                    this.wallBumpTimer = 0;
                    this.triggerEmote('confused', 2.0);
                    if (window.game) window.game.showToast('You ran into the perimeter ridge! (Feeling confused)', 'info');
                }
            }
        } else {
            this.wallBumpTimer = 0;
        }

        // Animation selection
        if (!this.isGrounded) {
            this.rig.setAnimation('jump');
        } else if (isMoving) {
            this.rig.setAnimation(move.sprint ? 'run' : 'walk');
        } else {
            this.rig.setAnimation('idle');
        }

        this.rig.updateAnimation(delta);
    }
}
