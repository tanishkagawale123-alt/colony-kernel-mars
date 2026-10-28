/**
 * COLONY KERNEL: MARS - Story Missions & Survival Progression
 * Implements 5 structured story missions and the 12-Sol survival sandbox.
 */

class MissionDirector {
    constructor() {
        this.currentMissionIndex = 0;
        this.missions = [
            {
                id: 'm1',
                title: 'MISSION 01: FIRST BOOT',
                description: 'Explore the Martian base, meet Pixel and Maya, and dispatch your first process to Core 01.',
                objectives: [
                    { id: 'move', text: 'Move around with WASD and jump with Space', completed: false },
                    { id: 'talk_maya', text: 'Talk to Lead Engineer Maya [E]', completed: false },
                    { id: 'open_kernel', text: 'Open Kernel OS [TAB] and dispatch a process to Core 01', completed: false }
                ],
                rewardXP: 100,
                rewardCredits: 50
            },
            {
                id: 'm2',
                title: 'MISSION 02: POWER CRISIS',
                description: 'A Martian dust storm has degraded solar capture. Schedule power processes and calibrate the solar array.',
                objectives: [
                    { id: 'dispatch_power', text: 'Dispatch Power Grid Balancer (PID 102) to Core 02', completed: false },
                    { id: 'solar_minigame', text: 'Align Solar Array Panels at the Power Sector [E]', completed: false },
                    { id: 'talk_arjun', text: 'Talk to Power Engineer Arjun [E]', completed: false }
                ],
                rewardXP: 150,
                rewardCredits: 75
            },
            {
                id: 'm3',
                title: 'MISSION 03: OXYGEN EMERGENCY & PREEMPTION',
                description: 'A sudden life-support pressure drop requires immediate CPU attention! Preempt a low-priority task.',
                objectives: [
                    { id: 'preempt_task', text: 'Preempt / Halt a running task to context-switch to Emergency O2', completed: false },
                    { id: 'seal_o2_pipes', text: 'Complete Oxygen Pipe Valve alignment puzzle [E]', completed: false },
                    { id: 'talk_lena', text: 'Report to Medical Officer Lena [E]', completed: false }
                ],
                rewardXP: 200,
                rewardCredits: 100
            },
            {
                id: 'm4',
                title: 'MISSION 04: THE DEADLOCK',
                description: 'Two critical subsystems are trapped in a circular-wait mutual exclusion deadlock. Break the cycle!',
                objectives: [
                    { id: 'detect_deadlock', text: 'Observe Deadlock Detection alert in Kernel OS [TAB]', completed: false },
                    { id: 'resolve_deadlock', text: 'Break the circular wait using SIGKILL or Auto-Break in Kernel OS', completed: false }
                ],
                rewardXP: 250,
                rewardCredits: 150
            },
            {
                id: 'm5',
                title: 'MISSION 05: THE GREAT CASCADE',
                description: 'Solar flare radiation triggers simultaneous multi-system cascading failures. Balance all 4 cores and save Mars!',
                objectives: [
                    { id: 'stop_cascade', text: 'Prevent cascading integrity failure across Power and Oxygen', completed: false },
                    { id: 'stabilize_colony', text: 'Achieve 80%+ Colony Happiness & 90%+ Integrity', completed: false }
                ],
                rewardXP: 400,
                rewardCredits: 300
            }
        ];

        this.currentCycle = 1;
        this.maxCyclesToWin = 12;
        this.cycleTimer = 0;
        this.cycleDuration = 60.0; // 60s per Sol
    }

    getCurrentMission() {
        if (this.currentMissionIndex < this.missions.length) {
            return this.missions[this.currentMissionIndex];
        }
        return null; // Freeplay sandbox
    }

    checkObjective(objId) {
        const mission = this.getCurrentMission();
        if (!mission) return;

        const obj = mission.objectives.find(o => o.id === objId);
        if (obj && !obj.completed) {
            obj.completed = true;
            if (window.soundEngine) window.soundEngine.playSuccess();
            if (window.game) window.game.showToast(`OBJECTIVE COMPLETE: ${obj.text}`, 'success');

            // Check if all objectives in current mission are done
            const allDone = mission.objectives.every(o => o.completed);
            if (allDone) {
                this.completeCurrentMission();
            }
        }
    }

    completeCurrentMission() {
        const mission = this.getCurrentMission();
        if (!mission) return;

        if (window.game) {
            window.game.addXP(mission.rewardXP);
            window.game.addCredits(mission.rewardCredits);
            window.game.triggerCelebration();
            window.game.showToast(`MISSION COMPLETED: ${mission.title}!`, 'success');
        }

        this.currentMissionIndex++;

        // Trigger special scenario for next mission
        if (this.currentMissionIndex === 1) {
            // Mission 2: Trigger dust storm
            if (window.lightingCycle) window.lightingCycle.setDustStorm(true);
            if (window.particleManager) window.particleManager.setDustStormIntensity(true);
        } else if (this.currentMissionIndex === 2) {
            // Mission 3: Spawn emergency O2 process
            if (window.game) {
                window.game.scheduler.spawnProcess({
                    pid: 911,
                    name: 'CRITICAL: O2 Atmospheric Injection',
                    category: 'LifeSupport',
                    priority: 'CRITICAL',
                    burstTime: 10.0,
                    cpuRequirement: 65,
                    requiredResources: ['OXYGEN']
                });
                window.game.scheduler.cascadeEngine.triggerCascadeScenario('o2_leak');
            }
        } else if (this.currentMissionIndex === 3) {
            // Mission 4: Inject synthetic Deadlock
            if (window.game) {
                const pA = window.game.scheduler.spawnProcess({
                    pid: 401,
                    name: 'Reactor Aux Pump (Holds Power, Needs O2)',
                    category: 'Power',
                    priority: 'HIGH',
                    burstTime: 20.0,
                    heldResources: ['POWER'],
                    waitingForResource: 'OXYGEN',
                    state: 'BLOCKED'
                });
                const pB = window.game.scheduler.spawnProcess({
                    pid: 402,
                    name: 'O2 Cryo Scrubber (Holds O2, Needs Power)',
                    category: 'LifeSupport',
                    priority: 'HIGH',
                    burstTime: 20.0,
                    heldResources: ['OXYGEN'],
                    waitingForResource: 'POWER',
                    state: 'BLOCKED'
                });
            }
        } else if (this.currentMissionIndex === 4) {
            // Mission 5: The Great Cascade
            if (window.game) {
                window.game.scheduler.cascadeEngine.triggerCascadeScenario('power_failure');
            }
        }
    }

    update(delta) {
        // Sol cycle advancement
        this.cycleTimer += delta;
        if (this.cycleTimer >= this.cycleDuration) {
            this.cycleTimer = 0;
            this.currentCycle++;

            if (window.game) {
                window.game.showToast(`SOL ${this.currentCycle} BEGUN on Mars.`, 'info');
                window.game.scheduler.cascadeEngine.resources.happiness = Math.min(100, window.game.scheduler.cascadeEngine.resources.happiness + 5);
            }

            // Check 12-Sol Win Condition
            if (this.currentCycle >= this.maxCyclesToWin && !window.game.isGameWon) {
                window.game.triggerGameVictory();
            }
        }
    }
}
