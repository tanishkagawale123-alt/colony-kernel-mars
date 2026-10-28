/**
 * COLONY KERNEL: MARS - Particle Systems
 * Procedural dust storms, welding sparks, steam leaks, confetti celebrations, and hologram data streams.
 */

class ParticleManager {
    constructor(scene) {
        this.scene = scene;
        this.emitters = [];

        this.initDustStorm();
        this.initSparksEmitter();
        this.initSteamEmitter();
        this.initConfettiEmitter();
        this.initHoloDataEmitter();
    }

    initDustStorm() {
        const count = 1200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const velocities = [];

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 160;
            positions[i * 3 + 1] = Math.random() * 25;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 160;

            velocities.push({
                x: 3 + Math.random() * 6,
                y: (Math.random() - 0.5) * 0.5,
                z: (Math.random() - 0.5) * 2
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color: 0xd96b43,
            size: 0.25,
            transparent: true,
            opacity: 0.45,
            blending: THREE.NormalBlending
        });

        this.dustPoints = new THREE.Points(geometry, material);
        this.dustVelocities = velocities;
        this.dustCount = count;
        this.scene.add(this.dustPoints);
    }

    setDustStormIntensity(isStorm) {
        if (this.dustPoints) {
            this.dustPoints.material.opacity = isStorm ? 0.85 : 0.4;
            this.dustPoints.material.size = isStorm ? 0.45 : 0.25;
        }
    }

