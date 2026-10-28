/**
 * COLONY KERNEL: MARS - 4-Core CPU Process Scheduler
 * Implements Priority Preemption, Core Allocation, Context Switching, and Process Lifecycle.
 */

class CPUScheduler {
    constructor() {
        this.cores = [
            { id: 1, name: 'CORE 01', currentProcess: null, load: 0, history: [] },
            { id: 2, name: 'CORE 02', currentProcess: null, load: 0, history: [] },
            { id: 3, name: 'CORE 03', currentProcess: null, load: 0, history: [] },
            { id: 4, name: 'CORE 04', currentProcess: null, load: 0, history: [] }
        ];

        this.processes = [];
        this.completedProcesses = [];
        this.systemLogs = [];
        this.preemptionCount = 0;
        this.totalContextSwitches = 0;

        this.deadlockDetector = new DeadlockDetector();
        this.cascadeEngine = new CascadeEngine();

        this.spawnTimer = 0;
        this.nextPid = 200;

        this.initDefaultProcesses();
    }

    initDefaultProcesses() {
        const initialTasks = [
            { pid: 101, name: 'O2 Electrolysis Pump', category: 'LifeSupport', priority: 'HIGH', burstTime: 14.0, cpuRequirement: 45, requiredResources: ['POWER'] },
            { pid: 102, name: 'Solar Grid Inverter', category: 'Power', priority: 'HIGH', burstTime: 12.0, cpuRequirement: 35, requiredResources: ['POWER'] },
            { pid: 103, name: 'Hydroponics Irrigation', category: 'General', priority: 'MEDIUM', burstTime: 18.0, cpuRequirement: 25, requiredResources: ['WATER'] },
            { pid: 104, name: 'Rover Telemetry Uplink', category: 'Comms', priority: 'LOW', burstTime: 20.0, cpuRequirement: 20, requiredResources: ['POWER'] },
            { pid: 105, name: 'Bio-Bay Cryo-Monitor', category: 'Medical', priority: 'MEDIUM', burstTime: 15.0, cpuRequirement: 30, requiredResources: ['OXYGEN'] },
            { pid: 106, name: 'Cargo Bay Auto-Sorter', category: 'Logistics', priority: 'LOW', burstTime: 22.0, cpuRequirement: 20, requiredResources: [] }
        ];

        initialTasks.forEach(cfg => this.spawnProcess(cfg));
    }

    spawnProcess(config) {
        const proc = new ColonyProcess(config);
        this.processes.push(proc);
        this.logSystemEvent(`[KERNEL] New process spawned: PID ${proc.pid} [${proc.name}] Priority: ${proc.priority}`, 'info');
        return proc;
    }

    logSystemEvent(message, type = 'info') {
        const timeStr = new Date().toLocaleTimeString([], { hour12: false, minute: '2-digit', second: '2-digit' });
        this.systemLogs.unshift({ time: timeStr, text: message, type: type });
        if (this.systemLogs.length > 50) this.systemLogs.pop();
    }

    assignProcessToCore(pid, coreId) {
        const proc = this.processes.find(p => p.pid === pid);
        const core = this.cores.find(c => c.id === coreId);
        if (!proc || !core) return false;

        // If core is already running something, check preemption
        if (core.currentProcess && core.currentProcess.pid !== pid) {
            const runningProc = core.currentProcess;

            // Preempt the lower priority running process
            if (proc.priorityLevel >= runningProc.priorityLevel) {
                this.preemptProcess(runningProc, core);
            } else {
                this.logSystemEvent(`Cannot assign PID ${proc.pid} to Core ${coreId}: Lower priority than running PID ${runningProc.pid}`, 'warning');
                return false;
            }
        }

        // If process was assigned to another core, unbind it
        if (proc.assignedCore !== null && proc.assignedCore !== coreId) {
            this.cores[proc.assignedCore - 1].currentProcess = null;
        }

        core.currentProcess = proc;
        proc.assignedCore = coreId;
        proc.state = 'RUNNING';
        this.totalContextSwitches++;

        this.logSystemEvent(`PID ${proc.pid} [${proc.name}] dispatched to CORE 0${coreId}.`, 'success');
        if (window.soundEngine) window.soundEngine.playClick();
        if (window.kernelAI) window.kernelAI.onGoodSchedule(proc.name);

        // Story Mission Objective Checks
        if (window.game && window.game.missionDirector) {
            window.game.missionDirector.checkObjective('open_kernel');
            if (pid === 102) {
                window.game.missionDirector.checkObjective('dispatch_power');
            }
        }

        return true;
    }

