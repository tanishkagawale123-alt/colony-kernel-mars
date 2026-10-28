/**
 * COLONY KERNEL: MARS - Sound Engine
 * Procedural Web Audio API Synthesizer & SFX Engine
 * Zero external audio files required - 100% instant, responsive, and dynamic.
 */

class SoundEngine {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        this.isMuted = false;
        this.currentMood = 'calm'; // 'calm', 'tense', 'emergency', 'victory'
        this.musicInterval = null;
        this.stepCount = 0;
        this.isPlayingMusic = false;
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);

        this.startBackgroundMusic();
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMuted(muted) {
        this.isMuted = muted;
        if (this.masterGain) {
            this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
        }
    }

    setVolume(volume) {
        if (this.masterGain && !this.isMuted) {
            this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
        }
    }

    setMood(mood) {
        if (this.currentMood === mood) return;
        this.currentMood = mood;
    }

    // --- Procedural Synth Music Engine ---
    startBackgroundMusic() {
        if (this.isPlayingMusic) return;
        this.isPlayingMusic = true;

        const calmScale = [196.00, 220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // G pentatonic/dorian
        const tenseScale = [146.83, 155.56, 174.61, 196.00, 207.65, 233.08, 261.63]; // D phrygian
        const victoryScale = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25]; // C Major

        const bassNotesCalm = [98.00, 110.00, 130.81, 146.83];
        const bassNotesTense = [73.42, 82.41, 65.41, 87.31];

        this.musicInterval = setInterval(() => {
            if (!this.ctx || this.ctx.state === 'suspended' || this.isMuted) return;
            const now = this.ctx.currentTime;
            this.stepCount++;

            // Bass note every 8 beats
            if (this.stepCount % 8 === 0) {
                const bassScale = (this.currentMood === 'tense' || this.currentMood === 'emergency') 
                    ? bassNotesTense : bassNotesCalm;
                const note = bassScale[Math.floor(Math.random() * bassScale.length)];
                this.playDroneBass(note, 2.8);
            }

            // Lead Synth arpeggio
            let currentScale = calmScale;
            let noteDuration = 0.25;
            let detune = 0;

            if (this.currentMood === 'emergency') {
                currentScale = tenseScale;
                noteDuration = 0.12;
                detune = 5;
            } else if (this.currentMood === 'tense') {
                currentScale = tenseScale;
                noteDuration = 0.18;
            } else if (this.currentMood === 'victory') {
                currentScale = victoryScale;
                noteDuration = 0.2;
            }

            if (Math.random() > 0.25 || this.currentMood === 'emergency') {
                const noteIndex = Math.floor(Math.random() * currentScale.length);
                const freq = currentScale[noteIndex];
                this.playSynthNote(freq, noteDuration, detune);
            }

        }, 220);
    }

    playDroneBass(freq, duration) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, now);
        filter.Q.setValueAtTime(2, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    playSynthNote(freq, duration, detune = 0) {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(freq, now);
        osc2.frequency.setValueAtTime(freq + detune, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + duration);
        osc2.stop(now + duration);
    }

    // --- Sound Effects (SFX) ---

    playFootstep() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(80 + Math.random() * 30, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.08);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    playJump() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(450, now + 0.18);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.18);
    }

    playPixelBeep(type = 'happy') {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;

        if (type === 'happy') {
            const notes = [587.33, 880.00, 1174.66]; // D5, A5, D6
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, now + i * 0.06);

                gain.gain.setValueAtTime(0, now + i * 0.06);
                gain.gain.linearRampToValueAtTime(0.15, now + i * 0.06 + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.08);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + i * 0.06);
                osc.stop(now + i * 0.06 + 0.08);
            });
        } else if (type === 'danger' || type === 'worried') {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(650, now);
            osc.frequency.linearRampToValueAtTime(320, now + 0.2);

            gain.gain.setValueAtTime(0.18, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'dance') {
            const notes = [440, 554.37, 659.25, 880, 659.25, 880];
            notes.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, now + i * 0.07);

                gain.gain.setValueAtTime(0.08, now + i * 0.07);
                gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.07 + 0.06);

                osc.connect(gain);
                gain.connect(this.sfxGain);
                osc.start(now + i * 0.07);
                osc.stop(now + i * 0.07 + 0.06);
            });
        }
    }

    playKernelVoice() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750 + Math.random() * 200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.1);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.1);
    }

    playAlarm() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.setValueAtTime(440, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playPreemptionAlert() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(900, now + 0.08);
        osc.frequency.setValueAtTime(1200, now + 0.16);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.3);
    }

    playDeadlockBuzz() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
    }

    playClick() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.03);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.03);
    }

    playSuccess() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + i * 0.08);

            gain.gain.setValueAtTime(0.15, now + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

            osc.connect(gain);
            gain.connect(this.sfxGain);
            osc.start(now + i * 0.08);
            osc.stop(now + i * 0.08 + 0.25);
        });
    }

    playRepair() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.5));
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.setValueAtTime(3, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.15);
    }

    playLaserDefend() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.12);
    }

    playDroneThrust() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playWireSpark() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(1600, now);
        osc.frequency.setValueAtTime(2400, now + 0.03);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.09);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.09);
    }

    playWaveMatch() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.2);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.25);
    }

    playSortingDrop() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 0.06);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }

    playRadarPing() {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.08);
    }
}

window.soundEngine = new SoundEngine();