    initSparksEmitter() {
        this.sparkPool = [];
        this.activeSparks = [];
        const geom = new THREE.BufferGeometry();
        const maxSparks = 200;
        const positions = new Float32Array(maxSparks * 3);
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xffdd44,
            size: 0.35,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending
        });

        this.sparksMesh = new THREE.Points(geom, mat);
        this.scene.add(this.sparksMesh);
    }

    emitSparks(pos, count = 10) {
        for (let i = 0; i < count; i++) {
            this.activeSparks.push({
                x: pos.x + (Math.random() - 0.5) * 0.2,
                y: pos.y + (Math.random() - 0.5) * 0.2,
                z: pos.z + (Math.random() - 0.5) * 0.2,
                vx: (Math.random() - 0.5) * 3,
                vy: Math.random() * 4 + 1,
                vz: (Math.random() - 0.5) * 3,
                life: 1.0
            });
        }
    }

    initSteamEmitter() {
        this.activeSteam = [];
        const count = 100;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x88ccff,
            size: 0.6,
            transparent: true,
            opacity: 0.5,
            blending: THREE.NormalBlending
        });

        this.steamMesh = new THREE.Points(geom, mat);
        this.scene.add(this.steamMesh);
    }

    emitSteam(pos, count = 5) {
        for (let i = 0; i < count; i++) {
            this.activeSteam.push({
                x: pos.x + (Math.random() - 0.5) * 0.3,
                y: pos.y,
                z: pos.z + (Math.random() - 0.5) * 0.3,
                vx: (Math.random() - 0.5) * 0.8,
                vy: Math.random() * 2 + 1.2,
                vz: (Math.random() - 0.5) * 0.8,
                life: 1.0
            });
        }
    }

    initConfettiEmitter() {
        this.activeConfetti = [];
        const count = 300;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);

        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.5,
            vertexColors: true,
            transparent: true,
            opacity: 0.95
        });

        this.confettiMesh = new THREE.Points(geom, mat);
        this.scene.add(this.confettiMesh);
    }

    burstConfetti(centerPos, count = 100) {
        const palette = [
            new THREE.Color(0x00f0ff),
            new THREE.Color(0xff0077),
            new THREE.Color(0x00ff88),
            new THREE.Color(0xffd700),
            new THREE.Color(0xaa00ff)
        ];

        for (let i = 0; i < count; i++) {
            const col = palette[Math.floor(Math.random() * palette.length)];
            this.activeConfetti.push({
                x: centerPos.x,
                y: centerPos.y + 2,
                z: centerPos.z,
                vx: (Math.random() - 0.5) * 12,
                vy: Math.random() * 10 + 4,
                vz: (Math.random() - 0.5) * 12,
                r: col.r,
                g: col.g,
                b: col.b,
                life: 1.0
            });
        }
    }

    initHoloDataEmitter() {
        this.holoData = [];
        const count = 80;
        const geom = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const mat = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.35,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.holoMesh = new THREE.Points(geom, mat);
        this.scene.add(this.holoMesh);

        for (let i = 0; i < count; i++) {
            this.holoData.push({
                x: (Math.random() - 0.5) * 12,
                y: Math.random() * 15,
                z: (Math.random() - 0.5) * 12,
                angle: Math.random() * Math.PI * 2,
                speed: 0.5 + Math.random() * 0.8,
                radius: 3 + Math.random() * 4
            });
        }
    }

    update(delta) {
        // 1. Dust storm update
        if (this.dustPoints) {
            const pos = this.dustPoints.geometry.attributes.position.array;
            for (let i = 0; i < this.dustCount; i++) {
                pos[i * 3] += this.dustVelocities[i].x * delta;
                pos[i * 3 + 1] += this.dustVelocities[i].y * delta;
                pos[i * 3 + 2] += this.dustVelocities[i].z * delta;

                // Wrap around world boundary
                if (pos[i * 3] > 80) pos[i * 3] = -80;
                if (pos[i * 3 + 1] < 0.1) pos[i * 3 + 1] = 25;
                if (pos[i * 3 + 1] > 25) pos[i * 3 + 1] = 0.1;
                if (pos[i * 3 + 2] > 80) pos[i * 3 + 2] = -80;
                if (pos[i * 3 + 2] < -80) pos[i * 3 + 2] = 80;
            }
            this.dustPoints.geometry.attributes.position.needsUpdate = true;
        }

        // 2. Sparks update
        if (this.activeSparks.length > 0) {
            const pos = this.sparksMesh.geometry.attributes.position.array;
            for (let i = this.activeSparks.length - 1; i >= 0; i--) {
                const s = this.activeSparks[i];
                s.x += s.vx * delta;
                s.y += s.vy * delta;
                s.z += s.vz * delta;
                s.vy -= 9.8 * delta; // gravity
                s.life -= delta * 2.0;

                if (s.life <= 0 || s.y < 0.1) {
                    this.activeSparks.splice(i, 1);
                }
            }

            for (let i = 0; i < 200; i++) {
                if (i < this.activeSparks.length) {
                    pos[i * 3] = this.activeSparks[i].x;
                    pos[i * 3 + 1] = this.activeSparks[i].y;
                    pos[i * 3 + 2] = this.activeSparks[i].z;
                } else {
                    pos[i * 3] = 0; pos[i * 3 + 1] = -999; pos[i * 3 + 2] = 0;
                }
            }
            this.sparksMesh.geometry.attributes.position.needsUpdate = true;
        }

        // 3. Steam update
        if (this.activeSteam.length > 0) {
            const pos = this.steamMesh.geometry.attributes.position.array;
            for (let i = this.activeSteam.length - 1; i >= 0; i--) {
                const st = this.activeSteam[i];
                st.x += st.vx * delta;
                st.y += st.vy * delta;
                st.z += st.vz * delta;
                st.life -= delta * 1.2;

                if (st.life <= 0) {
                    this.activeSteam.splice(i, 1);
                }
            }

            for (let i = 0; i < 100; i++) {
                if (i < this.activeSteam.length) {
                    pos[i * 3] = this.activeSteam[i].x;
                    pos[i * 3 + 1] = this.activeSteam[i].y;
                    pos[i * 3 + 2] = this.activeSteam[i].z;
                } else {
                    pos[i * 3] = 0; pos[i * 3 + 1] = -999; pos[i * 3 + 2] = 0;
                }
            }
            this.steamMesh.geometry.attributes.position.needsUpdate = true;
        }

        // 4. Confetti update
        if (this.activeConfetti.length > 0) {
            const pos = this.confettiMesh.geometry.attributes.position.array;
            const col = this.confettiMesh.geometry.attributes.color.array;
            for (let i = this.activeConfetti.length - 1; i >= 0; i--) {
                const c = this.activeConfetti[i];
                c.x += c.vx * delta;
                c.y += c.vy * delta;
                c.z += c.vz * delta;
                c.vy -= 4.0 * delta; // slow fall
                c.life -= delta * 0.4;

                if (c.life <= 0 || c.y < 0.1) {
                    this.activeConfetti.splice(i, 1);
                }
            }

            for (let i = 0; i < 300; i++) {
                if (i < this.activeConfetti.length) {
                    pos[i * 3] = this.activeConfetti[i].x;
                    pos[i * 3 + 1] = this.activeConfetti[i].y;
                    pos[i * 3 + 2] = this.activeConfetti[i].z;

                    col[i * 3] = this.activeConfetti[i].r;
                    col[i * 3 + 1] = this.activeConfetti[i].g;
                    col[i * 3 + 2] = this.activeConfetti[i].b;
                } else {
                    pos[i * 3] = 0; pos[i * 3 + 1] = -999; pos[i * 3 + 2] = 0;
                }
            }
            this.confettiMesh.geometry.attributes.position.needsUpdate = true;
            this.confettiMesh.geometry.attributes.color.needsUpdate = true;
        }

        // 5. Hologram Data stream update (around Kernel Tower at 0, 0, 0)
        if (this.holoData.length > 0) {
            const pos = this.holoMesh.geometry.attributes.position.array;
            for (let i = 0; i < this.holoData.length; i++) {
                const h = this.holoData[i];
                h.angle += h.speed * delta;
                h.y += delta * 0.8;
                if (h.y > 18) h.y = 1;

                pos[i * 3] = Math.cos(h.angle) * h.radius;
                pos[i * 3 + 1] = h.y;
                pos[i * 3 + 2] = Math.sin(h.angle) * h.radius;
            }
            this.holoMesh.geometry.attributes.position.needsUpdate = true;
        }
    }
}
