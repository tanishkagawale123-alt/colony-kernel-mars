# 🪐 COLONY KERNEL: MARS — 3D OS Simulation & Exploration Game

> **"You don't just control the colony. You ARE the operating system."**

A 3D third-person Mars exploration adventure seamlessly merged with an authentic 4-Core CPU Operating System scheduler simulation. Explore the Martian surface, meet 10 unique colonists, manage life support, solve real circular-wait deadlocks, avert cascading multi-system failures, and survive 12 Sol cycles.

---

## 🎮 Features

### 1. ⚡ 4-Core CPU Process Scheduler (Holographic OS — `[TAB]`)
- **Preemptive Priority Scheduling**: Dispatch critical colony threads (`LifeSupport`, `Power`, `Medical`, `Comms`, `Logistics`) to 4 CPU cores. Context-switch and preempt lower-priority tasks when alarms trip.
- **Deadlock Detection & Resolution**: Real-time Resource Allocation Graph (RAG) cycle analysis. Detects mutual exclusion circular wait conditions between mutex locks (`POWER`, `OXYGEN`, `WATER`) and provides SIGKILL/Auto-Break recovery tools.
- **Cascading Failure Engine**: Simulates cascading failures where power loss cuts oxygen scrubbers, leading to thermal runaway and habitability loss if not triaged in time.
- **Deadlock Lab & Custom Task Spawner**: Inject synthetic deadlock test cases or spawn custom processes to stress-test your scheduling throughput.

### 2. 🛰️ Holographic Radar & 3D Waypoint Navigation
- **HUD Mini-Map Radar**: Circular high-tech radar displaying colony perimeter, 9 major buildings, live blips for all 10 moving NPCs, player position, and camera heading cone.
- **3D Waypoint Light Beam**: An in-world floating golden diamond beacon and vertical beam indicating active quest directives with live distance readouts in meters.

### 3. 🚀 Mars Rover Mobility Mode (`[R]`)
- Mount a low-poly Mars Rover on demand to patrol the base at 65 km/h with spinning wheels, thruster SFX, and dust trails. Press `[R]` to toggle between foot patrol and rover drive.

### 4. 🕹️ 10 Interactive Mini-Games
1. **Oxygen Pipe Alignment**: 3x3 pipe puzzle with path tracing from inlet to life support outlet.
2. **Solar Grid Alignment**: Dual-axis solar tracking radar aligning Azimuth & Elevation to hit 95%+ efficiency.
3. **RAM Memory Matrix**: Multi-round Simon-says memory paging diagnostic with audio tones.
4. **Robotics Wire Repair**: Color-matched logic bus wiring circuit with interactive electrical sparks.
5. **Mars Rover Rally**: 2D runner avoiding craters and collecting telemetry pods across 100 meters.
6. **Hydroponics Nutrient Synthesizer**: 3-nutrient equilibrium balancing (N, P, H2O) with biome health preview.
7. **Priority Queue Cargo Dispatcher**: Conveyor sorting sorting cargo into High, Medium, and Low queues.
8. **Drone Wind Landing Simulator**: Physics-based flight simulation landing against crosswinds.
9. **Meteor Shield Defense**: Retro arcade canvas turret blasting incoming meteorites with defensive lasers.
10. **Comms Signal Synthesizer**: Real-time oscilloscope matching carrier waves with Earth uplink.

### 5. 🧑‍🚀 Colony Story & Progression
- **5 Structured Story Missions**: First Boot, Power Crisis, Oxygen Emergency & Preemption, The Deadlock, and The Great Cascade.
- **10 Unique NPCs**: Maya, Arjun, Lena, Noah, Kai, Dr. Elias, Nova, Zara, Finn, and Max with distinct personalities, friendship meters, overhead 3D nametags, and humorous dialogues.
- **Progression & Awards**: XP leveling, credit economy, astronaut suit color customizer, and 8 unlockable achievements.
- **100% Procedural Web Audio Engine**: Zero external audio files required — fully synthesized dynamic music and sound effects.

---

## ⌨️ Controls

| Key | Action |
|---|---|
| `W`, `A`, `S`, `D` / Arrows | Move Character / Steer Vehicle |
| `Space` | Jump / Fire Defense Lasers |
| `Shift` (Hold) | Sprint |
| `E` | Interact (Talk to NPC / Launch Mini-Game / Open Terminal) |
| `Tab` | Open / Close Holographic Kernel OS Scheduler |
| `R` | Mount / Dismount Mars Rover Vehicle |
| `Esc` | Close Modals & Windows |
| `Mouse Drag` | Orbital 3rd-person camera look |

---

## 🚀 How to Run Locally

No Node.js or heavy dependencies required! Run with standard Python 3:

```bash
python3 server.py
```

Then open your browser to:
```
http://localhost:8000
```

---

## 📁 Project Architecture

```
├── index.html                  # Main WebGL viewport, HUD, and modal interfaces
├── server.py                   # Lightweight zero-cache local server
├── css/
│   ├── main.css                # Base colors, typography, glassmorphism styles
│   ├── hud.css                 # HUD overlay, radar mini-map, status bars
│   ├── kernel_os.css           # 4-Core CPU Gantt, process table, deadlock alerts
│   ├── minigames.css           # Mini-game overlays, canvases, wire routing styles
│   ├── dialogue.css            # NPC communication link and friendship widgets
│   └── postmortem.css          # Mission timeline and victory/failure debrief
└── js/
    ├── main.js                 # Master game loop, radar updates, global coordinates
    ├── audio/
    │   └── sound_engine.js     # Procedural Web Audio synthesizer (SFX & dynamic music)
    ├── engine/
    │   ├── input.js            # Key and pointer lock input controller
    │   ├── camera.js           # 3rd-person orbital follow camera
    │   └── particles.js        # Dust storms, welding sparks, and celebration confetti
    ├── world/
    │   ├── mars_terrain.js     # Procedural Martian dunes, craters, and kickable rocks
    │   ├── colony_buildings.js # Domes, central tower, waypoints, and terminals
    │   └── lighting_cycle.js   # Dynamic sunlight, night cycle, dust storms, alarms
    ├── characters/
    │   ├── character_rig.js    # Stylized humanoid astronaut rig with animations
    │   ├── player.js           # Player physics, rover mobility, and customization
    │   ├── npcs.js             # 10 autonomous NPCs with patrol AI and nametags
    │   ├── pixel_companion.js  # Floating robot pet with LED face expressions
    │   └── kernel_ai.js        # Holographic OS AI commentary assistant
    ├── os_kernel/
    │   ├── process.js          # Process control block, burst times, state transitions
    │   ├── scheduler.js        # 4-Core preemptive CPU scheduler & process generator
    │   ├── deadlock_detector.js# Resource Allocation Graph DFS cycle detection
    │   ├── cascade_engine.js   # Multi-system failure cascading dynamics
    │   └── kernel_ui.js        # Holographic Gantt and table DOM renderer
    ├── minigames/
    │   └── minigames.js        # All 10 interactive colony mini-game implementations
    └── story/
        ├── missions.js         # 5 story directives and 12-Sol survival progression
        ├── dialogues.js        # Full branching NPC dialogue trees
        └── achievements.js     # Achievements, XP leveling, and postmortem timeline
```

---

## 🏆 Hackathon Edition
Created for the Hackathon — built with pure Three.js, vanilla JavaScript, Canvas API, and Web Audio API with zero build steps required.
