/**
 * COLONY KERNEL: MARS - Kernel Holographic OS UI
 * Renders the full futuristic holographic interface (TAB menu) with 4-Core CPU Gantt,
 * Process queues, Deadlock visualizer, and System Log terminal.
 */

class KernelUI {
    constructor(scheduler) {
        this.scheduler = scheduler;
        this.isOpen = false;
        this.container = null;

        this.initDOM();
    }

    initDOM() {
        this.container = document.getElementById('kernel-os-modal');
    }

    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.container.classList.remove('hidden');
            window.inputController.isUIActive = true;
            if (window.soundEngine) window.soundEngine.playClick();
        } else {
            this.container.classList.add('hidden');
            window.inputController.isUIActive = false;
            if (window.soundEngine) window.soundEngine.playClick();
        }
    }

    render() {
        if (!this.isOpen || !this.container) return;

        // 1. Render 4 CPU Cores
        const coresContainer = document.getElementById('kernel-cpu-cores');
        if (coresContainer) {
            let coresHTML = '';
            this.scheduler.cores.forEach(core => {
                const proc = core.currentProcess;
                const load = core.load;
                const procName = proc ? `${proc.name} (PID ${proc.pid})` : '<span class="idle-txt">CORE IDLE</span>';
                const progress = proc ? Math.floor(proc.progress) : 0;
                const priClass = proc ? `pri-${proc.priority.toLowerCase()}` : '';

                coresHTML += `
                    <div class="cpu-core-card ${proc ? 'active' : ''}">
                        <div class="core-header">
                            <span class="core-name">CORE 0${core.id}</span>
                            <span class="core-load">${load}% LOAD</span>
                        </div>
                        <div class="core-process-info ${priClass}">${procName}</div>
                        <div class="core-progress-bar">
                            <div class="core-progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="core-actions">
                            ${proc ? `<button class="btn-os btn-preempt" onclick="window.game.scheduler.unassignCore(${core.id})">PREEMPT / HALT</button>` : `<span class="ready-badge">READY TO DISPATCH</span>`}
                        </div>
                    </div>
                `;
            });
            coresContainer.innerHTML = coresHTML;
        }

        // 2. Render Process Queue Table
        const procTable = document.getElementById('kernel-process-table-body');
        if (procTable) {
            let rowsHTML = '';
            this.scheduler.processes.forEach(p => {
                const priBadge = `<button class="badge pri-badge-${p.priority.toLowerCase()} btn-cycle-pri" title="Click to Alter Priority" onclick="window.game.cycleProcessPriority(${p.pid})">${p.priority} ↻</button>`;
                const stateBadge = `<span class="badge state-badge-${p.state.toLowerCase()}">${p.state}</span>`;
                const isRunning = p.state === 'RUNNING';

                let mutexInfo = '';
                if (p.heldResources && p.heldResources.length > 0) {
                    mutexInfo += ` <span class="tag-mutex" title="Held Mutex Lock">[HOLDS: ${p.heldResources.join(',')}]</span>`;
                }
                if (p.waitingForResource) {
                    mutexInfo += ` <span class="tag-waiting" title="Blocked waiting for Resource">[WAIT: ${p.waitingForResource}]</span>`;
                }

                rowsHTML += `
                    <tr class="${p.state === 'BLOCKED' ? 'row-deadlocked' : ''}">
                        <td><strong>${p.pid}</strong></td>
                        <td>${p.name}${mutexInfo}</td>
                        <td>${p.category}</td>
                        <td>${priBadge}</td>
                        <td>
                            <div class="mini-prog-bar"><div class="mini-prog-fill" style="width: ${Math.floor(p.progress)}%"></div></div>
                            <span class="prog-text">${Math.floor(p.progress)}%</span>
                        </td>
                        <td>${stateBadge}</td>
                        <td>
                            ${!isRunning ? `
                                <div class="dispatch-btn-group">
                                    <button class="btn-micro" onclick="window.game.scheduler.assignProcessToCore(${p.pid}, 1)">C1</button>
                                    <button class="btn-micro" onclick="window.game.scheduler.assignProcessToCore(${p.pid}, 2)">C2</button>
                                    <button class="btn-micro" onclick="window.game.scheduler.assignProcessToCore(${p.pid}, 3)">C3</button>
                                    <button class="btn-micro" onclick="window.game.scheduler.assignProcessToCore(${p.pid}, 4)">C4</button>
                                </div>
                            ` : `<span class="running-core-tag">RUNNING ON CORE 0${p.assignedCore}</span>`}
                            <button class="btn-micro btn-danger" onclick="window.game.scheduler.deadlockDetector.terminateProcess(${p.pid}, window.game.scheduler)">KILL</button>
                        </td>
                    </tr>
                `;
            });
            procTable.innerHTML = rowsHTML;
        }

        // 3. Render Deadlock Section
        const deadlockSection = document.getElementById('kernel-deadlock-status');
        if (deadlockSection) {
            const hasDl = this.scheduler.deadlockDetector.isDeadlockActive;
            const pids = Array.from(this.scheduler.deadlockDetector.deadlockedPids);

            if (hasDl) {
                deadlockSection.innerHTML = `
                    <div class="deadlock-alert-box">
                        <div class="dl-icon">⚠️</div>
                        <div class="dl-info">
                            <h4>CIRCULAR WAIT DEADLOCK DETECTED!</h4>
                            <p>Affected PIDs: [${pids.join(', ')}] holding mutually required mutex locks.</p>
                        </div>
                        <div class="dl-actions">
                            <button class="btn-os btn-resolve" onclick="window.game.resolveActiveDeadlock()">AUTO-BREAK CYCLE (KILL P1 & RESTART)</button>
                        </div>
                    </div>
                `;
            } else {
                deadlockSection.innerHTML = `
                    <div class="deadlock-clear-box">
                        <span class="dl-clear-icon">✓</span> Resource Allocation Graph Healthy (No Mutual Exclusion Cycles)
                    </div>
                `;
            }
        }

        // 4. Render Logs
        const logBox = document.getElementById('kernel-log-content');
        if (logBox) {
            logBox.innerHTML = this.scheduler.systemLogs.map(l => 
                `<div class="log-entry log-${l.type}"><span class="log-time">[${l.time}]</span> ${l.text}</div>`
            ).join('');
        }
    }
}
