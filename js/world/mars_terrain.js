/**
 * COLONY KERNEL: MARS - Mars Terrain & Physical Objects
 * Procedural red martian surface, craters, decorative boulders, and kickable physical rocks.
 */

class MarsTerrain {
    constructor(scene) {
        this.scene = scene;
        this.kickableRocks = [];
        this.buildTerrain();
        this.buildCratersAndMountains();
        this.spawnKickableRocks();
    }

    buildTerrain() {
        // High-poly plane for subtle undulating Martian dunes
        const size = 240;
        const segments = 64;
        const geom = new THREE.PlaneGeometry(size, size, segments, segments);
        geom.rotateX(-Math.PI / 2);

        const pos = geom.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            const z = pos.getZ(i);

            // Keep the central colony base relatively flat within radius 45
            const distFromCenter = Math.sqrt(x * x + z * z);
            if (distFromCenter > 38) {
                const duneElevation = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 3.5 
                                    + Math.sin(x * 0.1 + z * 0.08) * 1.8;
                pos.setY(i, Math.max(0, duneElevation));
            } else {
                pos.setY(i, Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.2);
            }
        }
        geom.computeVertexNormals();

        // Stylized Mars Ground Material
        const mat = new THREE.MeshLambertMaterial({
            color: 0xc4522a,
            emissive: 0x240d05
        });

        this.groundMesh = new THREE.Mesh(geom, mat);
        this.groundMesh.receiveShadow = true;
        this.scene.add(this.groundMesh);

        // Colony Foundation Grid Platform
        const colonyBaseGeom = new THREE.CylinderGeometry(40, 42, 0.4, 48);
        const colonyBaseMat = new THREE.MeshStandardMaterial({
            color: 0x2b3038,
            roughness: 0.8,
            metalness: 0.3
        });
        const colonyBase = new THREE.Mesh(colonyBaseGeom, colonyBaseMat);
        colonyBase.position.y = 0.1;
        colonyBase.receiveShadow = true;
        this.scene.add(colonyBase);

        // Landing Pad
        const padGeom = new THREE.CylinderGeometry(10, 10.5, 0.5, 32);
        const padMat = new THREE.MeshStandardMaterial({
            color: 0x1f2329,
            roughness: 0.6,
            metalness: 0.4
        });
        const pad = new THREE.Mesh(padGeom, padMat);
        pad.position.set(-28, 0.25, -28);
        this.scene.add(pad);

        // Landing Pad Glowing Ring & 'H' Mark
        const ringGeom = new THREE.RingGeometry(7.5, 8.2, 32);
        ringGeom.rotateX(-Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.position.set(-28, 0.52, -28);
        this.scene.add(ring);
    }

    buildCratersAndMountains() {
        // Decorative perimeter Martian rock pillars & crater rims
        const rockGeom = new THREE.DodecahedronGeometry(1, 1);
        const rockMat = new THREE.MeshLambertMaterial({ color: 0x93381a });

        for (let i = 0; i < 60; i++) {
            const angle = (i / 60) * Math.PI * 2 + Math.random() * 0.1;
            const dist = 55 + Math.random() * 45;
            const scaleY = 3 + Math.random() * 12;
            const scaleXZ = 4 + Math.random() * 8;

            const rock = new THREE.Mesh(rockGeom, rockMat);
            rock.position.set(Math.cos(angle) * dist, scaleY * 0.5, Math.sin(angle) * dist);
            rock.scale.set(scaleXZ, scaleY, scaleXZ);
            rock.rotation.set(Math.random(), Math.random(), Math.random());
            this.scene.add(rock);
        }
    }

    spawnKickableRocks() {
        // Fun interactive rocks scattered around the colony that react when bumped
        const rockGeom = new THREE.DodecahedronGeometry(0.35, 0);
        const rockMat = new THREE.MeshStandardMaterial({
            color: 0xd9754f,
            roughness: 0.9
        });

        const rockPositions = [
            [-8, 0.35, 12], [-14, 0.35, 6], [18, 0.35, -12], [22, 0.35, 8],
            [-5, 0.35, -20], [12, 0.35, 24], [-25, 0.35, 15], [30, 0.35, -5]
        ];

        rockPositions.forEach(pos => {
            const rock = new THREE.Mesh(rockGeom, rockMat);
            rock.position.set(pos[0], pos[1], pos[2]);
            rock.castShadow = true;
            this.scene.add(rock);

            this.kickableRocks.push({
                mesh: rock,
                velocity: new THREE.Vector3(),
                rotSpeed: new THREE.Vector3()
            });
        });
    }

    update(delta, playerPos) {
        // Update physics for kickable rocks
        this.kickableRocks.forEach(item => {
            const rock = item.mesh;

            // Check collision with player
            if (playerPos) {
                const dist = rock.position.distanceTo(playerPos);
                if (dist < 1.2) {
                    const kickDir = rock.position.clone().sub(playerPos).normalize();
                    kickDir.y = 0.4;
                    item.velocity.add(kickDir.multiplyScalar(6.0));
                    item.rotSpeed.set(Math.random() * 8, Math.random() * 8, Math.random() * 8);
                    if (window.soundEngine) window.soundEngine.playFootstep();
                }
            }

            // Apply velocity, gravity, friction
            if (item.velocity.lengthSq() > 0.001) {
                rock.position.addScaledVector(item.velocity, delta);
                rock.rotation.x += item.rotSpeed.x * delta;
                rock.rotation.y += item.rotSpeed.y * delta;
                rock.rotation.z += item.rotSpeed.z * delta;

                item.velocity.y -= 9.8 * delta; // gravity
                if (rock.position.y <= 0.35) {
                    rock.position.y = 0.35;
                    item.velocity.y = -item.velocity.y * 0.4; // bounce
                    item.velocity.x *= 0.85; // friction
                    item.velocity.z *= 0.85;
                }
            }
        });
    }
}
