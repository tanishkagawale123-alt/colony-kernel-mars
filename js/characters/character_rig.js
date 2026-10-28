/**
 * COLONY KERNEL: MARS - Stylized Blocky Humanoid Character Rig
 * Original sci-fi astronaut rig with expressive visor, articulated limbs,
 * oxygen backpack, and procedural animations (idle, walk, run, jump, wave, repair, celebrate, panic, dance, confusion).
 */

class CharacterRig {
    constructor(options = {}) {
        this.options = Object.assign({
            suitColor: 0xe2e8f0,
            accentColor: 0x00f0ff,
            visorColor: 0x112233,
            skinColor: 0xffd1a4,
            backpackColor: 0x334155,
            scale: 1.0,
            isPlayer: false
        }, options);

        this.group = new THREE.Group();
        this.group.scale.set(this.options.scale, this.options.scale, this.options.scale);

        this.currentAnimation = 'idle';
        this.animTimer = Math.random() * 10;
        this.animBlend = 1.0;

        this.buildMesh();
    }

    buildMesh() {
        const matSuit = new THREE.MeshStandardMaterial({
            color: this.options.suitColor,
            roughness: 0.5,
            metalness: 0.2
        });
        const matAccent = new THREE.MeshStandardMaterial({
            color: this.options.accentColor,
            roughness: 0.3,
            metalness: 0.7,
            emissive: this.options.accentColor,
            emissiveIntensity: 0.3
        });
        const matVisor = new THREE.MeshPhysicalMaterial({
            color: this.options.visorColor,
            roughness: 0.1,
            metalness: 0.9,
            reflectivity: 0.9
        });
        const matSkin = new THREE.MeshLambertMaterial({ color: this.options.skinColor });
        const matBackpack = new THREE.MeshStandardMaterial({ color: this.options.backpackColor, roughness: 0.6 });

        this.materials = { suit: matSuit, accent: matAccent, visor: matVisor, skin: matSkin, backpack: matBackpack };

        // 1. Root Pelvis
        this.pelvis = new THREE.Group();
        this.pelvis.position.y = 0.85;
        this.group.add(this.pelvis);

        // 2. Torso
        this.torsoGroup = new THREE.Group();
        this.pelvis.add(this.torsoGroup);

        const torsoGeom = new THREE.BoxGeometry(0.7, 0.75, 0.45);
        this.torsoMesh = new THREE.Mesh(torsoGeom, matSuit);
        this.torsoMesh.position.y = 0.38;
        this.torsoMesh.castShadow = true;
        this.torsoGroup.add(this.torsoMesh);

        // Torso Chest Accent Strip
        const chestStripe = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.05), matAccent);
        chestStripe.position.set(0, 0.45, 0.24);
        this.torsoGroup.add(chestStripe);

        // 3. Oxygen Backpack
        const packGeom = new THREE.BoxGeometry(0.55, 0.65, 0.3);
        this.backpackMesh = new THREE.Mesh(packGeom, matBackpack);
        this.backpackMesh.position.set(0, 0.38, -0.32);
        this.backpackMesh.castShadow = true;
        this.torsoGroup.add(this.backpackMesh);

        // Oxygen Cylinders on backpack
        for (let i = 0; i < 2; i++) {
            const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.55, 8), matAccent);
            tank.position.set((i * 2 - 1) * 0.18, 0.38, -0.42);
            this.torsoGroup.add(tank);
        }

        // 4. Head & Helmet
        this.headGroup = new THREE.Group();
        this.headGroup.position.y = 0.75;
        this.torsoGroup.add(this.headGroup);

        // Blocky Stylized Helmet
        const headGeom = new THREE.BoxGeometry(0.65, 0.65, 0.65);
        this.headMesh = new THREE.Mesh(headGeom, matSuit);
        this.headMesh.position.y = 0.32;
        this.headMesh.castShadow = true;
        this.headGroup.add(this.headMesh);

        // Visor Screen
        const visorGeom = new THREE.BoxGeometry(0.52, 0.32, 0.12);
        this.visorMesh = new THREE.Mesh(visorGeom, matVisor);
        this.visorMesh.position.set(0, 0.32, 0.3);
        this.headGroup.add(this.visorMesh);

        // Helmet Antenna
        const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.4, 6), matAccent);
        antenna.position.set(0.3, 0.7, 0);
        this.headGroup.add(antenna);

        const antennaTip = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 6), matAccent);
        antennaTip.position.set(0.3, 0.9, 0);
        this.headGroup.add(antennaTip);

        // 5. Left & Right Shoulders / Arms
        this.leftArmGroup = new THREE.Group();
        this.leftArmGroup.position.set(-0.45, 0.65, 0);
        this.torsoGroup.add(this.leftArmGroup);

        this.leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.24), matSuit);
        this.leftArmMesh.position.y = -0.3;
        this.leftArmMesh.castShadow = true;
        this.leftArmGroup.add(this.leftArmMesh);

        // Left Hand
        const leftHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), matAccent);
        leftHand.position.y = -0.65;
        this.leftArmGroup.add(leftHand);

        this.rightArmGroup = new THREE.Group();
        this.rightArmGroup.position.set(0.45, 0.65, 0);
        this.torsoGroup.add(this.rightArmGroup);

        this.rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.6, 0.24), matSuit);
        this.rightArmMesh.position.y = -0.3;
        this.rightArmMesh.castShadow = true;
        this.rightArmGroup.add(this.rightArmMesh);

        // Right Hand
        const rightHand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), matAccent);
        rightHand.position.y = -0.65;
        this.rightArmGroup.add(rightHand);

        // 6. Left & Right Legs
        this.leftLegGroup = new THREE.Group();
        this.leftLegGroup.position.set(-0.2, 0, 0);
        this.pelvis.add(this.leftLegGroup);

        this.leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.75, 0.26), matSuit);
        this.leftLegMesh.position.y = -0.38;
        this.leftLegMesh.castShadow = true;
        this.leftLegGroup.add(this.leftLegMesh);

        // Left Boot
        const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.36), matAccent);
        leftBoot.position.set(0, -0.75, 0.05);
        this.leftLegGroup.add(leftBoot);

        this.rightLegGroup = new THREE.Group();
        this.rightLegGroup.position.set(0.2, 0, 0);
        this.pelvis.add(this.rightLegGroup);

        this.rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.75, 0.26), matSuit);
        this.rightLegMesh.position.y = -0.38;
        this.rightLegMesh.castShadow = true;
        this.rightLegGroup.add(this.rightLegMesh);

        // Right Boot
        const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.2, 0.36), matAccent);
        rightBoot.position.set(0, -0.75, 0.05);
        this.rightLegGroup.add(rightBoot);
    }

    setColors(suit, accent, visor) {
        if (suit !== undefined) this.materials.suit.color.setHex(suit);
        if (accent !== undefined) {
            this.materials.accent.color.setHex(accent);
            this.materials.accent.emissive.setHex(accent);
        }
        if (visor !== undefined) this.materials.visor.color.setHex(visor);
    }

    setAnimation(animName) {
        if (this.currentAnimation === animName) return;
        this.currentAnimation = animName;
    }

    updateAnimation(delta) {
        this.animTimer += delta;
        const t = this.animTimer;

        // Reset default positions
        this.pelvis.position.y = 0.85;
        this.torsoGroup.rotation.set(0, 0, 0);
        this.headGroup.rotation.set(0, 0, 0);
        this.leftArmGroup.rotation.set(0, 0, 0);
        this.rightArmGroup.rotation.set(0, 0, 0);
        this.leftLegGroup.rotation.set(0, 0, 0);
        this.rightLegGroup.rotation.set(0, 0, 0);

        switch (this.currentAnimation) {
            case 'idle':
                // Gentle breathing and subtle weight shift
                this.torsoGroup.position.y = Math.sin(t * 2.5) * 0.02;
                this.headGroup.rotation.y = Math.sin(t * 1.0) * 0.1;
                this.leftArmGroup.rotation.x = Math.sin(t * 2.5) * 0.05;
                this.rightArmGroup.rotation.x = -Math.sin(t * 2.5) * 0.05;
                break;

            case 'walk':
                {
                    const speed = 7.0;
                    this.pelvis.position.y = 0.85 + Math.abs(Math.sin(t * speed)) * 0.08;
                    this.torsoGroup.rotation.y = Math.sin(t * speed) * 0.1;

                    // Leg swings
                    this.leftLegGroup.rotation.x = Math.sin(t * speed) * 0.6;
                    this.rightLegGroup.rotation.x = -Math.sin(t * speed) * 0.6;

                    // Arm counter-swings
                    this.leftArmGroup.rotation.x = -Math.sin(t * speed) * 0.6;
                    this.rightArmGroup.rotation.x = Math.sin(t * speed) * 0.6;
                }
                break;

            case 'run':
                {
                    const speed = 11.0;
                    this.pelvis.position.y = 0.85 + Math.abs(Math.sin(t * speed)) * 0.14;
                    this.torsoGroup.rotation.x = 0.25; // forward lean
                    this.torsoGroup.rotation.y = Math.sin(t * speed) * 0.15;

                    this.leftLegGroup.rotation.x = Math.sin(t * speed) * 0.9;
                    this.rightLegGroup.rotation.x = -Math.sin(t * speed) * 0.9;

                    this.leftArmGroup.rotation.x = -Math.sin(t * speed) * 0.9;
                    this.rightArmGroup.rotation.x = Math.sin(t * speed) * 0.9;
                }
                break;

            case 'jump':
                this.pelvis.position.y = 1.0;
                this.leftLegGroup.rotation.x = -0.4;
                this.rightLegGroup.rotation.x = -0.4;
                this.leftArmGroup.rotation.x = -2.2;
                this.rightArmGroup.rotation.x = -2.2;
                break;

            case 'wave':
                this.rightArmGroup.rotation.x = -2.6;
                this.rightArmGroup.rotation.z = Math.sin(t * 8.0) * 0.4 - 0.2;
                this.headGroup.rotation.y = -0.2;
                break;

            case 'repair':
                this.pelvis.position.y = 0.65; // crouch
                this.torsoGroup.rotation.x = 0.4;
                this.leftLegGroup.rotation.x = -0.5;
                this.rightLegGroup.rotation.x = 0.3;
                this.leftArmGroup.rotation.x = -1.2 + Math.sin(t * 10) * 0.15;
                this.rightArmGroup.rotation.x = -1.2 - Math.sin(t * 10) * 0.15;
                break;

            case 'celebrate':
                this.pelvis.position.y = 0.85 + Math.abs(Math.sin(t * 8)) * 0.3;
                this.leftArmGroup.rotation.x = -2.8 + Math.sin(t * 6) * 0.3;
                this.rightArmGroup.rotation.x = -2.8 - Math.sin(t * 6) * 0.3;
                this.torsoGroup.rotation.y = Math.sin(t * 6) * 0.4;
                break;

            case 'panic':
                this.pelvis.position.y = 0.85 + Math.abs(Math.sin(t * 12)) * 0.1;
                this.leftArmGroup.rotation.x = -2.4;
                this.leftArmGroup.rotation.z = 0.6;
                this.rightArmGroup.rotation.x = -2.4;
                this.rightArmGroup.rotation.z = -0.6;
                this.headGroup.rotation.y = Math.sin(t * 14) * 0.35;
                break;

            case 'dance':
                this.pelvis.position.y = 0.85 + Math.abs(Math.sin(t * 6)) * 0.15;
                this.torsoGroup.rotation.z = Math.sin(t * 4) * 0.25;
                this.leftArmGroup.rotation.x = Math.sin(t * 5) * 1.5;
                this.rightArmGroup.rotation.x = -Math.sin(t * 5) * 1.5;
                this.leftLegGroup.rotation.z = Math.sin(t * 4) * 0.3;
                this.rightLegGroup.rotation.z = -Math.sin(t * 4) * 0.3;
                break;

            case 'confused':
                this.headGroup.rotation.z = 0.35;
                this.rightArmGroup.rotation.x = -2.0;
                this.rightArmGroup.rotation.y = 0.4;
                break;
        }
    }
}
