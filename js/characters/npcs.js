/**
 * COLONY KERNEL: MARS - 10 Unique NPC Characters & AI Routines
 * Implements Maya, Arjun, Lena, Noah, Kai, Dr. Elias, Nova, Zara, Finn, and Max
 * with autonomous behaviors, waypoints, emotional reactions, and friendship tracking.
 */

class NPCManager {
    constructor(scene) {
        this.scene = scene;
        this.npcs = [];

        this.initNPCData();
        this.spawnNPCs();
    }

    initNPCData() {
        this.npcProfiles = [
            {
                id: 'maya',
                name: 'Maya',
                profession: 'Lead Systems Engineer',
                personality: 'Smart, calm and sarcastic.',
                suitColor: 0x1e293b,
                accentColor: 0x00f0ff,
                visorColor: 0x00ffff,
                homeSector: 'Kernel Spire',
                waypoints: [[0, 6], [2, 8], [-2, 7], [0, 4]],
                friendship: 0 // 0-100
            },
            {
                id: 'arjun',
                name: 'Arjun',
                profession: 'Power Grid Specialist',
                personality: 'Energetic and hopelessly optimistic.',
                suitColor: 0x7c2d12,
                accentColor: 0xf59e0b,
                visorColor: 0xffaa00,
                homeSector: 'Solar Field',
                waypoints: [[20, -16], [24, -14], [22, -20], [18, -12]],
                friendship: 0
            },
            {
                id: 'lena',
                name: 'Lena',
                profession: 'Life Support & Medical Officer',
                personality: 'Caring, hyper-responsible, checks oxygen twice.',
                suitColor: 0x064e3b,
                accentColor: 0x10b981,
                visorColor: 0x34d399,
                homeSector: 'Oxygen Plant',
                waypoints: [[-20, 14], [-24, 16], [-22, 18], [-18, 12]],
                friendship: 0
            },
            {
                id: 'noah',
                name: 'Noah',
                profession: 'Communication Specialist',
                personality: 'Curious chatterbox, accidentally dials Earth.',
                suitColor: 0x4c1d95,
                accentColor: 0xa855f7,
                visorColor: 0xc084fc,
                homeSector: 'Comms Array',
                waypoints: [[0, -26], [2, -24], [-2, -25], [0, -22]],
                friendship: 0
            },
            {
                id: 'kai',
                name: 'Kai',
                profession: 'Maintenance Specialist',
                personality: 'Always fixing something. Deadpan humor.',
                suitColor: 0x374151,
                accentColor: 0xef4444,
                visorColor: 0xf87171,
                homeSector: 'Robotics Garage',
                waypoints: [[-26, 2], [-28, -2], [-24, 0], [-27, 4]],
                friendship: 0
            },
            {
                id: 'dr_elias',
                name: 'Dr. Elias',
                profession: 'Chief Medical Doctor',
                personality: 'Stern in emergencies, but loves terrible dad jokes.',
                suitColor: 0xf1f5f9,
                accentColor: 0x3b82f6,
                visorColor: 0x60a5fa,
                homeSector: 'Medical Bio-Bay',
                waypoints: [[-16, -16], [-18, -18], [-14, -15], [-17, -20]],
                friendship: 0
            },
            {
                id: 'nova',
                name: 'Nova',
                profession: 'Robotics Engineer',
                personality: 'Obsessed with bots; talks to rovers like puppies.',
                suitColor: 0x18181b,
                accentColor: 0xec4899,
                visorColor: 0xf472b6,
                homeSector: 'Robotics Center',
                waypoints: [[-28, 6], [-26, 8], [-30, 4], [-28, 2]],
                friendship: 0
            },
            {
                id: 'zara',
                name: 'Zara',
                profession: 'Astrobiologist & Explorer',
                personality: 'Fascinated by Martian rocks and anomalies.',
                suitColor: 0x3f3f46,
                accentColor: 0x84cc16,
                visorColor: 0xa3e635,
                homeSector: 'Hydroponics Lab',
                waypoints: [[20, 16], [24, 18], [22, 20], [18, 14]],
                friendship: 0
            },
            {
                id: 'finn',
                name: 'Finn',
                profession: 'Colony Hydro-Chef',
                personality: 'Determined to make Martian algae taste like pizza.',
                suitColor: 0x14532d,
                accentColor: 0xeab308,
                visorColor: 0xfacc15,
                homeSector: 'Recreation Dome',
                waypoints: [[0, 22], [2, 24], [-2, 23], [1, 26]],
                friendship: 0
            },
            {
                id: 'max',
                name: 'Max',
                profession: 'Junior Tech Apprentice',
                personality: 'Makes hilarious rookie mistakes, eager to impress.',
                suitColor: 0x1e3a8a,
                accentColor: 0x38bdf8,
                visorColor: 0x7dd3fc,
                homeSector: 'Recreation Dome',
                waypoints: [[-3, 22], [3, 24], [-1, 25], [2, 21]],
                friendship: 0
            }
        ];
    }

