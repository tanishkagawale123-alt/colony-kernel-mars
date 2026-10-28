/**
 * COLONY KERNEL: MARS - Kernel AI Assistant
 * Holographic AI that analyzes process scheduling, resource allocation, deadlocks, and gives real-time commentary.
 */

class KernelAI {
    constructor() {
        this.activeMessage = null;
        this.messageQueue = [];
        this.displayTimer = 0;
        this.container = null;
    }

    init() {
        this.container = document.getElementById('kernel-ai-dialogue');
    }

    say(text, mood = 'neutral', duration = 4.5) {
        this.messageQueue.push({ text, mood, duration });
        if (!this.activeMessage) {
            this.processNextMessage();
        }
    }

    processNextMessage() {
        if (this.messageQueue.length === 0) {
            this.activeMessage = null;
            if (this.container) this.container.classList.add('hidden');
            return;
        }

        this.activeMessage = this.messageQueue.shift();
        this.displayTimer = this.activeMessage.duration;

        if (this.container) {
            this.container.classList.remove('hidden');
            const textEl = this.container.querySelector('.kernel-text');
            const moodEl = this.container.querySelector('.kernel-avatar');

            if (textEl) textEl.textContent = this.activeMessage.text;
            if (moodEl) moodEl.setAttribute('data-mood', this.activeMessage.mood);

            if (window.soundEngine) window.soundEngine.playKernelVoice();
        }
    }

    // Reaction hooks based on OS gameplay events
    onGoodSchedule(processName) {
        const lines = [
            `Excellent dispatch. ${processName} is executing with optimal throughput.`,
            `Superb core balancing. That prevented an IO bottleneck.`,
            `CPU utilization stable at peak efficiency. Well done, Kernel.`
        ];
        this.say(lines[Math.floor(Math.random() * lines.length)], 'happy');
    }

    onBadSchedule(reason) {
        const lines = [
            `That was... not the optimal scheduling decision.`,
            `Scheduling low-priority batch jobs during life-support distress? Bold strategy.`,
            `CPU starvation detected on higher-priority threads. I respect your confidence.`,
            `Would you like to reconsider that core allocation?`
        ];
        this.say(lines[Math.floor(Math.random() * lines.length)], 'sarcastic');
    }

    onDeadlockDetected() {
        this.say(`CRITICAL: Deadlock detected! Two processes are waiting for mutex locks held by each other. Use TAB to resolve circular wait!`, 'warning', 6.0);
    }

    onDeadlockResolved() {
        this.say(`Deadlock broken! Resource dependency graph cycle eliminated. Systems resuming execution.`, 'happy', 5.0);
    }

    onPreemption(emergencyProcess) {
        this.say(`PREEMPTION INITIATED: Context-switching CPU core to ${emergencyProcess.name}. Prioritizing colony survival!`, 'urgent', 4.0);
    }

    onCascadeWarning(stepDescription) {
        this.say(`CASCADE IN PROGRESS: ${stepDescription}! Stabilize primary dependencies before total integrity failure!`, 'emergency', 5.5);
    }

    update(delta) {
        if (this.activeMessage) {
            this.displayTimer -= delta;
            if (this.displayTimer <= 0) {
                this.processNextMessage();
            }
        }
    }
}

window.kernelAI = new KernelAI();