    preemptProcess(proc, core) {
        proc.state = 'READY';
        proc.assignedCore = null;
        proc.preemptCount++;
        core.currentProcess = null;
        this.preemptionCount++;

        this.logSystemEvent(`[PREEMPTION] Context switch! PID ${proc.pid} [${proc.name}] preempted from CORE 0${core.id}. State saved.`, 'urgent');
        if (window.soundEngine) window.soundEngine.playPreemptionAlert();
        if (window.kernelAI) window.kernelAI.onPreemption(proc);
        if (window.game) {
            window.game.showToast(`PREEMPTION: PID ${proc.pid} halted for high-priority task!`, 'warning');
            if (window.game.missionDirector) {
                window.game.missionDirector.checkObjective('preempt_task');
            }
        }
    }

    unassignCore(coreId) {
        const core = this.cores.find(c => c.id === coreId);
        if (core && core.currentProcess) {
            const proc = core.currentProcess;
            proc.state = 'READY';
            proc.assignedCore = null;
            core.currentProcess = null;
            this.logSystemEvent(`CORE 0${coreId} halted. PID ${proc.pid} moved to READY queue.`, 'info');
        }
    }

    // Auto-schedule (priority first)
    autoDispatch() {
        const readyProcs = this.processes
            .filter(p => p.state === 'READY')
            .sort((a, b) => b.priorityLevel - a.priorityLevel);

        this.cores.forEach(core => {
            if (!core.currentProcess && readyProcs.length > 0) {
                const nextProc = readyProcs.shift();
                this.assignProcessToCore(nextProc.pid, core.id);
            }
        });
    }

    update(delta) {
        // 1. Process CPU core execution
        this.cores.forEach(core => {
            if (core.currentProcess) {
                const proc = core.currentProcess;
                core.load = proc.cpuRequirement;

                const isDone = proc.tickExecution(delta);
                if (isDone) {
                    this.logSystemEvent(`[COMPLETE] PID ${proc.pid} [${proc.name}] execution finished successfully!`, 'success');
                    if (window.soundEngine) window.soundEngine.playSuccess();

                    // Release resources & core
                    proc.heldResources = [];
                    core.currentProcess = null;
                    proc.assignedCore = null;

                    // Remove from active list and push to completed
                    const idx = this.processes.indexOf(proc);
                    if (idx !== -1) {
                        this.processes.splice(idx, 1);
                        this.completedProcesses.push(proc);
                    }

                    // Reward player
                    if (window.game) window.game.recordProcessCompleted(proc);
                }
            } else {
                core.load = 0;
            }
        });

        // 2. Deadlock Detection Check
        this.deadlockDetector.checkDeadlock(this.processes);

        // 3. Cascade Engine Update
        this.cascadeEngine.update(delta, this);

        // 4. Procedural Colony Process Generation (keep 3-6 ready processes active)
        this.spawnTimer += delta;
        const readyCount = this.processes.filter(p => p.state === 'READY').length;
        if ((this.spawnTimer >= 14.0 || readyCount < 2) && this.processes.length < 9) {
            this.spawnTimer = 0;
            this.spawnProceduralProcess();
        }
    }

