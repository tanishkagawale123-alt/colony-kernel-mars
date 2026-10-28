/**
 * COLONY KERNEL: MARS - Master Game Loop & Engine Controller
 * Coordinates 3D rendering, physics, OS kernel scheduling, NPCs, Pixel, Mini-games, and UI.
 */

class ColonyKernelGame {
    constructor() {
        this.container = document.getElementById('game-canvas-container');
        this.clock = new THREE.Clock();

        this.isGameOver = false;
        this.isGameWon = false;
        this.currentDialogNPC = null;

        this.initThree();
        this.initWorld();
        this.initSubsystems();
        this.setupUIEvents();

        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            500
        );

        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initWorld() {
        this.lightingCycle = new LightingCycle(this.scene);
        window.lightingCycle = this.lightingCycle;

        this.marsTerrain = new MarsTerrain(this.scene);
        this.colonyBuildings = new ColonyBuildings(this.scene);
        this.particleManager = new ParticleManager(this.scene);
        window.particleManager = this.particleManager;
    }

    initSubsystems() {
        // Camera Controller
        this.cameraController = new GameCamera(this.camera, null);

        // Player
        this.player = new PlayerController(this.scene, this.cameraController);
        this.cameraController.setTarget(this.player.mesh);

        // NPCs
        this.npcManager = new NPCManager(this.scene);
        window.npcManager = this.npcManager;

        // Pixel Companion Robot
        this.pixelCompanion = new PixelCompanion(this.scene, this.player.mesh);
        window.pixelCompanion = this.pixelCompanion;

        // Kernel AI Assistant
        window.kernelAI.init();

        // 4-Core CPU Scheduler
        this.scheduler = new CPUScheduler();
        this.kernelUI = new KernelUI(this.scheduler);

        // 10 Mini-Games
        this.miniGames = new MiniGameManager();

        // Story Missions & Progression
        this.missionDirector = new MissionDirector();
        this.progression = new ProgressionManager();

        // Welcome message
        setTimeout(() => {
            window.kernelAI.say('Colony Kernel v2.4 online. Welcome, Administrator. Manage our CPU cores, survive Mars, and keep our people breathing.', 'happy', 6.0);
        }, 1000);
    }

