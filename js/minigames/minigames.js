/**
 * COLONY KERNEL: MARS - 10 Interactive Mini-Games
 * Implements Oxygen Pipe, Solar Align, Rover Race, Robot Repair, Memory Matrix,
 * Hydroponics, Cargo Sorting, Drone Delivery, Meteor Dodge, and Signal Synthesizer.
 */

class MiniGameManager {
    constructor() {
        this.activeGame = null;
        this.modal = null;
        this.canvas = null;
        this.ctx = null;
        this.gameLoopId = null;

        this.initDOM();
    }

    initDOM() {
        this.modal = document.getElementById('minigame-modal');
        this.canvas = document.getElementById('minigame-canvas');
        if (this.canvas) this.ctx = this.canvas.getContext('2d');
    }

    launch(gameId) {
        if (!this.modal) return;
        this.activeGame = gameId;
        this.modal.classList.remove('hidden');
        window.inputController.isUIActive = true;

        if (window.soundEngine) window.soundEngine.playClick();

        const titleEl = document.getElementById('minigame-title');
        const descEl = document.getElementById('minigame-desc');
        const container = document.getElementById('minigame-custom-container');

        if (container) container.innerHTML = '';

        switch (gameId) {
            case 'oxygen_pipe':
                titleEl.textContent = 'Life Support: Oxygen Pipe Valve Alignment';
                descEl.textContent = 'Click pipe tiles to rotate them and create an unbroken flow from SOURCE to LIFE SUPPORT!';
                this.initOxygenPipeGame(container);
                break;

            case 'solar_align':
                titleEl.textContent = 'Power Grid: Dual-Axis Solar Calibration';
                descEl.textContent = 'Adjust Azimuth and Elevation sliders to align the solar panels with the Martian Sun (Aim for 95%+ Efficiency)!';
                this.initSolarAlignGame(container);
                break;

            case 'memory_matrix':
                titleEl.textContent = 'Bio-Diagnostics: OS Memory Paging Matrix';
                descEl.textContent = 'Watch the flashing RAM sectors and repeat the exact allocation sequence!';
                this.initMemoryMatrixGame(container);
                break;

            case 'robot_repair':
                titleEl.textContent = 'Robotics: Logic Gate Wire Patch';
                descEl.textContent = 'Click the matching color nodes on the left and right to rewire the robot circuit!';
                this.initRobotRepairGame(container);
                break;

            case 'rover_race':
                titleEl.textContent = 'Robotics Garage: Mars Rover Rally Simulation';
                descEl.textContent = 'Steer the rover with [A] and [D] (or Left/Right Arrows) to collect telemetry beacons and avoid craters!';
                this.initRoverRaceGame(container);
                break;

            case 'hydro_farm':
                titleEl.textContent = 'Hydroponics: Crop Nutrient Synthesizer';
                descEl.textContent = 'Balance Nitrogen, Phosphorus, and Moisture sliders to hit the optimal biological equilibrium zone!';
                this.initHydroFarmGame(container);
                break;

            case 'cargo_sort':
                titleEl.textContent = 'Logistics: Priority Queue Cargo Dispatcher';
                descEl.textContent = 'Quickly sort cargo boxes into HIGH (Red), MEDIUM (Yellow), or LOW (Blue) priority buffers!';
                this.initCargoSortGame(container);
                break;

            case 'drone_delivery':
                titleEl.textContent = 'Logistics: Drone Wind Navigation';
                descEl.textContent = 'Use Arrow Keys / buttons to guide the supply drone safely to the landing pad!';
                this.initDroneDeliveryGame(container);
                break;

            case 'meteor_dodge':
                titleEl.textContent = 'Arcade: Meteor Shield Defense';
                descEl.textContent = 'Move your defense shield left and right to deflect incoming Martian meteorites!';
                this.initMeteorDodgeGame(container);
                break;

            case 'comms_signal':
                titleEl.textContent = 'Comms Array: Earth Uplink Frequency Synthesizer';
                descEl.textContent = 'Adjust Frequency and Amplitude sliders until your blue signal wave matches the red Earth beacon!';
                this.initCommsSignalGame(container);
                break;
        }
    }

    close() {
        if (this.gameLoopId) cancelAnimationFrame(this.gameLoopId);
        this.gameLoopId = null;
        this.activeGame = null;
        if (this.modal) this.modal.classList.add('hidden');
        window.inputController.isUIActive = false;
        if (window.soundEngine) window.soundEngine.playClick();
    }

    completeMiniGame(success = true, xpReward = 50, creditsReward = 30) {
        const gameId = this.activeGame;
        this.close();
        if (success) {
            if (window.soundEngine) window.soundEngine.playSuccess();
            if (window.game) {
                window.game.addXP(xpReward);
                window.game.addCredits(creditsReward);
                window.game.scheduler.cascadeEngine.resources.happiness = Math.min(100, window.game.scheduler.cascadeEngine.resources.happiness + 10);
                window.game.showToast(`ACTIVITY COMPLETE! +${xpReward} XP, +${creditsReward} Credits (+Happiness)`, 'success');

                if (window.game.missionDirector) {
                    if (gameId === 'solar_align') {
                        window.game.missionDirector.checkObjective('solar_minigame');
                    } else if (gameId === 'oxygen_pipe') {
                        window.game.missionDirector.checkObjective('seal_o2_pipes');
                    }
                }
            }
            if (window.pixelCompanion) window.pixelCompanion.setMood('dance');
        }
    }

