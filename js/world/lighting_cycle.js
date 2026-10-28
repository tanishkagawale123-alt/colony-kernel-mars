/**
 * COLONY KERNEL: MARS - Lighting, Skybox & Day/Night Cycle
 * Manages Martian sunlight, sky ambient colors, emergency alarms, and storm overrides.
 */

class LightingCycle {
    constructor(scene) {
        this.scene = scene;
        this.timeOfDay = 0.25; // 0 = dawn, 0.25 = noon, 0.5 = dusk, 0.75 = midnight
        this.cycleSpeed = 0.008; // 1 cycle = ~120s
        this.isEmergency = false;
        this.isDustStorm = false;

        this.initLights();
        this.initSky();
    }

    initLights() {
        // Ambient Light
        this.ambientLight = new THREE.AmbientLight(0xd9754f, 0.6);
        this.scene.add(this.ambientLight);

        // Directional Sun Light
        this.sunLight = new THREE.DirectionalLight(0xffeedd, 1.2);
        this.sunLight.position.set(40, 60, 30);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 1024;
        this.sunLight.shadow.mapSize.height = 1024;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 150;
        this.sunLight.shadow.camera.left = -50;
        this.sunLight.shadow.camera.right = 50;
        this.sunLight.shadow.camera.top = 50;
        this.sunLight.shadow.camera.bottom = -50;
        this.scene.add(this.sunLight);

        // Emergency Alarm Light (flashing red point light at central tower)
        this.alarmLight = new THREE.PointLight(0xff0022, 0, 45);
        this.alarmLight.position.set(0, 10, 0);
        this.scene.add(this.alarmLight);
    }

    initSky() {
        // Dynamic fog for Martian atmosphere
        this.scene.fog = new THREE.FogExp2(0xc45e38, 0.012);
        this.scene.background = new THREE.Color(0xc45e38);
    }

    setEmergency(active) {
        this.isEmergency = active;
        if (!active) {
            this.alarmLight.intensity = 0;
        }
    }

    setDustStorm(active) {
        this.isDustStorm = active;
    }

    update(delta) {
        // Advance cycle
        this.timeOfDay = (this.timeOfDay + delta * this.cycleSpeed) % 1.0;

        const sunAngle = this.timeOfDay * Math.PI * 2;
        const sunHeight = Math.sin(sunAngle);
        const sunDist = 70;

        this.sunLight.position.set(
            Math.cos(sunAngle) * sunDist,
            Math.max(2, sunHeight * sunDist),
            Math.sin(sunAngle) * 30
        );

        // Interpolate colors based on day/night
        const isDay = sunHeight > 0;
        const dayFactor = Math.max(0, Math.min(1, (sunHeight + 0.2) * 2));

        if (this.isEmergency) {
            // Emergency red strobe
            const strobe = (Math.sin(Date.now() * 0.01) + 1) * 2.5;
            this.alarmLight.intensity = strobe;
            this.ambientLight.color.setHex(0x551122);
            this.sunLight.color.setHex(0xff3333);
            this.scene.fog.color.setHex(0x441118);
            this.scene.background.setHex(0x330d12);
        } else if (this.isDustStorm) {
            // Thick orange/brown storm
            this.ambientLight.color.setHex(0x994422);
            this.sunLight.color.setHex(0xffaa66);
            this.sunLight.intensity = 0.5;
            this.scene.fog.color.setHex(0xa84824);
            this.scene.fog.density = 0.035;
            this.scene.background.setHex(0x8a3818);
        } else {
            this.scene.fog.density = 0.012;
            if (isDay) {
                // Mars Daytime: Golden orange sun, warm Martian ambient
                this.ambientLight.color.lerpColors(new THREE.Color(0x73301a), new THREE.Color(0xcca080), dayFactor);
                this.sunLight.color.setHex(0xfff2df);
                this.sunLight.intensity = 0.6 + dayFactor * 0.8;
                this.scene.fog.color.lerpColors(new THREE.Color(0x3a140c), new THREE.Color(0xd9754f), dayFactor);
                this.scene.background.copy(this.scene.fog.color);
            } else {
                // Mars Nighttime: Deep violet/navy sky with glowing red terrain hints
                this.ambientLight.color.setHex(0x1a1e36);
                this.sunLight.color.setHex(0x4466aa);
                this.sunLight.intensity = 0.25;
                this.scene.fog.color.setHex(0x0f1324);
                this.scene.background.setHex(0x0a0c18);
            }
        }
    }
}
