/**
 * COLONY KERNEL: MARS - Process Model
 * Represents an Operating System Process running in the Martian Colony Kernel.
 */

class ColonyProcess {
    constructor(config) {
        this.pid = config.pid || Math.floor(100 + Math.random() * 900);
        this.name = config.name || 'Worker Process';
        this.description = config.description || 'System maintenance task';
        this.category = config.category || 'General'; // 'LifeSupport', 'Power', 'Medical', 'Comms', 'Logistics'
        this.priority = config.priority || 'MEDIUM'; // 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'
        this.priorityLevel = this.getPriorityNumber(this.priority);

        this.cpuRequirement = config.cpuRequirement || 40; // 0-100%
        this.totalBurstTime = config.burstTime || 10.0; // seconds
        this.remainingTime = this.totalBurstTime;
        this.state = config.state || 'READY'; // 'READY', 'RUNNING', 'WAITING', 'BLOCKED', 'COMPLETED'
        this.assignedCore = null; // 1, 2, 3, 4

        this.requiredResources = config.requiredResources || []; // ['POWER', 'OXYGEN', 'WATER']
        this.heldResources = config.heldResources || [];
        this.waitingForResource = config.waitingForResource || null;

        this.preemptCount = 0;
        this.progress = 0; // 0 - 100%
        this.color = config.color || '#00f0ff';
    }

    getPriorityNumber(pri) {
        switch (pri) {
            case 'CRITICAL': return 4;
            case 'HIGH': return 3;
            case 'MEDIUM': return 2;
            case 'LOW': return 1;
            default: return 2;
        }
    }

    setPriority(newPri) {
        this.priority = newPri;
        this.priorityLevel = this.getPriorityNumber(newPri);
    }

    tickExecution(delta) {
        if (this.state !== 'RUNNING') return false;

        this.remainingTime -= delta;
        this.progress = Math.min(100, ((this.totalBurstTime - this.remainingTime) / this.totalBurstTime) * 100);

        if (this.remainingTime <= 0) {
            this.state = 'COMPLETED';
            this.progress = 100;
            return true; // Finished
        }
        return false;
    }
}