    // --- 1. Oxygen Pipe Puzzle ---
    initOxygenPipeGame(container) {
        // Pipe types: 'straight' (N-S), 'corner' (N-E), 't' (N-E-S), 'cross'
        // Base directions: 0:North, 1:East, 2:South, 3:West
        const tileTypes = [
            ['corner', 'straight', 'corner'],
            ['straight', 't', 'straight'],
            ['corner', 'straight', 'straight']
        ];
        // Solvable target rotations:
        // (0,0) with rot 1 connects West(3) and South(2) -> inlet from west enters
        // (1,0) with rot 0 connects North(0) and South(2)
        // (2,0) with rot 0 connects North(0) and East(1)
        // (2,1) with rot 1 connects West(3) and East(1)
        // (2,2) with rot 1 connects West(3) and East(1) -> exits to East!
        const currentRotations = [
            [2, 1, 3],
            [1, 2, 0],
            [3, 0, 2]
        ];

        const getTileConnections = (r, c) => {
            const type = tileTypes[r][c];
            const rot = currentRotations[r][c];
            let base = [];
            if (type === 'straight') base = [0, 2]; // N, S
            else if (type === 'corner') base = [0, 1]; // N, E
            else if (type === 't') base = [0, 1, 2]; // N, E, S
            else if (type === 'cross') base = [0, 1, 2, 3];
            return base.map(d => (d + rot) % 4);
        };

        const renderGrid = (activeCells = new Set()) => {
            let html = `
                <div class="pipe-board">
                    <div class="pipe-endpoints">
                        <span class="pipe-inlet">◄ O2 SOURCE INLET</span>
                        <span class="pipe-outlet">LIFE SUPPORT OUTLET ►</span>
                    </div>
                    <div class="pipe-grid">
            `;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    const rot = currentRotations[r][c] * 90;
                    const type = tileTypes[r][c];
                    const isFlow = activeCells.has(`${r},${c}`);
                    html += `
                        <div class="pipe-tile ${isFlow ? 'flow-active' : ''}" onclick="window.game.miniGames.rotatePipe(${r}, ${c})">
                            <div style="width:100%; height:100%; position:relative; transform: rotate(${rot}deg)">
                                ${type === 'straight' ? `
                                    <div class="pipe-segment pipe-seg-v"></div>
                                    <div class="pipe-core pipe-seg-v" style="width:8px; left:38px;"></div>
                                ` : ''}
                                ${type === 'corner' ? `
                                    <div class="pipe-segment pipe-seg-v" style="height:55%; top:0;"></div>
                                    <div class="pipe-segment pipe-seg-h" style="width:55%; left:45%;"></div>
                                    <div class="pipe-segment pipe-seg-center"></div>
                                    <div class="pipe-core" style="width:8px; height:45px; left:38px; top:0;"></div>
                                    <div class="pipe-core" style="height:8px; width:45px; left:38px; top:38px;"></div>
                                ` : ''}
                                ${type === 't' ? `
                                    <div class="pipe-segment pipe-seg-v"></div>
                                    <div class="pipe-segment pipe-seg-h" style="width:55%; left:45%;"></div>
                                    <div class="pipe-segment pipe-seg-center"></div>
                                    <div class="pipe-core pipe-seg-v" style="width:8px; left:38px;"></div>
                                    <div class="pipe-core" style="height:8px; width:45px; left:38px; top:38px;"></div>
                                ` : ''}
                            </div>
                        </div>
                    `;
                }
            }
            html += `
                    </div>
                    <div class="mg-action-bar">
                        <button class="btn-os" onclick="window.game.miniGames.checkPipeVictory()">ENGAGE O2 PRESSURE</button>
                    </div>
                </div>
            `;
            container.innerHTML = html;
        };

        this.rotatePipe = (r, c) => {
            currentRotations[r][c] = (currentRotations[r][c] + 1) % 4;
            if (window.soundEngine) window.soundEngine.playClick();
            renderGrid();
        };

        this.checkPipeVictory = () => {
            // BFS from (0,0) entering from West (direction 3)
            // Opposite directions: 0(N)<->2(S), 1(E)<->3(W)
            const opp = [2, 3, 0, 1];
            const dr = [-1, 0, 1, 0];
            const dc = [0, 1, 0, -1];

            const visited = new Set();
            const queue = [];

            // Does (0,0) accept connection from West (3)?
            const startConns = getTileConnections(0, 0);
            if (startConns.includes(3)) {
                queue.push({ r: 0, c: 0, fromDir: 3 });
                visited.add(`0,0`);
            }

            let reachedEnd = false;

            while (queue.length > 0) {
                const curr = queue.shift();
                const conns = getTileConnections(curr.r, curr.c);

                if (curr.r === 2 && curr.c === 2 && conns.includes(1)) {
                    reachedEnd = true;
                    break;
                }

                for (const outDir of conns) {
                    if (outDir === curr.fromDir) continue; // don't go backwards
                    const nr = curr.r + dr[outDir];
                    const nc = curr.c + dc[outDir];

                    if (nr >= 0 && nr < 3 && nc >= 0 && nc < 3) {
                        const nextConns = getTileConnections(nr, nc);
                        const requiredEntry = opp[outDir];
                        if (nextConns.includes(requiredEntry) && !visited.has(`${nr},${nc}`)) {
                            visited.add(`${nr},${nc}`);
                            queue.push({ r: nr, c: nc, fromDir: requiredEntry });
                        }
                    }
                }
            }

            if (reachedEnd) {
                renderGrid(visited);
                if (window.soundEngine) window.soundEngine.playSuccess();
                if (window.game) window.game.showToast('PRESSURE SEALED! Oxygen flowing to Life Support.', 'success');
                setTimeout(() => this.completeMiniGame(true, 70, 45), 600);
            } else {
                if (window.soundEngine) window.soundEngine.playAlarm();
                if (window.game) window.game.showToast('LEAK DETECTED! Conduit broken. Check all 9 pipe joints.', 'error');
            }
        };

        renderGrid();
    }

    // --- 2. Solar Align Game ---
    initSolarAlignGame(container) {
        let azimuth = 25;
        let elevation = 15;
        const targetAzimuth = 68;
        const targetElevation = 52;

        const render = () => {
            const azDiff = Math.abs(azimuth - targetAzimuth);
            const elDiff = Math.abs(elevation - targetElevation);
            const eff = Math.max(5, Math.floor(100 - (azDiff * 1.25 + elDiff * 1.35)));
            const watts = Math.floor(eff * 50);

            container.innerHTML = `
                <div class="slider-puzzle-box">
                    <canvas id="solar-radar-canvas" width="360" height="150" style="background:#09101f; border-radius:8px; border:1px solid rgba(0,240,255,0.3); margin:0 auto;"></canvas>
                    <div class="solar-gauge">
                        <div class="gauge-fill" style="width: ${eff}%; background: ${eff >= 92 ? '#00ff88' : (eff > 60 ? '#ffaa00' : '#ef4444')}"></div>
                    </div>
                    <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.95rem;">
                        <span style="color:${eff >= 92 ? '#00ff88' : '#ffaa00'}">SOLAR EFFICIENCY: ${eff}%</span>
                        <span style="color:var(--cyan-neon)">OUTPUT: ${watts} W / 5000 W</span>
                    </div>
                    <div class="slider-group">
                        <label>Azimuth Tracking Angle: ${azimuth}° (Target: ~${targetAzimuth}°)</label>
                        <input type="range" min="0" max="100" value="${azimuth}" oninput="window.game.miniGames.updateSolar(this.value, null)">
                    </div>
                    <div class="slider-group">
                        <label>Elevation Tilt Angle: ${elevation}° (Target: ~${targetElevation}°)</label>
                        <input type="range" min="0" max="100" value="${elevation}" oninput="window.game.miniGames.updateSolar(null, this.value)">
                    </div>
                    <button class="btn-os" ${eff >= 92 ? '' : 'disabled'} style="${eff >= 92 ? 'border-color:#00ff88; box-shadow:0 0 15px #00ff88;' : ''}" onclick="window.game.miniGames.completeMiniGame(true, 60, 40)">
                        ${eff >= 92 ? '⚡ LOCK SOLAR TRACKING (OPTIMAL)' : 'CALIBRATING TRACKING... (AIM FOR 92%+)'}
                    </button>
                </div>
            `;

            // Draw 2D Solar Radar
            const cv = document.getElementById('solar-radar-canvas');
            if (cv) {
                const ctx = cv.getContext('2d');
                ctx.clearRect(0, 0, 360, 150);

                // Grid circles
                ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(180, 75, 55, 0, Math.PI * 2);
                ctx.arc(180, 75, 30, 0, Math.PI * 2);
                ctx.stroke();

                // Target Sun (Golden)
                const sunAngle = (targetAzimuth / 100) * Math.PI * 2 - Math.PI / 2;
                const sunDist = (targetElevation / 100) * 50;
                const sunX = 180 + Math.cos(sunAngle) * sunDist;
                const sunY = 75 + Math.sin(sunAngle) * sunDist;

                ctx.fillStyle = '#ffaa00';
                ctx.shadowColor = '#ffaa00';
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(sunX, sunY, 10, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Player Array Vector (Cyan Panel)
                const pAngle = (azimuth / 100) * Math.PI * 2 - Math.PI / 2;
                const pDist = (elevation / 100) * 50;
                const pX = 180 + Math.cos(pAngle) * pDist;
                const pY = 75 + Math.sin(pAngle) * pDist;

                ctx.strokeStyle = '#00f0ff';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.moveTo(180, 75);
                ctx.lineTo(pX, pY);
                ctx.stroke();

                ctx.fillStyle = '#00f0ff';
                ctx.fillRect(pX - 12, pY - 5, 24, 10);
            }
        };

        this.updateSolar = (az, el) => {
            if (az !== null) azimuth = parseInt(az);
            if (el !== null) elevation = parseInt(el);
            render();
        };

        render();
    }

    // --- 3. Memory Matrix ---
    initMemoryMatrixGame(container) {
        let currentRound = 1;
        const totalRounds = 2;
        let sequence = [];
        let playerStep = 0;
        let isShowing = true;
        const freqs = [261.63, 329.63, 392.00, 523.25];

        const startRound = (rnd) => {
            currentRound = rnd;
            playerStep = 0;
            isShowing = true;
            sequence = [];
            const len = rnd === 1 ? 3 : 4;
            for (let i = 0; i < len; i++) {
                sequence.push(Math.floor(Math.random() * 4));
            }

            container.innerHTML = `
                <div style="font-weight:800; color:var(--cyan-neon); font-size:1rem; margin-bottom:10px;">
                    DIAGNOSTIC ROUND ${currentRound} OF ${totalRounds}
                </div>
                <div class="memory-grid">
                    <button class="mem-tile" id="mem-tile-0" style="border-color:#00f0ff" onclick="window.game.miniGames.clickMemTile(0)">RAM 00<br><small style="color:#00f0ff">SECTOR A</small></button>
                    <button class="mem-tile" id="mem-tile-1" style="border-color:#a855f7" onclick="window.game.miniGames.clickMemTile(1)">RAM 01<br><small style="color:#a855f7">SECTOR B</small></button>
                    <button class="mem-tile" id="mem-tile-2" style="border-color:#f59e0b" onclick="window.game.miniGames.clickMemTile(2)">RAM 02<br><small style="color:#f59e0b">SECTOR C</small></button>
                    <button class="mem-tile" id="mem-tile-3" style="border-color:#10b981" onclick="window.game.miniGames.clickMemTile(3)">RAM 03<br><small style="color:#10b981">SECTOR D</small></button>
                </div>
                <div id="mem-status" class="status-msg">MEMORIZE MEMORY ALLOCATION SEQUENCE...</div>
            `;

            let seqIndex = 0;
            setTimeout(() => {
                const playSeq = setInterval(() => {
                    if (seqIndex < sequence.length) {
                        const tileId = sequence[seqIndex];
                        const el = document.getElementById(`mem-tile-${tileId}`);
                        if (el) {
                            el.classList.add('flash');
                            if (window.soundEngine) window.soundEngine.playSynthNote(freqs[tileId], 0.25);
                            setTimeout(() => el.classList.remove('flash'), 300);
                        }
                        seqIndex++;
                    } else {
                        clearInterval(playSeq);
                        isShowing = false;
                        const st = document.getElementById('mem-status');
                        if (st) st.textContent = 'YOUR TURN: REPEAT RAM SEQUENCE';
                    }
                }, 550);
            }, 600);
        };

        this.clickMemTile = (i) => {
            if (isShowing) return;
            if (window.soundEngine) window.soundEngine.playSynthNote(freqs[i], 0.18);

            const el = document.getElementById(`mem-tile-${i}`);
            if (el) {
                el.classList.add('flash');
                setTimeout(() => el.classList.remove('flash'), 180);
            }

            if (i === sequence[playerStep]) {
                playerStep++;
                if (playerStep === sequence.length) {
                    if (currentRound < totalRounds) {
                        const st = document.getElementById('mem-status');
                        if (st) st.textContent = 'SECTOR VERIFIED! ADVANCING TO NEXT BUFFER...';
                        setTimeout(() => startRound(currentRound + 1), 800);
                    } else {
                        this.completeMiniGame(true, 75, 50);
                    }
                }
            } else {
                const st = document.getElementById('mem-status');
                if (st) st.textContent = 'PAGE FAULT DETECTED! Replaying round...';
                if (window.soundEngine) window.soundEngine.playAlarm();
                setTimeout(() => startRound(currentRound), 1000);
            }
        };

        startRound(1);
    }

    // --- 4. Robot Repair Wire Game ---
    initRobotRepairGame(container) {
        const colors = [
            { id: 0, name: 'RED', hex: '#ef4444' },
            { id: 1, name: 'CYAN', hex: '#00f0ff' },
            { id: 2, name: 'GOLD', hex: '#f59e0b' },
            { id: 3, name: 'GREEN', hex: '#10b981' }
        ];
        const rightOrder = [2, 0, 3, 1]; // Shuffled right ports
        const connectedPairs = new Map(); // leftIdx -> rightIdx
        let selectedLeft = null;

        container.innerHTML = `
            <div class="wire-game-container">
                <canvas id="wire-canvas" width="480" height="260"></canvas>
                <div class="wire-column" id="wire-left-col">
                    ${colors.map((c, i) => `
                        <div class="wire-node" id="wire-left-${i}" style="background:${c.hex}" onclick="window.game.miniGames.selectLeftWire(${i})">
                            BUS 0${i+1} [${c.name}]
                        </div>
                    `).join('')}
                </div>
                <div class="wire-column" id="wire-right-col">
                    ${rightOrder.map((colorIdx, rIdx) => {
                        const c = colors[colorIdx];
                        return `
                            <div class="wire-node" id="wire-right-${rIdx}" style="background:${c.hex}" onclick="window.game.miniGames.connectRightWire(${rIdx})">
                                LOGIC 0${rIdx+1} [${c.name}]
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
            <div id="wire-status-text" style="margin-top:12px; font-weight:800; color:var(--cyan-neon);">
                Click a BUS port on the left, then click its matching color LOGIC port on the right.
            </div>
        `;

        const redrawWires = () => {
            const cv = document.getElementById('wire-canvas');
            if (!cv) return;
            const ctx = cv.getContext('2d');
            ctx.clearRect(0, 0, cv.width, cv.height);

            connectedPairs.forEach((rIdx, lIdx) => {
                const lEl = document.getElementById(`wire-left-${lIdx}`);
                const rEl = document.getElementById(`wire-right-${rIdx}`);
                if (lEl && rEl) {
                    const lBox = lEl.getBoundingClientRect();
                    const rBox = rEl.getBoundingClientRect();
                    const pBox = cv.getBoundingClientRect();

                    const x1 = lBox.right - pBox.left;
                    const y1 = lBox.top + lBox.height / 2 - pBox.top;
                    const x2 = rBox.left - pBox.left;
                    const y2 = rBox.top + rBox.height / 2 - pBox.top;

                    ctx.strokeStyle = colors[lIdx].hex;
                    ctx.lineWidth = 4;
                    ctx.shadowColor = colors[lIdx].hex;
                    ctx.shadowBlur = 10;
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.bezierCurveTo((x1 + x2) / 2, y1, (x1 + x2) / 2, y2, x2, y2);
                    ctx.stroke();
                    ctx.shadowBlur = 0;
                }
            });
        };

        this.selectLeftWire = (idx) => {
            if (connectedPairs.has(idx)) return;
            selectedLeft = idx;
            document.querySelectorAll('.wire-node').forEach(n => n.classList.remove('selected'));
            const el = document.getElementById(`wire-left-${idx}`);
            if (el) el.classList.add('selected');
            if (window.soundEngine) window.soundEngine.playClick();
        };

        this.connectRightWire = (rIdx) => {
            if (selectedLeft === null) return;
            const targetColorId = rightOrder[rIdx];

            if (selectedLeft === targetColorId) {
                // Correct match!
                connectedPairs.set(selectedLeft, rIdx);
                const lEl = document.getElementById(`wire-left-${selectedLeft}`);
                const rEl = document.getElementById(`wire-right-${rIdx}`);
                if (lEl) lEl.classList.add('connected');
                if (rEl) rEl.classList.add('connected');

                if (window.soundEngine) window.soundEngine.playWireSpark();
                redrawWires();
                selectedLeft = null;
                document.querySelectorAll('.wire-node').forEach(n => n.classList.remove('selected'));

                if (connectedPairs.size === 4) {
                    const st = document.getElementById('wire-status-text');
                    if (st) st.innerHTML = '<span style="color:#00ff88">CIRCUIT INTEGRITY 100%! LOGIC REPAIRED.</span>';
                    setTimeout(() => this.completeMiniGame(true, 65, 40), 700);
                }
            } else {
                // Wrong wire
                if (window.soundEngine) window.soundEngine.playAlarm();
                if (window.game) window.game.showToast('CIRCUIT MISMATCH: Colors must match!', 'error');
            }
        };

        setTimeout(redrawWires, 50);
    }

    // --- 5. Rover Race ---
    initRoverRaceGame(container) {
        container.innerHTML = `
            <div class="rover-sim-box">
                <canvas id="rover-canvas" width="400" height="250"></canvas>
                <div class="rover-controls">
                    <button class="btn-micro" onclick="window.game.miniGames.roverSteer(-1)">◄ STEER LEFT [A]</button>
                    <button class="btn-micro" onclick="window.game.miniGames.roverSteer(1)">STEER RIGHT [D] ►</button>
                </div>
                <div id="rover-score" style="font-weight:800; font-size:1.05rem; color:var(--cyan-neon);">
                    DISTANCE: 0m / 100m | SPEED: 48 km/h
                </div>
            </div>
        `;

        const canvas = document.getElementById('rover-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let roverX = 200;
        let dist = 0;
        let items = []; // { x, y, type: 'rock' | 'data' }

        this.roverSteer = (dir) => {
            roverX = Math.max(35, Math.min(365, roverX + dir * 35));
        };

        const keyHandler = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.roverSteer(-1);
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.roverSteer(1);
        };
        window.addEventListener('keydown', keyHandler);

        let itemSpawnTimer = 0;

        const loop = () => {
            if (!this.modal || this.modal.classList.contains('hidden')) {
                window.removeEventListener('keydown', keyHandler);
                return;
            }

            ctx.fillStyle = '#7a2810';
            ctx.fillRect(0, 0, 400, 250);

            // Terrain Dunes
            ctx.fillStyle = '#66200c';
            for (let i = 0; i < 5; i++) {
                const y = (Date.now() * 0.15 + i * 50) % 250;
                ctx.fillRect(0, y, 400, 12);
            }

            // Road track lines
            ctx.strokeStyle = 'rgba(255, 140, 60, 0.35)';
            ctx.lineWidth = 4;
            ctx.strokeRect(40, -10, 320, 270);

            // Spawn obstacles / beacons
            itemSpawnTimer++;
            if (itemSpawnTimer > 35) {
                itemSpawnTimer = 0;
                items.push({
                    x: 60 + Math.random() * 280,
                    y: -20,
                    type: Math.random() > 0.4 ? 'data' : 'rock'
                });
            }

            // Update & Draw Items
            for (let i = items.length - 1; i >= 0; i--) {
                const it = items[i];
                it.y += 3.5;

                if (it.type === 'data') {
                    ctx.fillStyle = '#ffd700';
                    ctx.shadowColor = '#ffd700';
                    ctx.shadowBlur = 8;
                    ctx.beginPath();
                    ctx.arc(it.x, it.y, 8, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.shadowBlur = 0;
                } else {
                    ctx.fillStyle = '#220804';
                    ctx.fillRect(it.x - 12, it.y - 12, 24, 24);
                }

                // Check collision with Rover (rover at x: roverX, y: 190)
                if (Math.abs(it.x - roverX) < 24 && Math.abs(it.y - 190) < 24) {
                    if (it.type === 'data') {
                        dist += 8;
                        if (window.soundEngine) window.soundEngine.playSuccess();
                    } else {
                        dist = Math.max(0, dist - 6);
                        if (window.soundEngine) window.soundEngine.playAlarm();
                    }
                    items.splice(i, 1);
                } else if (it.y > 270) {
                    items.splice(i, 1);
                }
            }

            // Rover Mesh
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(roverX - 18, 175, 36, 45);
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(roverX - 14, 185, 28, 14); // Windshield
            // Wheels
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(roverX - 22, 178, 6, 12);
            ctx.fillRect(roverX + 16, 178, 6, 12);
            ctx.fillRect(roverX - 22, 204, 6, 12);
            ctx.fillRect(roverX + 16, 204, 6, 12);

            dist += 0.45;
            const sc = document.getElementById('rover-score');
            if (sc) sc.textContent = `DISTANCE: ${Math.floor(dist)}m / 100m | SPEED: 52 km/h`;

            if (dist >= 100) {
                window.removeEventListener('keydown', keyHandler);
                this.completeMiniGame(true, 85, 55);
                return;
            }

            this.gameLoopId = requestAnimationFrame(loop);
        };
        loop();
    }

    // --- 6. Hydroponics Farm ---
    initHydroFarmGame(container) {
        let nitrogen = 40;
        let phosphorus = 65;
        let hydration = 50;

        const render = () => {
            const nDiff = Math.abs(nitrogen - 65);
            const pDiff = Math.abs(phosphorus - 45);
            const hDiff = Math.abs(hydration - 80);
            const eq = Math.max(10, Math.floor(100 - (nDiff * 1.2 + pDiff * 1.4 + hDiff * 1.3)));

            container.innerHTML = `
                <div class="slider-puzzle-box">
                    <div style="font-weight:800; font-size:1.1rem; color:${eq >= 88 ? '#00ff88' : '#ffaa00'}">
                        NUTRIENT EQUILIBRIUM: ${eq}% ${eq >= 88 ? '✓ [OPTIMAL BIOME]' : '⚠ [ADJUST SLIDERS]'}
                    </div>
                    <div class="solar-gauge">
                        <div class="gauge-fill" style="width: ${eq}%; background: ${eq >= 88 ? '#00ff88' : '#f59e0b'}"></div>
                    </div>
                    <div class="slider-group">
                        <label>Nitrogen (N) Fertilizer: ${nitrogen}% (Optimal Target: 65%)</label>
                        <input type="range" min="0" max="100" value="${nitrogen}" oninput="window.game.miniGames.updateHydro(this.value, null, null)">
                    </div>
                    <div class="slider-group">
                        <label>Phosphorus (P) Synthesis: ${phosphorus}% (Optimal Target: 45%)</label>
                        <input type="range" min="0" max="100" value="${phosphorus}" oninput="window.game.miniGames.updateHydro(null, this.value, null)">
                    </div>
                    <div class="slider-group">
                        <label>Hydration & Moisture: ${hydration}% (Optimal Target: 80%)</label>
                        <input type="range" min="0" max="100" value="${hydration}" oninput="window.game.miniGames.updateHydro(null, null, this.value)">
                    </div>
                    <button class="btn-os" ${eq >= 88 ? '' : 'disabled'} style="${eq >= 88 ? 'border-color:#00ff88; box-shadow:0 0 15px #00ff88;' : ''}" onclick="window.game.miniGames.completeMiniGame(true, 60, 40)">
                        ${eq >= 88 ? '🌱 INJECT OPTIMAL NUTRIENT MIX' : 'BALANCE LEVELS INTO EQUILIBRIUM'}
                    </button>
                </div>
            `;
        };

        this.updateHydro = (n, p, h) => {
            if (n !== null) nitrogen = parseInt(n);
            if (p !== null) phosphorus = parseInt(p);
            if (h !== null) hydration = parseInt(h);
            render();
        };

        render();
    }

    // --- 7. Cargo Sort ---
    initCargoSortGame(container) {
        const queue = [
            { title: 'Liquid Oxygen Tanks', desc: 'Critical life-support booster for Hab Central', priority: 'HIGH' },
            { title: 'Auxiliary Solar Panel Bolts', desc: 'Standard hardware spares for field technicians', priority: 'LOW' },
            { title: 'Hydroponic Seed Matrix', desc: 'Fresh crop genetic strains for Greenhouses', priority: 'MEDIUM' },
            { title: 'Emergency Cryo Coolant', desc: 'Urgent replacement for Bio-Bay stasis chillers', priority: 'HIGH' },
            { title: 'Crew Audio Discs & Movies', desc: 'Recreational morale delivery package', priority: 'LOW' },
            { title: 'Power Capacitor Replacements', desc: 'Grid stabilizing components for Substation', priority: 'MEDIUM' }
        ];

        let currentIndex = 0;

        const render = () => {
            if (currentIndex >= queue.length) {
                this.completeMiniGame(true, 70, 45);
                return;
            }

            const item = queue[currentIndex];
            container.innerHTML = `
                <div class="cargo-conveyor-box">
                    <div style="font-weight:800; color:var(--cyan-neon);">CARGO DISPATCHER: ITEM ${currentIndex + 1} OF ${queue.length}</div>
                    <div class="cargo-crate-card">
                        <div class="crate-title">${item.title}</div>
                        <div class="crate-desc">${item.desc}</div>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">DISPATCH TO CORRECT PRIORITY QUEUE [HOTKEYS 1, 2, 3]:</div>
                    <div class="cargo-bins-row">
                        <button class="btn-cargo-bin bin-high" onclick="window.game.miniGames.sortCargo('HIGH')">[1] HIGH PRIORITY</button>
                        <button class="btn-cargo-bin bin-med" onclick="window.game.miniGames.sortCargo('MEDIUM')">[2] MEDIUM PRIORITY</button>
                        <button class="btn-cargo-bin bin-low" onclick="window.game.miniGames.sortCargo('LOW')">[3] LOW PRIORITY</button>
                    </div>
                </div>
            `;
        };

        this.sortCargo = (chosen) => {
            const currentItem = queue[currentIndex];
            if (chosen === currentItem.priority) {
                if (window.soundEngine) window.soundEngine.playSortingDrop();
                currentIndex++;
                render();
            } else {
                if (window.soundEngine) window.soundEngine.playAlarm();
                if (window.game) window.game.showToast(`MISROUTED! "${currentItem.title}" belongs in ${currentItem.priority} priority!`, 'error');
            }
        };

        const keyHandler = (e) => {
            if (e.code === 'Digit1') this.sortCargo('HIGH');
            if (e.code === 'Digit2') this.sortCargo('MEDIUM');
            if (e.code === 'Digit3') this.sortCargo('LOW');
        };
        window.addEventListener('keydown', keyHandler);

        const originalClose = this.close.bind(this);
        this.close = () => {
            window.removeEventListener('keydown', keyHandler);
            originalClose();
        };

        render();
    }

    // --- 8. Drone Delivery ---
    initDroneDeliveryGame(container) {
        container.innerHTML = `
            <div class="drone-flight-box">
                <canvas id="drone-canvas" width="380" height="220"></canvas>
                <div class="flight-telemetry">
                    <span id="drone-alt">ALTITUDE: 150m</span>
                    <span id="drone-speed" style="color:#00ff88">DESCENT: 1.2 m/s</span>
                    <span id="drone-wind">WIND: +1.5 m/s ◄</span>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-micro" onclick="window.game.miniGames.droneThrustLeft()">◄ STABILIZE LEFT [A]</button>
                    <button class="btn-micro" onclick="window.game.miniGames.droneThrustUp()">▲ VERTICAL THRUST [W]</button>
                    <button class="btn-micro" onclick="window.game.miniGames.droneThrustRight()">STABILIZE RIGHT [D] ►</button>
                </div>
            </div>
        `;

        const cv = document.getElementById('drone-canvas');
        if (!cv) return;
        const ctx = cv.getContext('2d');

        let droneX = 190;
        let droneY = 20;
        let vx = 0;
        let vy = 1.0;
        let wind = (Math.random() - 0.5) * 1.5;

        this.droneThrustLeft = () => { vx -= 0.8; if (window.soundEngine) window.soundEngine.playDroneThrust(); };
        this.droneThrustRight = () => { vx += 0.8; if (window.soundEngine) window.soundEngine.playDroneThrust(); };
        this.droneThrustUp = () => { vy = Math.max(-1.5, vy - 0.9); if (window.soundEngine) window.soundEngine.playDroneThrust(); };

        const keyHandler = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.droneThrustLeft();
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.droneThrustRight();
            if (e.code === 'KeyW' || e.code === 'Space' || e.code === 'ArrowUp') this.droneThrustUp();
        };
        window.addEventListener('keydown', keyHandler);

        const loop = () => {
            if (!this.modal || this.modal.classList.contains('hidden')) {
                window.removeEventListener('keydown', keyHandler);
                return;
            }

            // Physics
            vy += 0.04; // gravity
            vx += wind * 0.02;
            droneX += vx;
            droneY += vy;

            // Render
            ctx.fillStyle = '#060a16';
            ctx.fillRect(0, 0, 380, 220);

            // Landing Pad at bottom (center 190, width 100, height 14)
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(140, 200, 100, 16);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 3;
            ctx.strokeRect(140, 200, 100, 16);
            ctx.fillStyle = '#f59e0b';
            ctx.font = 'bold 12px monospace';
            ctx.fillText('H-PAD', 175, 212);

            // Draw Drone
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(droneX - 16, droneY - 8, 32, 16);
            // Rotor blades
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(droneX - 22, droneY - 12, 12, 4);
            ctx.fillRect(droneX + 10, droneY - 12, 12, 4);

            // Telemetry text
            const alt = Math.max(0, Math.floor((200 - droneY) * 0.8));
            const altEl = document.getElementById('drone-alt');
            const spdEl = document.getElementById('drone-speed');
            if (altEl) altEl.textContent = `ALTITUDE: ${alt}m`;
            if (spdEl) {
                const spd = Math.abs(vy * 1.5).toFixed(1);
                spdEl.textContent = `DESCENT: ${spd} m/s`;
                spdEl.style.color = vy < 2.0 ? '#00ff88' : '#ef4444';
            }

            // Landing check
            if (droneY >= 195) {
                window.removeEventListener('keydown', keyHandler);
                if (droneX >= 135 && droneX <= 245 && vy <= 2.2) {
                    if (window.soundEngine) window.soundEngine.playSuccess();
                    if (window.game) window.game.showToast('TOUCHDOWN CONFIRMED! Supplies delivered.', 'success');
                    this.completeMiniGame(true, 75, 50);
                } else {
                    if (window.soundEngine) window.soundEngine.playAlarm();
                    if (window.game) window.game.showToast('HARD TOUCHDOWN / MISSED PAD! Re-engaging autopilot...', 'error');
                    setTimeout(() => this.initDroneDeliveryGame(container), 900);
                }
                return;
            }

            this.gameLoopId = requestAnimationFrame(loop);
        };
        loop();
    }

    // --- 9. Meteor Dodge ---
    initMeteorDodgeGame(container) {
        container.innerHTML = `
            <div class="meteor-arcade-box">
                <canvas id="meteor-canvas" width="380" height="230"></canvas>
                <div style="display:flex; justify-content:space-between; width:380px; font-weight:800; font-size:0.9rem;">
                    <span id="meteor-score" style="color:#00ff88">METEORS INTERCEPTED: 0 / 8</span>
                    <span style="color:#a855f7">DOME SHIELD: 100%</span>
                </div>
                <div style="display:flex; gap:10px;">
                    <button class="btn-micro" onclick="window.game.miniGames.meteorMoveTurret(-25)">◄ MOVE SHIELD [A]</button>
                    <button class="btn-micro" onclick="window.game.miniGames.meteorFire()">⚡ FIRE LASER [SPACE]</button>
                    <button class="btn-micro" onclick="window.game.miniGames.meteorMoveTurret(25)">MOVE SHIELD [D] ►</button>
                </div>
            </div>
        `;

        const cv = document.getElementById('meteor-canvas');
        if (!cv) return;
        const ctx = cv.getContext('2d');

        let turretX = 190;
        let meteors = [];
        let lasers = [];
        let score = 0;
        let spawnTimer = 0;

        this.meteorMoveTurret = (dx) => {
            turretX = Math.max(30, Math.min(350, turretX + dx));
        };

        this.meteorFire = () => {
            lasers.push({ x: turretX, y: 200 });
            if (window.soundEngine) window.soundEngine.playLaserDefend();
        };

        const keyHandler = (e) => {
            if (e.code === 'KeyA' || e.code === 'ArrowLeft') this.meteorMoveTurret(-25);
            if (e.code === 'KeyD' || e.code === 'ArrowRight') this.meteorMoveTurret(25);
            if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') this.meteorFire();
        };
        window.addEventListener('keydown', keyHandler);

        const loop = () => {
            if (!this.modal || this.modal.classList.contains('hidden')) {
                window.removeEventListener('keydown', keyHandler);
                return;
            }

            ctx.fillStyle = '#060914';
            ctx.fillRect(0, 0, 380, 230);

            // Stars
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(50, 40, 2, 2);
            ctx.fillRect(280, 70, 2, 2);
            ctx.fillRect(150, 110, 2, 2);

            // Spawn Meteors
            spawnTimer++;
            if (spawnTimer > 40) {
                spawnTimer = 0;
                meteors.push({
                    x: 30 + Math.random() * 320,
                    y: -10,
                    speed: 1.8 + Math.random() * 1.5,
                    size: 8 + Math.random() * 8
                });
            }

            // Update lasers
            for (let i = lasers.length - 1; i >= 0; i--) {
                const l = lasers[i];
                l.y -= 7;
                ctx.fillStyle = '#00f0ff';
                ctx.shadowColor = '#00f0ff';
                ctx.shadowBlur = 8;
                ctx.fillRect(l.x - 2, l.y, 4, 12);
                ctx.shadowBlur = 0;

                // Check collision with meteors
                for (let j = meteors.length - 1; j >= 0; j--) {
                    const m = meteors[j];
                    if (Math.abs(l.x - m.x) < m.size + 4 && Math.abs(l.y - m.y) < m.size + 4) {
                        score++;
                        meteors.splice(j, 1);
                        lasers.splice(i, 1);
                        const scEl = document.getElementById('meteor-score');
                        if (scEl) scEl.textContent = `METEORS INTERCEPTED: ${score} / 8`;
                        if (score >= 8) {
                            window.removeEventListener('keydown', keyHandler);
                            this.completeMiniGame(true, 80, 50);
                            return;
                        }
                        break;
                    }
                }
                if (l.y < -20) lasers.splice(i, 1);
            }

            // Update meteors
            for (let i = meteors.length - 1; i >= 0; i--) {
                const m = meteors[i];
                m.y += m.speed;

                ctx.fillStyle = '#d97706';
                ctx.shadowColor = '#ef4444';
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                if (m.y > 240) meteors.splice(i, 1);
            }

            // Draw Colony Dome Energy Barrier
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(190, 240, 160, Math.PI, 0);
            ctx.stroke();

            // Draw Laser Turret
            ctx.fillStyle = '#00f0ff';
            ctx.fillRect(turretX - 14, 205, 28, 12);
            ctx.fillRect(turretX - 3, 195, 6, 12);

            this.gameLoopId = requestAnimationFrame(loop);
        };
        loop();
    }

    // --- 10. Comms Signal Synthesizer ---
    initCommsSignalGame(container) {
        let freq = 3;
        let amp = 20;
        const targetFreq = 5;
        const targetAmp = 35;

        container.innerHTML = `
            <div class="comms-wave-box">
                <canvas id="wave-canvas" width="380" height="150" style="background:#060d1a; border-radius:8px; border:1px solid var(--cyan-neon); margin:0 auto;"></canvas>
                <div id="wave-match-readout" class="wave-match-meter" style="color:#ffaa00">HARMONIC RESONANCE: 45%</div>
                <div class="slider-group">
                    <label>Colony Carrier Frequency: ${freq}</label>
                    <input type="range" min="1" max="9" value="${freq}" oninput="window.game.miniGames.updateWave(this.value, null)">
                </div>
                <div class="slider-group">
                    <label>Transmission Wave Amplitude: ${amp}</label>
                    <input type="range" min="10" max="50" value="${amp}" oninput="window.game.miniGames.updateWave(null, this.value)">
                </div>
                <button id="btn-comms-transmit" class="btn-os" disabled onclick="window.game.miniGames.completeMiniGame(true, 75, 45)">
                    TRANSMIT TELEMETRY UPLINK TO EARTH
                </button>
            </div>
        `;

        const canvas = document.getElementById('wave-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const draw = () => {
            const fDiff = Math.abs(freq - targetFreq);
            const aDiff = Math.abs(amp - targetAmp);
            const resonance = Math.max(10, Math.floor(100 - (fDiff * 18 + aDiff * 1.5)));

            ctx.fillStyle = '#060d1a';
            ctx.fillRect(0, 0, 380, 150);

            // Earth reference wave (Red)
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            for (let x = 0; x < 380; x++) {
                const y = 75 + Math.sin(x * (targetFreq * 0.015)) * targetAmp;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Player wave (Cyan)
            ctx.strokeStyle = resonance >= 92 ? '#00ff88' : '#00f0ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            for (let x = 0; x < 380; x++) {
                const y = 75 + Math.sin(x * (freq * 0.015)) * amp;
                if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.stroke();

            const st = document.getElementById('wave-match-readout');
            const btn = document.getElementById('btn-comms-transmit');
            if (st) {
                st.textContent = `HARMONIC RESONANCE: ${resonance}% ${resonance >= 92 ? '✓ [CARRIER LOCKED]' : ''}`;
                st.style.color = resonance >= 92 ? '#00ff88' : '#ffaa00';
            }
            if (btn) {
                btn.disabled = resonance < 92;
                if (resonance >= 92) {
                    btn.style.borderColor = '#00ff88';
                    btn.style.boxShadow = '0 0 16px #00ff88';
                } else {
                    btn.style.borderColor = '';
                    btn.style.boxShadow = '';
                }
            }
        };

        this.updateWave = (f, a) => {
            if (f !== null) freq = parseInt(f);
            if (a !== null) amp = parseInt(a);
            draw();
        };

        draw();
    }
}
