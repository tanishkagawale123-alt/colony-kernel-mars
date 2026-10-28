/**
 * COLONY KERNEL: MARS - Progression, Achievements & Postmortem Engine
 * Manages player leveling, credits, cosmetic unlocks, humorous achievements, and postmortem timeline.
 */

class ProgressionManager {
    constructor() {
        this.xp = 0;
        this.level = 1;
        this.credits = 100;

        this.achievements = [
            { id: 'first_boot', title: 'FIRST BOOT', desc: 'Survive your first Sol cycle on Mars.', unlocked: false, icon: '🚀' },
            { id: 'power_saver', title: 'POWER SAVER', desc: 'Prevent a major electrical grid collapse.', unlocked: false, icon: '⚡' },
            { id: 'oxygen_hero', title: 'OXYGEN HERO', desc: 'Prevent an oxygen life-support cascade.', unlocked: false, icon: '🫁' },
            { id: 'deadlock_breaker', title: 'DEADLOCK BREAKER', desc: 'Resolve a circular wait mutual exclusion deadlock.', unlocked: false, icon: '⛓️' },
            { id: 'master_scheduler', title: 'MASTER SCHEDULER', desc: 'Complete 10 critical colony processes without failure.', unlocked: false, icon: '⏱️' },
            { id: 'pixel_friend', title: 'PIXEL\'S BEST FRIEND', desc: 'Watch Pixel do a happy 360 victory spin dance.', unlocked: false, icon: '🤖' },
            { id: 'what_doing', title: 'WHAT ARE YOU DOING?', desc: 'Run into the perimeter boundary ridge or make a chaotic schedule.', unlocked: false, icon: '❓' },
            { id: 'touch_that', title: 'PLEASE DON\'T TOUCH THAT', desc: 'Interact with the central quantum core terminal.', unlocked: false, icon: '⚠️' }
        ];

        this.unlockedCosmetics = new Set(['default']);
    }

    addXP(amount) {
        this.xp += amount;
        const newLevel = Math.floor(Math.sqrt(this.xp / 40)) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            if (window.soundEngine) window.soundEngine.playSuccess();
            if (window.game) window.game.showToast(`LEVEL UP! You are now Level ${this.level} Colony Kernel Engineer!`, 'success');
        }
    }

    addCredits(amount) {
        this.credits += amount;
    }

    unlockAchievement(id) {
        const ach = this.achievements.find(a => a.id === id);
        if (ach && !ach.unlocked) {
            ach.unlocked = true;
            if (window.soundEngine) window.soundEngine.playSuccess();
            if (window.game) {
                window.game.showToast(`🏆 ACHIEVEMENT UNLOCKED: ${ach.title} — ${ach.desc}`, 'success');
            }
        }
    }

    renderPostmortem(isVictory, causeOfFailure = '') {
        const modal = document.getElementById('postmortem-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        window.inputController.isUIActive = true;

        const titleEl = document.getElementById('postmortem-title');
        const summaryEl = document.getElementById('postmortem-summary');
        const timelineEl = document.getElementById('postmortem-timeline');

        const g = window.game;
        const stats = {
            cycles: g.missionDirector.currentCycle,
            completedProcs: g.scheduler.completedProcesses.length,
            preemptions: g.scheduler.preemptionCount,
            cascadesSaved: g.scheduler.cascadeEngine.cascadesPrevented,
            happiness: Math.floor(g.scheduler.cascadeEngine.resources.happiness),
            level: this.level
        };

        if (isVictory) {
            titleEl.textContent = '🎉 MISSION ACCOMPLISHED: COLONY STABILIZED!';
            titleEl.className = 'postmortem-header victory-header';
            summaryEl.innerHTML = `
                <div class="stat-grid">
                    <div class="stat-card"><h3>${stats.cycles}</h3><p>SOLS SURVIVED</p></div>
                    <div class="stat-card"><h3>${stats.completedProcs}</h3><p>PROCESSES COMPLETED</p></div>
                    <div class="stat-card"><h3>${stats.preemptions}</h3><p>PREEMPTIONS</p></div>
                    <div class="stat-card"><h3>${stats.cascadesSaved}</h3><p>CASCADES PREVENTED</p></div>
                    <div class="stat-card"><h3>${stats.happiness}%</h3><p>COLONY HAPPINESS</p></div>
                </div>
                <div class="reveal-quote">
                    <blockquote>"YOU THOUGHT YOU WERE SAVING MARS.<br><strong>YOU WERE ACTUALLY SCHEDULING AN OPERATING SYSTEM.</strong>"</blockquote>
                    <p class="cite">— COLONY KERNEL // MARS 2089</p>
                </div>
            `;
        } else {
            titleEl.textContent = '⚠️ SYSTEM INTEGRITY FAILURE';
            titleEl.className = 'postmortem-header failure-header';
            summaryEl.innerHTML = `
                <div class="failure-reason-box">
                    <h4>ROOT CAUSE OF SYSTEM COLLAPSE:</h4>
                    <p>${causeOfFailure}</p>
                </div>
                <div class="stat-grid">
                    <div class="stat-card"><h3>${stats.cycles}</h3><p>SOLS REACHED</p></div>
                    <div class="stat-card"><h3>${stats.completedProcs}</h3><p>PROCESSES RUN</p></div>
                    <div class="stat-card"><h3>${stats.preemptions}</h3><p>PREEMPTIONS</p></div>
                    <div class="stat-card"><h3>${stats.happiness}%</h3><p>FINAL HAPPINESS</p></div>
                </div>
            `;
        }

        timelineEl.innerHTML = `
            <h4>DECISION TIMELINE & EVENT LOG</h4>
            <div class="timeline-step">1. Colony Kernel Boot Initialized on Core 01-04</div>
            <div class="timeline-step">2. Solar flux & Life-support processes registered in Process Queue</div>
            ${stats.preemptions > 0 ? `<div class="timeline-step">3. Preemption triggered ${stats.preemptions} times for critical process context-switching</div>` : ''}
            ${stats.cascadesSaved > 0 ? `<div class="timeline-step">4. Multi-sector cascading emergency successfully averted</div>` : ''}
            <div class="timeline-step">${isVictory ? '5. 12 Sols survived: All sectors stabilized at nominal operating parameters' : '5. Critical resource exhaustion led to life-support shutdown'}</div>
        `;
    }
}