    spawnNPCs() {
        this.npcProfiles.forEach((prof) => {
            const rig = new CharacterRig({
                suitColor: prof.suitColor,
                accentColor: prof.accentColor,
                visorColor: prof.visorColor
            });

            const initialPos = prof.waypoints[0];
            rig.group.position.set(initialPos[0], 0, initialPos[1]);

            // Overhead 3D Nametag Sprite
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'rgba(10, 16, 28, 0.85)';
            ctx.fillRect(8, 8, 240, 48);
            ctx.strokeStyle = '#00f0ff';
            ctx.lineWidth = 3;
            ctx.strokeRect(8, 8, 240, 48);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(prof.name.toUpperCase(), 128, 32);

            const texture = new THREE.CanvasTexture(canvas);
            const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const sprite = new THREE.Sprite(spriteMat);
            sprite.position.y = 2.35;
            sprite.scale.set(1.8, 0.45, 1.0);
            rig.group.add(sprite);

            this.scene.add(rig.group);

            const npc = {
                profile: prof,
                rig: rig,
                mesh: rig.group,
                currentWaypointIndex: 0,
                state: 'patrol', // 'patrol', 'working', 'idle', 'panic', 'celebrate'
                stateTimer: 2 + Math.random() * 4,
                moveSpeed: 2.2 + Math.random() * 0.8
            };

            this.npcs.push(npc);
        });
    }

    getFriendshipTier(points) {
        if (points >= 80) return 'Trusted Colony Member';
        if (points >= 50) return 'Friend';
        if (points >= 20) return 'Friendly';
        return 'Stranger';
    }

    increaseFriendship(npcId, points = 10) {
        const npc = this.npcs.find(n => n.profile.id === npcId);
        if (npc) {
            npc.profile.friendship = Math.min(100, npc.profile.friendship + points);
            if (window.soundEngine) window.soundEngine.playSuccess();
            return {
                name: npc.profile.name,
                points: npc.profile.friendship,
                tier: this.getFriendshipTier(npc.profile.friendship)
            };
        }
        return null;
    }

    setColonyState(state) {
        // state = 'emergency', 'panic', 'celebrate', 'normal'
        this.npcs.forEach(npc => {
            if (state === 'emergency' || state === 'panic') {
                npc.state = 'panic';
                npc.rig.setAnimation('panic');
            } else if (state === 'celebrate') {
                npc.state = 'celebrate';
                npc.rig.setAnimation(Math.random() > 0.5 ? 'celebrate' : 'dance');
            } else {
                npc.state = 'patrol';
            }
        });
    }

    update(delta) {
        this.npcs.forEach(npc => {
            npc.stateTimer -= delta;

            if (npc.state === 'panic' || npc.state === 'celebrate') {
                npc.rig.updateAnimation(delta);
                return;
            }

            if (npc.stateTimer <= 0) {
                // Switch between patrol and working/idle
                if (npc.state === 'patrol') {
                    npc.state = Math.random() > 0.4 ? 'working' : 'idle';
                    npc.rig.setAnimation(npc.state === 'working' ? 'repair' : 'idle');
                    npc.stateTimer = 4 + Math.random() * 6;
                } else {
                    npc.state = 'patrol';
                    npc.currentWaypointIndex = (npc.currentWaypointIndex + 1) % npc.profile.waypoints.length;
                    npc.rig.setAnimation('walk');
                    npc.stateTimer = 6 + Math.random() * 4;
                }
            }

            if (npc.state === 'patrol') {
                const targetCoord = npc.profile.waypoints[npc.currentWaypointIndex];
                const targetPos = new THREE.Vector3(targetCoord[0], 0, targetCoord[1]);
                const dir = targetPos.clone().sub(npc.mesh.position);
                const dist = dir.length();

                if (dist > 0.4) {
                    dir.normalize();
                    npc.mesh.position.addScaledVector(dir, npc.moveSpeed * delta);
                    npc.mesh.rotation.y = Math.atan2(dir.x, dir.z);
                    npc.rig.setAnimation('walk');
                } else {
                    npc.state = 'working';
                    npc.rig.setAnimation('repair');
                    npc.stateTimer = 3.0;
                }
            }

            npc.rig.updateAnimation(delta);
        });
    }

    getClosestNPC(playerPos, maxDist = 3.5) {
        let closest = null;
        let minDist = maxDist;

        for (const npc of this.npcs) {
            const dist = npc.mesh.position.distanceTo(playerPos);
            if (dist < minDist) {
                minDist = dist;
                closest = npc;
            }
        }
        return closest;
    }
}
