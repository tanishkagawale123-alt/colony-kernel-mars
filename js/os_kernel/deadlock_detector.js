/**
 * COLONY KERNEL: MARS - Deadlock Detector & Resolution Engine
 * Analyzes Resource Allocation Graphs (RAG) for circular wait cycles and provides recovery tools.
 */

class DeadlockDetector {
    constructor() {
        this.deadlockedPids = new Set();
        this.lastCheckTime = 0;
        this.isDeadlockActive = false;
    }

    checkDeadlock(processes, resources) {
        // Build adjacency list for Resource Allocation Graph
        // Process -> Resource (Requested / Waiting)
        // Resource -> Process (Held by)
        const adj = new Map();
        const allNodes = new Set();

        processes.forEach(p => {
            if (p.state === 'BLOCKED' || p.state === 'WAITING' || p.state === 'RUNNING') {
                const pNode = `P_${p.pid}`;
                allNodes.add(pNode);
                if (!adj.has(pNode)) adj.set(pNode, []);

                // If waiting for resource
                if (p.waitingForResource) {
                    const rNode = `R_${p.waitingForResource}`;
                    allNodes.add(rNode);
                    adj.get(pNode).push(rNode);
                }

                // If holding resources
                p.heldResources.forEach(res => {
                    const rNode = `R_${res}`;
                    allNodes.add(rNode);
                    if (!adj.has(rNode)) adj.set(rNode, []);
                    adj.get(rNode).push(pNode);
                });
            }
        });

        // Cycle Detection via DFS (Tarjan's / standard DFS cycle detection)
        const visited = new Set();
        const recStack = new Set();
        const deadlockedNodes = new Set();

        const isCyclic = (node) => {
            visited.add(node);
            recStack.add(node);

            const neighbors = adj.get(node) || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (isCyclic(neighbor)) {
                        deadlockedNodes.add(node);
                        return true;
                    }
                } else if (recStack.has(neighbor)) {
                    deadlockedNodes.add(node);
                    deadlockedNodes.add(neighbor);
                    return true;
                }
            }

            recStack.delete(node);
            return false;
        };

        allNodes.forEach(node => {
            if (!visited.has(node)) {
                isCyclic(node);
            }
        });

        // Extract affected PIDs
        const newDeadlockedPids = new Set();
        deadlockedNodes.forEach(node => {
            if (node.startsWith('P_')) {
                const pid = parseInt(node.replace('P_', ''));
                newDeadlockedPids.add(pid);
                const proc = processes.find(p => p.pid === pid);
                if (proc && proc.state !== 'COMPLETED') {
                    proc.state = 'BLOCKED';
                }
            }
        });

        const wasDeadlocked = this.isDeadlockActive;
        this.deadlockedPids = newDeadlockedPids;
        this.isDeadlockActive = this.deadlockedPids.size > 0;

        if (this.isDeadlockActive && !wasDeadlocked) {
            if (window.soundEngine) window.soundEngine.playDeadlockBuzz();
            if (window.kernelAI) window.kernelAI.onDeadlockDetected();
            if (window.game) {
                window.game.showToast('ALERT: Deadlock Detected! Open Kernel OS [TAB] to Resolve', 'error');
                if (window.game.missionDirector) {
                    window.game.missionDirector.checkObjective('detect_deadlock');
                }
            }
        } else if (!this.isDeadlockActive && wasDeadlocked) {
            if (window.soundEngine) window.soundEngine.playSuccess();
            if (window.kernelAI) window.kernelAI.onDeadlockResolved();
            if (window.game) {
                window.game.showToast('SUCCESS: Deadlock Resolved!', 'success');
                window.game.recordDeadlockResolved();
            }
        }

        return {
            hasDeadlock: this.isDeadlockActive,
            deadlockedPids: Array.from(this.deadlockedPids)
        };
    }

    // --- Deadlock Resolution Actions ---

    terminateProcess(pid, scheduler) {
        const proc = scheduler.processes.find(p => p.pid === pid);
        if (!proc) return false;

        // Release all held resources
        proc.heldResources = [];
        proc.waitingForResource = null;
        proc.state = 'COMPLETED';

        // Unassign from core if running
        if (proc.assignedCore !== null) {
            scheduler.cores[proc.assignedCore - 1].currentProcess = null;
            proc.assignedCore = null;
        }

        scheduler.logSystemEvent(`SIGKILL executed on PID ${pid} (${proc.name}). Mutex resources released.`, 'warning');
        if (window.soundEngine) window.soundEngine.playRepair();
        return true;
    }

    releaseResource(pid, resourceName, scheduler) {
        const proc = scheduler.processes.find(p => p.pid === pid);
        if (!proc) return false;

        const idx = proc.heldResources.indexOf(resourceName);
        if (idx !== -1) {
            proc.heldResources.splice(idx, 1);
            scheduler.logSystemEvent(`Mutex [${resourceName}] manually released from PID ${pid}.`, 'info');
            if (window.soundEngine) window.soundEngine.playSuccess();
            return true;
        }
        return false;
    }

    reprioritize(pid, newPriority, scheduler) {
        const proc = scheduler.processes.find(p => p.pid === pid);
        if (!proc) return false;

        proc.setPriority(newPriority);
        scheduler.logSystemEvent(`PID ${pid} priority altered to ${newPriority}.`, 'info');
        return true;
    }

    restartProcess(pid, scheduler) {
        const proc = scheduler.processes.find(p => p.pid === pid);
        if (!proc) return false;

        proc.remainingTime = proc.totalBurstTime;
        proc.progress = 0;
        proc.state = 'READY';
        proc.heldResources = [];
        proc.waitingForResource = null;
        scheduler.logSystemEvent(`PID ${pid} restarted to clean READY state.`, 'info');
        return true;
    }
}
