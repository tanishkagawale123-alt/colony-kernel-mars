/**
 * COLONY KERNEL: MARS - Colony Buildings & Architecture
 * Modular Sci-Fi domes, Central Kernel Tower, Solar fields, Oxygen plant, Greenhouse,
 * Robotics garage, Recreation dome, and interactive world hotspot markers.
 */

class ColonyBuildings {
    constructor(scene) {
        this.scene = scene;
        this.interactables = [];
        this.animatedObjects = [];

        this.buildKernelTower();
        this.buildSolarField();
        this.buildOxygenPlant();
        this.buildGreenhouse();
        this.buildMedicalBay();
        this.buildCommsTower();
        this.buildRoboticsGarage();
        this.buildRecreationDome();
        this.buildLandingPadLogistics();
        this.buildConnectingCorridors();
        this.initObjectiveBeacon();
    }

    // --- 1. Central Kernel Tower ---
    buildKernelTower() {
        const group = new THREE.Group();

        // Tower Base
        const baseGeom = new THREE.CylinderGeometry(5.5, 6.5, 4, 16);
        const baseMat = new THREE.MeshStandardMaterial({ color: 0x1a212d, roughness: 0.5, metalness: 0.7 });
        const base = new THREE.Mesh(baseGeom, baseMat);
        base.position.y = 2;
        group.add(base);

        // Holographic Core Chamber (Glass Cylinder)
        const chamberGeom = new THREE.CylinderGeometry(3.5, 3.5, 6, 16);
        const chamberMat = new THREE.MeshPhysicalMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.35,
            roughness: 0.1,
            metalness: 0.1,
            transmission: 0.9
        });
        const chamber = new THREE.Mesh(chamberGeom, chamberMat);
        chamber.position.y = 7;
        group.add(chamber);

        // Rotating Quantum Ring Core inside
        const coreRingGeom = new THREE.TorusGeometry(2.0, 0.3, 16, 32);
        const coreRingMat = new THREE.MeshBasicMaterial({ color: 0x00ffff });
        const coreRing = new THREE.Mesh(coreRingGeom, coreRingMat);
        coreRing.position.y = 7;
        coreRing.rotation.x = Math.PI / 3;
        group.add(coreRing);

        const innerCore = new THREE.Mesh(
            new THREE.OctahedronGeometry(1.2, 0),
            new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true })
        );
        innerCore.position.y = 7;
        group.add(innerCore);

        // Tower Spire / Antenna
        const spireGeom = new THREE.ConeGeometry(2, 10, 16);
        const spireMat = new THREE.MeshStandardMaterial({ color: 0x222a38, roughness: 0.4, metalness: 0.8 });
        const spire = new THREE.Mesh(spireGeom, spireMat);
        spire.position.y = 15;
        group.add(spire);

        // Main OS Console Terminal on ground in front of tower
        const consoleGeom = new THREE.BoxGeometry(2.2, 1.2, 1.0);
        const consoleMat = new THREE.MeshStandardMaterial({ color: 0x0d141e, roughness: 0.3, metalness: 0.9 });
        const consoleMesh = new THREE.Mesh(consoleGeom, consoleMat);
        consoleMesh.position.set(0, 0.6, 5.2);
        group.add(consoleMesh);

        // Holographic screen on console
        const screenGeom = new THREE.PlaneGeometry(1.8, 0.8);
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x00ffcc, side: THREE.DoubleSide });
        const screen = new THREE.Mesh(screenGeom, screenMat);
        screen.position.set(0, 1.3, 5.2);
        screen.rotation.x = -Math.PI / 6;
        group.add(screen);

        this.scene.add(group);

        this.animatedObjects.push({
            update: (delta) => {
                coreRing.rotation.y += delta * 1.5;
                coreRing.rotation.z += delta * 0.8;
                innerCore.rotation.x += delta * 2.0;
                innerCore.rotation.y += delta * 2.0;
            }
        });

        // Register interactable
        this.interactables.push({
            id: 'kernel_terminal',
            name: 'Kernel OS Terminal',
            type: 'kernel_mode',
            position: new THREE.Vector3(0, 1, 5.5),
            radius: 2.8,
            prompt: 'Press [E] or [TAB] to Open Holographic Kernel OS'
        });
    }

    // --- 2. Power Generation Sector ---
    buildSolarField() {
        const group = new THREE.Group();
        group.position.set(22, 0, -18);

        // Array of 4 large rotating solar panels
        this.solarPanels = [];
        for (let i = 0; i < 4; i++) {
            const panelGroup = new THREE.Group();
            panelGroup.position.set((i % 2) * 8 - 4, 0, Math.floor(i / 2) * 8 - 4);

            // Stand
            const standGeom = new THREE.CylinderGeometry(0.3, 0.4, 3, 12);
            const standMat = new THREE.MeshStandardMaterial({ color: 0x555c66 });
            const stand = new THREE.Mesh(standGeom, standMat);
            stand.position.y = 1.5;
            panelGroup.add(stand);

            // Solar Wing
            const wingGeom = new THREE.BoxGeometry(4.5, 0.15, 2.5);
            const wingMat = new THREE.MeshStandardMaterial({
                color: 0x0a1c38,
                roughness: 0.2,
                metalness: 0.9,
                emissive: 0x051025
            });
            const wing = new THREE.Mesh(wingGeom, wingMat);
            wing.position.y = 3.2;
            wing.rotation.x = Math.PI / 4;
            panelGroup.add(wing);

            group.add(panelGroup);
            this.solarPanels.push(wing);
        }

        // Substation Box
        const subGeom = new THREE.BoxGeometry(3, 2, 2.5);
        const subMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, roughness: 0.6 });
        const substation = new THREE.Mesh(subGeom, subMat);
        substation.position.set(0, 1, 6);
        group.add(substation);

        this.scene.add(group);

        this.interactables.push({
            id: 'solar_align',
            name: 'Solar Grid Calibrator',
            type: 'minigame',
            minigameId: 'solar_align',
            position: new THREE.Vector3(22, 1, -12),
            radius: 3.0,
            prompt: 'Press [E] to Align Solar Grid'
        });
    }

    // --- 3. Oxygen Life Support Plant ---
    buildOxygenPlant() {
        const group = new THREE.Group();
        group.position.set(-22, 0, 15);

        // 3 Giant Oxygen Tanks
        for (let i = 0; i < 3; i++) {
            const tankGeom = new THREE.CylinderGeometry(1.8, 1.8, 6, 16);
            const tankMat = new THREE.MeshStandardMaterial({ color: 0x2288dd, roughness: 0.4, metalness: 0.6 });
            const tank = new THREE.Mesh(tankGeom, tankMat);
            tank.position.set(i * 3.5 - 3.5, 3, 0);
            group.add(tank);

            // Cap
            const cap = new THREE.Mesh(
                new THREE.SphereGeometry(1.8, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2),
                tankMat
            );
            cap.position.set(i * 3.5 - 3.5, 6, 0);
            group.add(cap);
        }

        // Pipe Network Junction Box
        const pipeControlGeom = new THREE.BoxGeometry(2.5, 1.8, 1.5);
        const pipeControlMat = new THREE.MeshStandardMaterial({ color: 0x1f4466 });
        const pipeControl = new THREE.Mesh(pipeControlGeom, pipeControlMat);
        pipeControl.position.set(0, 0.9, 4);
        group.add(pipeControl);

        this.scene.add(group);

        this.interactables.push({
            id: 'oxygen_pipe',
            name: 'Life Support Pipe Valves',
            type: 'minigame',
            minigameId: 'oxygen_pipe',
            position: new THREE.Vector3(-22, 1, 19),
            radius: 3.0,
            prompt: 'Press [E] to Seal Oxygen Pressure Valves'
        });
    }

    // --- 4. Hydroponic Greenhouse Dome ---
    buildGreenhouse() {
        const group = new THREE.Group();
        group.position.set(22, 0, 18);

        // Geodesic Glass Dome
        const domeGeom = new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshPhysicalMaterial({
            color: 0x44ff88,
            transparent: true,
            opacity: 0.4,
            roughness: 0.1,
            metalness: 0.1,
            wireframe: false
        });
        const dome = new THREE.Mesh(domeGeom, domeMat);
        group.add(dome);

        // Internal Hydroponic Glow Trays
        for (let i = 0; i < 4; i++) {
            const trayGeom = new THREE.BoxGeometry(3.5, 0.5, 1.2);
            const trayMat = new THREE.MeshStandardMaterial({ color: 0x113311, emissive: 0x0a4411 });
            const tray = new THREE.Mesh(trayGeom, trayMat);
            tray.position.set((i % 2) * 3 - 1.5, 0.3, Math.floor(i / 2) * 2.5 - 1.25);
            group.add(tray);
        }

        this.scene.add(group);

        this.interactables.push({
            id: 'hydro_farm',
            name: 'Hydroponics Nutrient Synthesizer',
            type: 'minigame',
            minigameId: 'hydro_farm',
            position: new THREE.Vector3(22, 1, 23),
            radius: 3.0,
            prompt: 'Press [E] to Balance Crop Nutrients'
        });
    }

    // --- 5. Medical Bio-Bay ---
    buildMedicalBay() {
        const group = new THREE.Group();
        group.position.set(-18, 0, -18);

        // Medical Dome
        const domeGeom = new THREE.SphereGeometry(5.5, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshStandardMaterial({ color: 0xedf2f7, roughness: 0.3, metalness: 0.4 });
        const dome = new THREE.Mesh(domeGeom, domeMat);
        group.add(dome);

        // Red Cross / Medical Sign
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
        crossH.position.set(0, 3.2, 5.4);
        group.add(crossH);
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 0.1), new THREE.MeshBasicMaterial({ color: 0xff0044 }));
        crossV.position.set(0, 3.2, 5.4);
        group.add(crossV);

        this.scene.add(group);

        this.interactables.push({
            id: 'memory_matrix',
            name: 'Medical Bio-Diagnostics Scanner',
            type: 'minigame',
            minigameId: 'memory_matrix',
            position: new THREE.Vector3(-18, 1, -12),
            radius: 3.0,
            prompt: 'Press [E] to Run Memory Matrix Diagnostic'
        });
    }

    // --- 6. Communications Array Tower ---
    buildCommsTower() {
        const group = new THREE.Group();
        group.position.set(0, 0, -28);

        // Truss Tower
        const trussGeom = new THREE.CylinderGeometry(0.8, 2.5, 14, 8);
        const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, wireframe: false });
        const truss = new THREE.Mesh(trussGeom, trussMat);
        truss.position.y = 7;
        group.add(truss);

        // Giant Satellite Dish
        const dishGeom = new THREE.CylinderGeometry(4.5, 1.5, 1.2, 16, 1, true);
        const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.8 });
        const dish = new THREE.Mesh(dishGeom, dishMat);
        dish.position.y = 15;
        dish.rotation.x = Math.PI / 3;
        group.add(dish);

        // Blinking Beacon light
        const beaconGeom = new THREE.SphereGeometry(0.5, 8, 8);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const beacon = new THREE.Mesh(beaconGeom, beaconMat);
        beacon.position.y = 17;
        group.add(beacon);

        this.scene.add(group);

        this.animatedObjects.push({
            update: (delta) => {
                dish.rotation.y += delta * 0.2;
                beaconMat.color.setHex((Math.sin(Date.now() * 0.005) > 0) ? 0xff0000 : 0x440000);
            }
        });

        this.interactables.push({
            id: 'comms_signal',
            name: 'Comms Uplink Tuner',
            type: 'minigame',
            minigameId: 'comms_signal',
            position: new THREE.Vector3(0, 1, -22),
            radius: 3.0,
            prompt: 'Press [E] to Calibrate Uplink Wave Signal'
        });
    }

    // --- 7. Robotics Garage & Rover Track ---
    buildRoboticsGarage() {
        const group = new THREE.Group();
        group.position.set(-28, 0, 0);

        // Hangar Arch
        const hangarGeom = new THREE.CylinderGeometry(5, 5, 8, 16, 1, true, 0, Math.PI);
        hangarGeom.rotateZ(Math.PI / 2);
        const hangarMat = new THREE.MeshStandardMaterial({ color: 0x334155, side: THREE.DoubleSide });
        const hangar = new THREE.Mesh(hangarGeom, hangarMat);
        hangar.position.y = 0;
        group.add(hangar);

        // Parked Low-Poly Mars Rover
        const roverGroup = new THREE.Group();
        roverGroup.position.set(0, 0.6, 0);

        const roverBody = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.8, 1.6), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
        roverGroup.add(roverBody);

        // Rover Wheels
        for (let i = 0; i < 4; i++) {
            const wheel = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12),
                new THREE.MeshStandardMaterial({ color: 0x111111 })
            );
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set((i % 2) * 2 - 1, -0.2, Math.floor(i / 2) * 1.8 - 0.9);
            roverGroup.add(wheel);
        }
        group.add(roverGroup);

        this.scene.add(group);

        this.interactables.push({
            id: 'rover_race',
            name: 'Mars Rover Rally Terminal',
            type: 'minigame',
            minigameId: 'rover_race',
            position: new THREE.Vector3(-28, 1, 4),
            radius: 3.0,
            prompt: 'Press [E] to Launch Mars Rover Rally'
        });

        this.interactables.push({
            id: 'robot_repair',
            name: 'Robot Logic Bench',
            type: 'minigame',
            minigameId: 'robot_repair',
            position: new THREE.Vector3(-28, 1, -4),
            radius: 3.0,
            prompt: 'Press [E] to Repair Robot Logic Core'
        });
    }

    // --- 8. Recreation Dome ---
    buildRecreationDome() {
        const group = new THREE.Group();
        group.position.set(0, 0, 24);

        // Dome
        const domeGeom = new THREE.SphereGeometry(6, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
        const domeMat = new THREE.MeshPhysicalMaterial({
            color: 0x9333ea,
            transparent: true,
            opacity: 0.45,
            roughness: 0.2
        });
        const dome = new THREE.Mesh(domeGeom, domeMat);
        group.add(dome);

        // Retro Arcade Machine
        const arcadeGeom = new THREE.BoxGeometry(1.0, 2.2, 1.0);
        const arcadeMat = new THREE.MeshStandardMaterial({ color: 0xec4899, emissive: 0x330022 });
        const arcade = new THREE.Mesh(arcadeGeom, arcadeMat);
        arcade.position.set(-2, 1.1, 0);
        group.add(arcade);

        // Vending Machine
        const vendGeom = new THREE.BoxGeometry(1.2, 2.0, 0.9);
        const vendMat = new THREE.MeshStandardMaterial({ color: 0x06b6d4, emissive: 0x002233 });
        const vend = new THREE.Mesh(vendGeom, vendMat);
        vend.position.set(2, 1.0, 0);
        group.add(vend);

        // Lounge Chairs
        for (let i = 0; i < 3; i++) {
            const chair = new THREE.Mesh(
                new THREE.BoxGeometry(0.8, 0.6, 0.8),
                new THREE.MeshStandardMaterial({ color: 0xf59e0b })
            );
            chair.position.set(i * 1.5 - 1.5, 0.3, -2);
            group.add(chair);
        }

        this.scene.add(group);

        this.interactables.push({
            id: 'meteor_dodge',
            name: 'Recreation Arcade Cabinet',
            type: 'minigame',
            minigameId: 'meteor_dodge',
            position: new THREE.Vector3(-2, 1, 24),
            radius: 2.5,
            prompt: 'Press [E] to Play Meteor Dodge'
        });

        this.interactables.push({
            id: 'vending',
            name: 'Mars Snack Dispenser',
            type: 'snack',
            position: new THREE.Vector3(2, 1, 24),
            radius: 2.5,
            prompt: 'Press [E] to Grab a Martian Protein Bar (+Happiness)'
        });
    }

    // --- 8b. Landing Pad & Logistics Terminals ---
    buildLandingPadLogistics() {
        const group = new THREE.Group();
        group.position.set(-28, 0, -28);

        // Drone Charging & Launch Pad Station
        const droneStationGeom = new THREE.BoxGeometry(2.0, 1.2, 1.2);
        const droneStationMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.8 });
        const droneStation = new THREE.Mesh(droneStationGeom, droneStationMat);
        droneStation.position.set(0, 0.6, 5);
        group.add(droneStation);

        // Holographic Drone Icon
        const droneScreen = new THREE.Mesh(
            new THREE.PlaneGeometry(1.4, 0.7),
            new THREE.MeshBasicMaterial({ color: 0x00f0ff, side: THREE.DoubleSide })
        );
        droneScreen.position.set(0, 1.3, 5);
        droneScreen.rotation.x = -Math.PI / 6;
        group.add(droneScreen);

        // Priority Cargo Buffer Sorting Depot
        const cargoBoxGeom = new THREE.BoxGeometry(2.6, 1.4, 1.5);
        const cargoBoxMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 });
        const cargoBox = new THREE.Mesh(cargoBoxGeom, cargoBoxMat);
        cargoBox.position.set(5, 0.7, 0);
        group.add(cargoBox);

        this.scene.add(group);

        // Register interactables
        this.interactables.push({
            id: 'drone_delivery',
            name: 'Drone Wind Navigation Terminal',
            type: 'minigame',
            minigameId: 'drone_delivery',
            position: new THREE.Vector3(-28, 1, -23),
            radius: 3.2,
            prompt: 'Press [E] to Launch Drone Wind Navigation'
        });

        this.interactables.push({
            id: 'cargo_sort',
            name: 'Priority Cargo Buffer Sorter',
            type: 'minigame',
            minigameId: 'cargo_sort',
            position: new THREE.Vector3(-23, 1, -28),
            radius: 3.2,
            prompt: 'Press [E] to Sort Colony Priority Cargo'
        });
    }

    // --- 3D Floating Objective Waypoint Beacon ---
    initObjectiveBeacon() {
        this.beaconGroup = new THREE.Group();

        // Pulsing diamond
        const geom = new THREE.OctahedronGeometry(0.8, 0);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffd700,
            wireframe: false,
            transparent: true,
            opacity: 0.85
        });
        this.beaconMesh = new THREE.Mesh(geom, mat);
        this.beaconMesh.position.y = 3.5;
        this.beaconGroup.add(this.beaconMesh);

        // Beacon outer ring
        const ringGeom = new THREE.TorusGeometry(1.2, 0.08, 8, 24);
        ringGeom.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.6 });
        this.beaconRing = new THREE.Mesh(ringGeom, ringMat);
        this.beaconRing.position.y = 3.5;
        this.beaconGroup.add(this.beaconRing);

        // Downward targeting light beam
        const beamGeom = new THREE.CylinderGeometry(0.04, 0.6, 3.5, 8);
        const beamMat = new THREE.MeshBasicMaterial({ color: 0xffd700, transparent: true, opacity: 0.25 });
        const beam = new THREE.Mesh(beamGeom, beamMat);
        beam.position.y = 1.75;
        this.beaconGroup.add(beam);

        this.beaconGroup.position.set(0, 0, 5.5);
        this.scene.add(this.beaconGroup);
    }

    setObjectiveBeaconPos(pos) {
        if (!this.beaconGroup || !pos) return;
        this.beaconGroup.position.set(pos.x, pos.y || 0, pos.z);
    }

    // --- 9. Connecting Tubular Corridors ---
    buildConnectingCorridors() {
        const corridorMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
        const tubeSegments = [
            { from: [0, 0], to: [22, -18] },
            { from: [0, 0], to: [-22, 15] },
            { from: [0, 0], to: [22, 18] },
            { from: [0, 0], to: [-18, -18] },
            { from: [0, 0], to: [0, -28] },
            { from: [0, 0], to: [-28, 0] },
            { from: [0, 0], to: [0, 24] }
        ];

        tubeSegments.forEach(seg => {
            const start = new THREE.Vector3(seg.from[0], 0.6, seg.from[1]);
            const end = new THREE.Vector3(seg.to[0], 0.6, seg.to[1]);
            const dist = start.distanceTo(end);
            const mid = start.clone().lerp(end, 0.5);

            const tubeGeom = new THREE.CylinderGeometry(0.7, 0.7, dist - 6, 8);
            tubeGeom.rotateX(Math.PI / 2);
            const tube = new THREE.Mesh(tubeGeom, corridorMat);
            tube.position.copy(mid);
            tube.lookAt(end);
            this.scene.add(tube);
        });
    }

    update(delta) {
        this.animatedObjects.forEach(obj => obj.update(delta));
        if (this.beaconMesh) {
            this.beaconMesh.rotation.y += delta * 2.2;
            this.beaconMesh.position.y = 3.5 + Math.sin(Date.now() * 0.005) * 0.35;
        }
        if (this.beaconRing) {
            this.beaconRing.rotation.z += delta * 1.6;
        }
    }

    getClosestInteractable(pos, maxDist = 3.2) {
        let closest = null;
        let minDist = maxDist;

        for (const item of this.interactables) {
            const dist = item.position.distanceTo(pos);
            if (dist < minDist) {
                minDist = dist;
                closest = item;
            }
        }
        return closest;
    }
}