    spawnProceduralProcess() {
        const pool = [
            { name: 'Atmospheric CO2 Scrubber', category: 'LifeSupport', priority: 'HIGH', burstTime: 16.0, cpuRequirement: 40, requiredResources: ['OXYGEN'] },
            { name: 'Thermal Radiator Loop', category: 'Power', priority: 'MEDIUM', burstTime: 14.0, cpuRequirement: 30, requiredResources: ['POWER'] },
            { name: 'Algae Bio-Reactor Flow', category: 'LifeSupport', priority: 'MEDIUM', burstTime: 18.0, cpuRequirement: 25, requiredResources: ['WATER'] },
            { name: 'Perimeter Radar Ping', category: 'Comms', priority: 'LOW', burstTime: 12.0, cpuRequirement: 15, requiredResources: [] },
            { name: 'Rover Battery Recondition', category: 'Power', priority: 'LOW', burstTime: 20.0, cpuRequirement: 20, requiredResources: ['POWER'] },
            { name: 'Cryo-Stasis Diagnostics', category: 'Medical', priority: 'HIGH', burstTime: 12.0, cpuRequirement: 35, requiredResources: ['OXYGEN'] },
            { name: 'Martian Soil Centrifuge', category: 'General', priority: 'LOW', burstTime: 22.0, cpuRequirement: 20, requiredResources: [] },
            { name: 'Deep-Space Telemetry Array', category: 'Comms', priority: 'MEDIUM', burstTime: 15.0, cpuRequirement: 25, requiredResources: ['POWER'] },
            { name: 'Habitat Pressure Equalizer', category: 'LifeSupport', priority: 'HIGH', burstTime: 14.0, cpuRequirement: 45, requiredResources: ['OXYGEN'] },
            { name: 'Automated Supply Drone Dispatch', category: 'Logistics', priority: 'LOW', burstTime: 16.0, cpuRequirement: 20, requiredResources: [] }
        ];

        const template = pool[Math.floor(Math.random() * pool.length)];
        this.nextPid = (this.nextPid || 300) + 1;
        return this.spawnProcess({
            pid: this.nextPid,
            name: template.name,
            category: template.category,
            priority: template.priority,
            burstTime: template.burstTime,
            cpuRequirement: template.cpuRequirement,
            requiredResources: template.requiredResources
        });
    }

    spawnCustomProcess(customName = null) {
        this.nextPid = (this.nextPid || 300) + 1;
        const name = customName || `Admin Task #0${this.nextPid % 100}`;
        const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
        const pri = priorities[Math.floor(Math.random() * priorities.length)];
        const categories = ['General', 'Power', 'LifeSupport', 'Comms', 'Medical'];
        const cat = categories[Math.floor(Math.random() * categories.length)];

        const proc = this.spawnProcess({
            pid: this.nextPid,
            name: name,
            category: cat,
            priority: pri,
            burstTime: 14.0,
            cpuRequirement: 30,
            requiredResources: cat === 'Power' ? ['POWER'] : (cat === 'LifeSupport' ? ['OXYGEN'] : [])
        });
        if (window.game) window.game.showToast(`Custom Process PID ${proc.pid} created!`, 'success');
        return proc;
    }

    injectDeadlockTest() {
        this.nextPid = (this.nextPid || 300) + 1;
        const pidA = this.nextPid;
        this.nextPid++;
        const pidB = this.nextPid;

        this.spawnProcess({
            pid: pidA,
            name: 'Reactor Aux Pump (Holding POWER, Needs O2)',
            category: 'Power',
            priority: 'HIGH',
            burstTime: 25.0,
            heldResources: ['POWER'],
            waitingForResource: 'OXYGEN',
            state: 'BLOCKED'
        });

        this.spawnProcess({
            pid: pidB,
            name: 'O2 Cryo Scrubber (Holding O2, Needs POWER)',
            category: 'LifeSupport',
            priority: 'HIGH',
            burstTime: 25.0,
            heldResources: ['OXYGEN'],
            waitingForResource: 'POWER',
            state: 'BLOCKED'
        });

        if (window.game) window.game.showToast('⚠️ Synthetic Deadlock Injected (RAG Cycle)', 'warning');
    }
}
