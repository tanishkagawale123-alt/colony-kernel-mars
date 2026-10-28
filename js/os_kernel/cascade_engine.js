/**
 * COLONY KERNEL: MARS - Cascade Failure & Colony Economy Engine
 * Simulates cause-and-effect cascade chains, resource depletion, and colony happiness.
 */

class CascadeEngine {
    constructor() {
        this.resources = {
            power: 85,      // %
            oxygen: 92,     // %
            water: 80,      // %
            food: 88,       // %
            integrity: 100, // %
            happiness: 75   // %
        };

        this.activeCascade = null;
        this.cascadeStage = 0;
        this.cascadeTimer = 0;
        this.cascadesPrevented = 0;
        this.cascadeHistory = [];
    }

    triggerCascadeScenario(type) {
        // type = 'power_failure', 'o2_leak', 'solar_flare', 'comms_collapse'
        this.activeCascade = {
            type: type,
            name: this.getCascadeName(type),
            step: 1,
            maxSteps: 4,
            timer: 15.0, // seconds before advancing to next catastrophic step
            resolved: false
        };

        if (window.soundEngine) {
            window.soundEngine.playAlarm();
            window.soundEngine.setMood('emergency');
        }

        if (window.lightingCycle) window.lightingCycle.setEmergency(true);
        if (window.npcManager) window.npcManager.setColonyState('panic');
        if (window.pixelCompanion) window.pixelCompanion.setMood('danger');

        const stepMsg = this.getCascadeStepDescription(type, 1);
        if (window.kernelAI) window.kernelAI.onCascadeWarning(stepMsg);
        if (window.game) window.game.showToast(`EMERGENCY CASCADE: ${stepMsg}`, 'error');
    }

    getCascadeName(type) {
        switch (type) {
            case 'power_failure': return 'Total Power Grid Collapse';
            case 'o2_leak': return 'Life Support Depressurization Cascade';
            case 'solar_flare': return 'Solar Flare Radiation Overload';
            default: return 'Cascading Multi-System Anomaly';
        }
    }

    getCascadeStepDescription(type, step) {
        if (type === 'power_failure') {
            if (step === 1) return 'Main Power Substation Tripped (Power declining)';
            if (step === 2) return 'Oxygen Plant Offline (O2 Depleting rapidly!)';
            if (step === 3) return 'Medical Cryo-Pods Overheating (NPC Panic)';
            if (step === 4) return 'Colony Life Support Breach Imminent!';
        } else if (type === 'o2_leak') {
            if (step === 1) return 'Sub-Sector 3 O2 Main Line Ruptured';
            if (step === 2) return 'Atmospheric Pressure Collapsing';
            if (step === 3) return 'Oxygen Scrubbers Failing Under Load';
            if (step === 4) return 'Asphyxiation Hazard Across Central Dome!';
        }
        return 'Multi-core OS Resource Exhaustion';
    }

    resolveCascade() {
        if (!this.activeCascade) return;

        this.activeCascade.resolved = true;
        this.activeCascade = null;
        this.cascadesPrevented++;

        // Restore environment
        if (window.soundEngine) {
            window.soundEngine.playSuccess();
            window.soundEngine.setMood('victory');
        }
        if (window.lightingCycle) window.lightingCycle.setEmergency(false);
        if (window.npcManager) window.npcManager.setColonyState('celebrate');
        if (window.pixelCompanion) window.pixelCompanion.setMood('dance');

        this.resources.happiness = Math.min(100, this.resources.happiness + 20);
        this.resources.integrity = Math.min(100, this.resources.integrity + 15);

        if (window.kernelAI) window.kernelAI.say('Brilliant recovery, Kernel! Cascade neutralized. Colony systems stabilizing.', 'happy');
        if (window.game) {
            window.game.showToast('CASCADE PREVENTED! Colony Systems Restored (+Happiness)', 'success');
            window.game.triggerCelebration();
            if (window.game.missionDirector) {
                window.game.missionDirector.checkObjective('stop_cascade');
            }
        }
    }

    update(delta, scheduler) {
        // Natural resource consumption & production
        let powerDrain = 0.5;
        let o2Drain = 0.4;

        // Check Mission 05 stabilization objective
        if (this.resources.happiness >= 80 && this.resources.integrity >= 90) {
            if (window.game && window.game.missionDirector) {
                window.game.missionDirector.checkObjective('stabilize_colony');
            }
        }

        // Active running processes generate positive resource effects
        if (scheduler) {
            scheduler.cores.forEach(core => {
                const proc = core.currentProcess;
                if (proc) {
                    if (proc.category === 'Power') this.resources.power = Math.min(100, this.resources.power + 3.0 * delta);
                    if (proc.category === 'LifeSupport') this.resources.oxygen = Math.min(100, this.resources.oxygen + 3.0 * delta);
                    if (proc.category === 'Medical') this.resources.integrity = Math.min(100, this.resources.integrity + 2.0 * delta);
                }
            });
        }

        // Apply Cascade Degeneration
        if (this.activeCascade) {
            this.activeCascade.timer -= delta;

            if (this.activeCascade.type === 'power_failure') {
                this.resources.power = Math.max(0, this.resources.power - 5.0 * delta);
                if (this.resources.power < 30) {
                    this.resources.oxygen = Math.max(0, this.resources.oxygen - 4.5 * delta);
                }
            } else if (this.activeCascade.type === 'o2_leak') {
                this.resources.oxygen = Math.max(0, this.resources.oxygen - 6.0 * delta);
            }

            // Check if resources have recovered enough to automatically break cascade
            if (this.resources.power > 60 && this.resources.oxygen > 60) {
                this.resolveCascade();
                return;
            }

            // Advance cascade stage if timer expires
            if (this.activeCascade.timer <= 0) {
                this.activeCascade.step++;
                this.activeCascade.timer = 12.0;

                if (this.activeCascade.step > this.activeCascade.maxSteps) {
                    // Critical integrity failure
                    this.resources.integrity = Math.max(0, this.resources.integrity - 15.0 * delta);
                } else {
                    const desc = this.getCascadeStepDescription(this.activeCascade.type, this.activeCascade.step);
                    if (window.kernelAI) window.kernelAI.onCascadeWarning(desc);
                    if (window.game) window.game.showToast(`CASCADE ADVANCING: ${desc}`, 'error');
                }
            }
        }

        // Apply health penalty if O2 or Power hits 0
        if (this.resources.oxygen < 15 || this.resources.power < 10) {
            this.resources.integrity = Math.max(0, this.resources.integrity - 3.5 * delta);
            this.resources.happiness = Math.max(0, this.resources.happiness - 4.0 * delta);
        }

        // Check loss condition
        if (this.resources.integrity <= 0) {
            if (window.game && !window.game.isGameOver) {
                window.game.triggerSystemFailure('Total Colony Integrity Loss due to uncontained Cascade Failure');
            }
        }
    }
}