    setupUIEvents() {
        // Start sound engine on first user click
        window.addEventListener('click', () => {
            if (window.soundEngine) window.soundEngine.init();
        }, { once: true });

        // Tab button on HUD
        const tabBtn = document.getElementById('hud-btn-kernel');
        if (tabBtn) {
            tabBtn.addEventListener('click', () => this.toggleKernelMode());
        }

        // Customizer modal button
        const custBtn = document.getElementById('hud-btn-customize');
        if (custBtn) {
            custBtn.addEventListener('click', () => this.openCustomizer());
        }

        // Settings modal button
        const setBtn = document.getElementById('hud-btn-settings');
        if (setBtn) {
            setBtn.addEventListener('click', () => this.openSettings());
        }

        // Audio mute button
        const muteBtn = document.getElementById('hud-btn-mute');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const isMuted = !window.soundEngine.isMuted;
                window.soundEngine.setMuted(isMuted);
                muteBtn.textContent = isMuted ? '🔇' : '🔊';
            });
        }
    }

    toggleKernelMode() {
        this.kernelUI.toggle();
        if (this.kernelUI.isOpen) {
            this.missionDirector.checkObjective('open_kernel');
        }
    }

    handleEscape() {
        if (this.kernelUI.isOpen) {
            this.kernelUI.toggle();
        } else if (this.miniGames.activeGame) {
            this.miniGames.close();
        } else if (this.currentDialogNPC) {
            this.closeDialogue();
        } else {
            this.closeAllModals();
        }
    }

    handleInteractKey() {
        if (window.inputController.isUIActive) return;

        const playerPos = this.player.mesh.position;

        // 1. Check closest NPC
        const closestNPC = this.npcManager.getClosestNPC(playerPos, 3.2);
        if (closestNPC) {
            this.openDialogue(closestNPC);
            return;
        }

        // 2. Check closest Colony Building Interactable
        const closestProp = this.colonyBuildings.getClosestInteractable(playerPos, 3.5);
        if (closestProp) {
            if (closestProp.type === 'kernel_mode') {
                this.toggleKernelMode();
                this.progression.unlockAchievement('touch_that');
            } else if (closestProp.type === 'minigame') {
                this.miniGames.launch(closestProp.minigameId);
            } else if (closestProp.type === 'snack') {
                this.scheduler.cascadeEngine.resources.happiness = Math.min(100, this.scheduler.cascadeEngine.resources.happiness + 10);
                this.showToast('Yum! Protein Bar restored energy! (+10% Colony Happiness)', 'success');
                if (window.soundEngine) window.soundEngine.playSuccess();
            }
            return;
        }
    }

    openDialogue(npc) {
        this.currentDialogNPC = npc;
        window.inputController.isUIActive = true;

        const modal = document.getElementById('dialogue-modal');
        if (!modal) return;
        modal.classList.remove('hidden');

        const nameEl = document.getElementById('dialogue-npc-name');
        const roleEl = document.getElementById('dialogue-npc-role');
        const textEl = document.getElementById('dialogue-npc-text');
        const topicsEl = document.getElementById('dialogue-topics');
        const friendMeter = document.getElementById('dialogue-friend-fill');
        const friendTier = document.getElementById('dialogue-friend-tier');

        nameEl.textContent = npc.profile.name;
        roleEl.textContent = npc.profile.profession;

        const data = window.NPC_DIALOGUES[npc.profile.id] || { greeting: "Hello there!", topics: [] };
        textEl.textContent = data.greeting;

        const tier = this.npcManager.getFriendshipTier(npc.profile.friendship);
        if (friendMeter) friendMeter.style.width = `${npc.profile.friendship}%`;
        if (friendTier) friendTier.textContent = `RELATIONSHIP: ${tier.toUpperCase()}`;

        // Topics
        let html = '';
        data.topics.forEach((top, idx) => {
            html += `<button class="dialogue-btn" onclick="window.game.selectDialogueTopic(${idx})">${top.text}</button>`;
        });
        html += `<button class="dialogue-btn btn-exit" onclick="window.game.closeDialogue()">Goodbye [ESC]</button>`;
        topicsEl.innerHTML = html;

        if (window.soundEngine) window.soundEngine.playClick();

        if (npc.profile.id === 'maya') {
            this.missionDirector.checkObjective('talk_maya');
        } else if (npc.profile.id === 'arjun') {
            this.missionDirector.checkObjective('talk_arjun');
        } else if (npc.profile.id === 'lena') {
            this.missionDirector.checkObjective('talk_lena');
        }
    }

    selectDialogueTopic(idx) {
        if (!this.currentDialogNPC) return;
        const data = window.NPC_DIALOGUES[this.currentDialogNPC.profile.id];
        if (!data || !data.topics[idx]) return;

        const top = data.topics[idx];
        const textEl = document.getElementById('dialogue-npc-text');
        textEl.textContent = top.response;

        if (top.rewardXP) this.addXP(top.rewardXP);
        if (top.friendship) {
            const res = this.npcManager.increaseFriendship(this.currentDialogNPC.profile.id, top.friendship);
            const friendMeter = document.getElementById('dialogue-friend-fill');
            const friendTier = document.getElementById('dialogue-friend-tier');
            if (friendMeter) friendMeter.style.width = `${res.points}%`;
            if (friendTier) friendTier.textContent = `RELATIONSHIP: ${res.tier.toUpperCase()}`;
            this.showToast(`Friendship increased with ${res.name}! (${res.tier})`, 'success');
        }

        if (window.soundEngine) window.soundEngine.playClick();
    }

    closeDialogue() {
        this.currentDialogNPC = null;
        const modal = document.getElementById('dialogue-modal');
        if (modal) modal.classList.add('hidden');
        window.inputController.isUIActive = false;
        if (window.soundEngine) window.soundEngine.playClick();
    }

    openCustomizer() {
        const modal = document.getElementById('customizer-modal');
        if (modal) {
            modal.classList.remove('hidden');
            window.inputController.isUIActive = true;
        }
    }

    openSettings() {
        const modal = document.getElementById('settings-modal');
        if (modal) {
            modal.classList.remove('hidden');
            window.inputController.isUIActive = true;
        }
    }

    closeAllModals() {
        document.querySelectorAll('.game-modal').forEach(m => m.classList.add('hidden'));
        window.inputController.isUIActive = false;
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast-msg toast-${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 400);
        }, 3800);
    }

    addXP(amount) {
        this.progression.addXP(amount);
    }

    addCredits(amount) {
        this.progression.addCredits(amount);
    }

    recordProcessCompleted(proc) {
        this.addXP(40);
        this.addCredits(25);
        if (this.scheduler.completedProcesses.length >= 10) {
            this.progression.unlockAchievement('master_scheduler');
        }
    }

    recordDeadlockResolved() {
        this.addXP(100);
        this.addCredits(80);
        this.progression.unlockAchievement('deadlock_breaker');
        this.missionDirector.checkObjective('resolve_deadlock');
    }

    resolveActiveDeadlock() {
        const pids = Array.from(this.scheduler.deadlockDetector.deadlockedPids);
        if (pids.length > 0) {
            const targetPid = pids[0];
            this.scheduler.deadlockDetector.terminateProcess(targetPid, this.scheduler);
        }
    }

    toggleRoverMode() {
        if (this.player) {
            this.player.toggleRoverMode();
            const btn = document.getElementById('hud-btn-rover');
            if (btn) {
                btn.textContent = this.player.isRoverActive ? '🚶 ON FOOT [R]' : '🚀 ROVER [R]';
                btn.classList.toggle('hud-btn-primary', this.player.isRoverActive);
            }
        }
    }

    cycleProcessPriority(pid) {
        const proc = this.scheduler.processes.find(p => p.pid === pid);
        if (!proc) return;
        const order = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const nextIdx = (order.indexOf(proc.priority) + 1) % order.length;
        proc.setPriority(order[nextIdx]);
        if (window.soundEngine) window.soundEngine.playClick();
        this.scheduler.logSystemEvent(`PID ${pid} priority altered to ${proc.priority}.`, 'info');
    }

    openAchievements() {
        const modal = document.getElementById('achievements-modal');
        const container = document.getElementById('achievements-list-container');
        if (!modal || !container) return;

        container.innerHTML = this.progression.achievements.map(a => `
            <div class="achieve-card ${a.unlocked ? 'unlocked' : ''}">
                <div class="achieve-icon">${a.unlocked ? a.icon : '🔒'}</div>
                <div>
                    <div class="achieve-title" style="color:${a.unlocked ? '#ffd700' : '#8892b0'}">${a.title}</div>
                    <div class="achieve-desc">${a.desc}</div>
                </div>
            </div>
        `).join('');

        modal.classList.remove('hidden');
        window.inputController.isUIActive = true;
        if (window.soundEngine) window.soundEngine.playClick();
    }

    closeAchievements() {
        const modal = document.getElementById('achievements-modal');
        if (modal) modal.classList.add('hidden');
        window.inputController.isUIActive = false;
        if (window.soundEngine) window.soundEngine.playClick();
    }

    getActiveObjectiveTarget() {
        const mission = this.missionDirector.getCurrentMission();
        if (!mission) return { name: 'SURVIVAL SANDBOX', pos: new THREE.Vector3(0, 0, 5.5) };

        const activeObj = mission.objectives.find(o => !o.completed) || mission.objectives[0];
        const id = activeObj.id;

        if (id === 'talk_maya') {
            const npc = this.npcManager.npcs.find(n => n.profile.id === 'maya');
            return { name: 'MAYA (CENTRAL SPIRE)', pos: npc ? npc.mesh.position : new THREE.Vector3(0, 0, 6) };
        } else if (id === 'talk_arjun') {
            const npc = this.npcManager.npcs.find(n => n.profile.id === 'arjun');
            return { name: 'ARJUN (SOLAR FIELD)', pos: npc ? npc.mesh.position : new THREE.Vector3(22, 0, -16) };
        } else if (id === 'talk_lena') {
            const npc = this.npcManager.npcs.find(n => n.profile.id === 'lena');
            return { name: 'LENA (OXYGEN PLANT)', pos: npc ? npc.mesh.position : new THREE.Vector3(-22, 0, 15) };
        } else if (id === 'solar_minigame') {
            return { name: 'SOLAR ARRAY CALIBRATOR', pos: new THREE.Vector3(22, 0, -12) };
        } else if (id === 'seal_o2_pipes') {
            return { name: 'O2 PRESSURE VALVES', pos: new THREE.Vector3(-22, 0, 19) };
        } else if (id === 'open_kernel' || id === 'dispatch_power' || id === 'preempt_task' || id === 'detect_deadlock' || id === 'resolve_deadlock') {
            return { name: 'KERNEL OS TERMINAL', pos: new THREE.Vector3(0, 0, 5.5) };
        }
        return { name: 'COLONY OBJECTIVE', pos: new THREE.Vector3(0, 0, 5.5) };
    }

    updateRadar() {
        const cv = document.getElementById('hud-radar-canvas');
        if (!cv) return;
        const ctx = cv.getContext('2d');
        const cx = 80;
        const cy = 80;
        const radarRadius = 72;
        const worldRadius = 75; // 75m perimeter
        const scale = radarRadius / worldRadius;

        ctx.clearRect(0, 0, 160, 160);

        // Circular clip
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, radarRadius, 0, Math.PI * 2);
        ctx.clip();

        // Background grid rings
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radarRadius * 0.33, 0, Math.PI * 2);
        ctx.arc(cx, cy, radarRadius * 0.66, 0, Math.PI * 2);
        ctx.arc(cx, cy, radarRadius * 0.98, 0, Math.PI * 2);
        ctx.moveTo(cx, 0); ctx.lineTo(cx, 160);
        ctx.moveTo(0, cy); ctx.lineTo(160, cy);
        ctx.stroke();

        // Rotating radar sweep line
        const sweepAngle = (Date.now() * 0.002) % (Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sweepAngle) * radarRadius, cy + Math.sin(sweepAngle) * radarRadius);
        ctx.stroke();

        // Draw Colony Buildings (Cyan dots)
        const sectors = [
            { x: 0, z: 0, label: 'K' },
            { x: 22, z: -18, label: 'S' },
            { x: -22, z: 15, label: 'O2' },
            { x: 22, z: 18, label: 'G' },
            { x: -18, z: -18, label: 'M' },
            { x: 0, z: -28, label: 'C' },
            { x: -28, z: 0, label: 'R' },
            { x: 0, z: 24, label: 'A' },
            { x: -28, z: -28, label: 'H' }
        ];

        ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
        sectors.forEach(s => {
            const rx = cx + s.x * scale;
            const ry = cy + s.z * scale;
            ctx.beginPath();
            ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw NPCs (Colored dots)
        if (this.npcManager && this.npcManager.npcs) {
            this.npcManager.npcs.forEach(n => {
                const p = n.mesh.position;
                const rx = cx + p.x * scale;
                const ry = cy + p.z * scale;
                ctx.fillStyle = '#00ff88';
                ctx.beginPath();
                ctx.arc(rx, ry, 2.8, 0, Math.PI * 2);
                ctx.fill();
            });
        }

        // Draw Player (Cyan Triangle with Camera Heading)
        if (this.player && this.player.mesh) {
            const p = this.player.mesh.position;
            const px = cx + p.x * scale;
            const py = cy + p.z * scale;
            const yaw = this.cameraController.yaw;

            ctx.save();
            ctx.translate(px, py);
            ctx.rotate(-yaw + Math.PI);

            ctx.fillStyle = '#00f0ff';
            ctx.shadowColor = '#00f0ff';
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.moveTo(0, -6);
            ctx.lineTo(-4, 5);
            ctx.lineTo(4, 5);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Active Mission Objective Waypoint (Flashing Golden Diamond)
        const target = this.getActiveObjectiveTarget();
        if (target && target.pos) {
            const ox = cx + target.pos.x * scale;
            const oy = cy + target.pos.z * scale;

            ctx.fillStyle = '#ffd700';
            ctx.shadowColor = '#ffd700';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.moveTo(ox, oy - 5);
            ctx.lineTo(ox + 5, oy);
            ctx.lineTo(ox, oy + 5);
            ctx.lineTo(ox - 5, oy);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;

            // Update distance & target labels
            if (this.player && this.player.mesh) {
                const dist = Math.floor(this.player.mesh.position.distanceTo(target.pos));
                const distEl = document.getElementById('radar-distance-val');
                const lblEl = document.getElementById('radar-target-label');
                if (distEl) distEl.textContent = `${dist}m`;
                if (lblEl) lblEl.textContent = `TARGET: ${target.name}`;
            }

            // Update 3D beacon position
            if (this.colonyBuildings && this.colonyBuildings.setObjectiveBeaconPos) {
                this.colonyBuildings.setObjectiveBeaconPos(target.pos);
            }
        }

        ctx.restore();
    }

    triggerCelebration() {
        if (this.player && this.player.mesh) {
            this.particleManager.burstConfetti(this.player.mesh.position, 120);
            this.player.triggerEmote('celebrate', 3.0);
        }
        if (this.pixelCompanion) {
            this.pixelCompanion.setMood('dance');
            this.progression.unlockAchievement('pixel_friend');
        }
        if (this.npcManager) {
            this.npcManager.setColonyState('celebrate');
            setTimeout(() => this.npcManager.setColonyState('normal'), 6000);
        }
    }

    triggerSystemFailure(reason) {
        this.isGameOver = true;
        this.progression.renderPostmortem(false, reason);
        if (window.soundEngine) {
            window.soundEngine.playAlarm();
            window.soundEngine.setMood('emergency');
        }
    }

    triggerGameVictory() {
        this.isGameWon = true;
        this.triggerCelebration();
        this.cameraController.startCinematic(
            new THREE.Vector3(0, 35, 60),
            new THREE.Vector3(0, 5, 0),
            10.0
        );
        setTimeout(() => {
            this.progression.renderPostmortem(true);
        }, 4000);
    }

    updateHUD() {
        const res = this.scheduler.cascadeEngine.resources;

        // Health / Life Support / Power / Happiness meters
        const o2Fill = document.getElementById('hud-o2-fill');
        const pwrFill = document.getElementById('hud-power-fill');
        const intFill = document.getElementById('hud-integrity-fill');
        const hapFill = document.getElementById('hud-happiness-fill');

        const o2Val = document.getElementById('hud-o2-val');
        const pwrVal = document.getElementById('hud-power-val');
        const intVal = document.getElementById('hud-integrity-val');
        const hapVal = document.getElementById('hud-happiness-val');

        if (o2Fill) o2Fill.style.width = `${Math.floor(res.oxygen)}%`;
        if (pwrFill) pwrFill.style.width = `${Math.floor(res.power)}%`;
        if (intFill) intFill.style.width = `${Math.floor(res.integrity)}%`;
        if (hapFill) hapFill.style.width = `${Math.floor(res.happiness)}%`;

        if (o2Val) o2Val.textContent = `${Math.floor(res.oxygen)}%`;
        if (pwrVal) pwrVal.textContent = `${Math.floor(res.power)}%`;
        if (intVal) intVal.textContent = `${Math.floor(res.integrity)}%`;
        if (hapVal) hapVal.textContent = `${Math.floor(res.happiness)}%`;

        // Sol indicator
        const solVal = document.getElementById('hud-sol-val');
        if (solVal) solVal.textContent = `SOL ${this.missionDirector.currentCycle}`;

        // Level & XP
        const lvlVal = document.getElementById('hud-level-val');
        const credVal = document.getElementById('hud-credits-val');
        if (lvlVal) lvlVal.textContent = `LVL ${this.progression.level}`;
        if (credVal) credVal.textContent = `${this.progression.credits} ¢`;

        // Mission objective display
        const mission = this.missionDirector.getCurrentMission();
        const objBox = document.getElementById('hud-objective-text');
        if (objBox) {
            if (mission) {
                const activeObj = mission.objectives.find(o => !o.completed) || mission.objectives[0];
                objBox.innerHTML = `<strong>${mission.title}</strong><br>${activeObj.text}`;
            } else {
                objBox.innerHTML = `<strong>SURVIVAL SANDBOX</strong><br>Keep colony systems alive!`;
            }
        }

        // Prompt near interactable
        const promptEl = document.getElementById('hud-interact-prompt');
        if (promptEl) {
            const pPos = this.player.mesh.position;
            const npc = this.npcManager.getClosestNPC(pPos, 3.2);
            const prop = this.colonyBuildings.getClosestInteractable(pPos, 3.5);

            if (!window.inputController.isUIActive && (npc || prop)) {
                promptEl.classList.remove('hidden');
                promptEl.textContent = npc ? `Press [E] to Talk with ${npc.profile.name} (${npc.profile.profession})` : prop.prompt;
            } else {
                promptEl.classList.add('hidden');
            }
        }

        // Update Holographic Radar Mini-Map
        this.updateRadar();
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = Math.min(this.clock.getDelta(), 0.1);

        // 1. Update Physics & Entities
        this.player.update(delta);
        this.cameraController.update(delta);
        this.lightingCycle.update(delta);
        this.colonyBuildings.update(delta);
        this.marsTerrain.update(delta, this.player.mesh.position);
        this.particleManager.update(delta);
        this.npcManager.update(delta);
        this.pixelCompanion.update(delta);
        window.kernelAI.update(delta);

        // 2. OS Kernel & Story loop
        if (!this.isGameOver) {
            this.scheduler.update(delta);
            this.missionDirector.update(delta);
        }

        // 3. UI Renders
        this.updateHUD();
        this.kernelUI.render();

        // 4. Render 3D Scene
        this.renderer.render(this.scene, this.camera);

        // 5. Input frame reset
        window.inputController.update();
    }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
    window.game = new ColonyKernelGame();
});
