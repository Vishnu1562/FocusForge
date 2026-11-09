# Automation Test Specification: FocusForge

## Feature Overview
- **Feature Name**: FocusForge — Ambient Gamified Pomodoro Timer & Living Diorama
- **Vibe/Theme**: Cozy twilight campsite and fireside study aesthetic. Warm glowing amber, deep dusk blues, tactile analog controls, living animated diorama that evolves with session progress, and procedural ambient soundscape synthesis.
- **Tech Stack**: Angular 22 (Standalone Components, Signals, TypeScript, SCSS, Web Audio API, Canvas Confetti, Vitest).
- **Target Audience**: Developers, students, and knowledge workers seeking an immersive, drift-free productivity environment with zero tracking and offline PWA reliability.

---

## Component Architecture Contract
The application is decomposed into clean, focused standalone components:
1. `TimerEngineService` (`src/app/services/timer-engine.service.ts`):
   - High-precision timestamp-delta timing engine preventing tab background throttle drift.
   - Signals: `mode` ('work' | 'shortBreak' | 'longBreak'), `status` ('idle' | 'running' | 'paused' | 'completed'), `remainingSeconds`, `totalSeconds`, `progressFraction`, `completedCycles`.
   - Controls: `start()`, `pause()`, `resume()`, `reset()`, `skip()`, `setPreset()`, `setCustomMinutes()`.

2. `AmbientSoundService` (`src/app/services/ambient-sound.service.ts`):
   - Browser-native Web Audio API procedural synthesis:
     - 🌧️ Rain generator (filtered pink/brown noise).
     - 🔥 Campfire crackle (randomized noise bursts with acoustic envelope).
     - 🌊 Wind / Atmosphere (LFO-modulated white noise).
     - 🎵 Binaural focus hum (stereo detuned sine wave 10Hz alpha entrainment).
     - 🔔 Tibetan singing bowl / completion bell (resonant multi-harmonic bell).
   - Volume controls (0.0 to 1.0) per channel + master volume + mute toggle.

3. `StreakService` (`src/app/services/streak.service.ts`):
   - Manages focus telemetry stored in `localStorage`:
     - Total focus minutes accumulated.
     - Completed focus session counter.
     - Current consecutive daily streak.
     - 14-day session history.
     - Unlockable achievement badges (First Spark, Night Owl, Century Club, Marathon, Zen Master).

4. `DioramaComponent` (`app-diorama`):
   - Responsive SVG living campsite scene:
     - 0–25%: Twilight dusk, subtle campfire spark, cold mug.
     - 25–50%: Fire ignites, rising embers, twinkling stars.
     - 50–75%: Golden fire flares, tent lantern illuminates, steaming mug.
     - 75–100%: Roaring campfire, glowing constellations, shooting stars on completion.
     - Break Mode: Soft blue moonlight campfire simmer.
   - Inputs: `progress: number` (0.0 to 1.0), `mode: 'work' | 'shortBreak' | 'longBreak'`, `status: 'idle' | 'running' | 'paused' | 'completed'`.

5. `TimerDisplayComponent` (`app-timer-display`):
   - Circular SVG progress ring with glowing neon ember stroke.
   - Digital countdown display (MM:SS).
   - Mode badge ('FOCUS SESSION #1', 'SHORT BREAK', 'LONG BREAK').
   - Tactile Action Buttons: Play/Pause, Reset, Skip.
   - Preset Selectors: Classic (25/5), Deep Work (50/10), Sprint (15/3), Custom.

6. `SoundMixerComponent` (`app-sound-mixer`):
   - Analog soundboard mixer with volume sliders for Rain, Fire, Wind, Binaural Hum, and Master.
   - Mute/Unmute quick toggle.
   - 1-click soundscape presets: "Rainy Campsite", "Fireplace Study", "Deep Focus Binaural", "Silent Night".

7. `StreakVaultComponent` (`app-streak-vault`):
   - Stat tiles: Focus Minutes, Sessions, Daily Streak.
   - Visual 14-day activity heatmap dots.
   - Badges drawer showcasing unlocked and locked achievements.

8. `AppComponent` (`app-root`):
   - Orchestrates services, keyboard shortcuts (Space = Play/Pause, R = Reset, S = Skip, M = Mute), browser notification dispatch, and canvas confetti fanfare.

---

## Preconditions
1. Modern web browser with JavaScript and Web Audio API enabled.
2. Responsive from mobile screens (360px width) up to 4K ultra-wide monitors.
3. AudioContext starts suspended until user interaction per browser autoplay policies.

---

## Test Data
- Presets:
  - Classic: 25 min work, 5 min short break, 15 min long break (cycles: 4)
  - Deep Work: 50 min work, 10 min short break, 30 min long break
  - Sprint: 15 min work, 3 min short break, 10 min long break
- Custom: 1 to 180 minutes

---

## Happy Flows

### `HF-001`: Start / Pause / Resume Timer Countdown
- **Preconditions**: Timer is idle at 25:00 in 'work' mode.
- **Actions**: User clicks Play (or presses Spacebar).
- **Expected Results**:
  - Timer status becomes `running`.
  - Ambient sounds activate (if enabled).
  - Seconds count down each second without drift.
  - User clicks Pause: status becomes `paused`, ambient sounds gently pause.
  - User clicks Resume: status returns to `running`.
- **Final State**: `status = running`, `remainingSeconds < totalSeconds`.

### `HF-002`: Complete Focus Session and Transition to Short Break
- **Preconditions**: Timer is running in 'work' mode with 1 second remaining.
- **Actions**: Last second elapses.
- **Expected Results**:
  - Tibetan singing bowl bell chime sounds.
  - Confetti burst triggers on screen.
  - StreakService logs completed session and adds 25 minutes.
  - Timer automatically transitions to 'shortBreak' (5:00).
  - Diorama shifts to moonlight campfire simmer mode.
- **Final State**: `mode = shortBreak`, `status = idle` or `running`, `completedCycles = 1`.

### `HF-003`: Complete 4 Cycles Transitions to Long Break
- **Preconditions**: User completes 4th consecutive work session (`completedCycles = 3` -> `4`).
- **Actions**: Session finishes.
- **Expected Results**:
  - Timer transitions to 'longBreak' (15:00 or configured long break duration).
  - "Marathon Runner" badge unlocks if not previously earned.
- **Final State**: `mode = longBreak`, `completedCycles = 4`.

### `HF-004`: Switch Timer Presets
- **Preconditions**: Timer is idle.
- **Actions**: User clicks "Deep Work (50m)".
- **Expected Results**:
  - Total duration updates to 50:00 (3000 seconds).
  - Remaining seconds set to 3000.
  - Progress ring resets to 0%.
- **Final State**: `totalSeconds = 3000`, `remainingSeconds = 3000`.

### `HF-005`: Ambient Sound Mixer Controls and Volume Sliders
- **Preconditions**: Ambient sound service is active.
- **Actions**: User adjusts the "Rain" slider to 80% and "Campfire" to 50%.
- **Expected Results**:
  - Gain nodes adjust dynamically without audio clipping or pops.
  - Master mute button silences all sound synthesis while retaining individual slider positions.
- **Final State**: Rain gain = 0.8, Fire gain = 0.5.

### `HF-006`: Streak Accumulation and Badge Unlocking
- **Preconditions**: User has 0 previous sessions.
- **Actions**: User completes first 25-minute focus session.
- **Expected Results**:
  - Total minutes = 25.
  - Completed sessions = 1.
  - Daily streak = 1.
  - "Campfire Spark" badge is unlocked with timestamp.
  - LocalStorage updated with new telemetry.
- **Final State**: Streak record saved in localStorage.

### `HF-007`: Living Diorama Evolution Along Progress Arc
- **Preconditions**: Focus session in progress.
- **Actions**: Progress increases from 0% -> 30% -> 60% -> 90% -> 100%.
- **Expected Results**:
  - At 30%: Campfire sparks ignite.
  - At 60%: Tent lantern illuminates, coffee mug steams.
  - At 90%: Roaring campfire, twinkling stars.
  - At 100%: Shooting star and celebratory flare.
- **Final State**: Diorama visually reflects current progress.

---

## Negative Flows

### `NF-001`: Invalid Custom Duration (Zero or Negative)
- **Preconditions**: Custom duration input opened.
- **Actions**: User enters `0`, `-5`, or empty string.
- **Expected Results**:
  - Input rejected with validation error: *"Duration must be between 1 and 180 minutes."*
  - Timer duration remains at previous valid value.
- **Final State**: Validation error displayed, timer unaffected.

### `NF-002`: Excessive Custom Duration (> 180 Minutes)
- **Preconditions**: User enters `300` minutes.
- **Actions**: Submits custom duration.
- **Expected Results**:
  - Value clamped to 180 or rejected with validation error.
- **Final State**: Clamped or rejected safely.

### `NF-003`: Browser Autoplay Policy Blocks Audio
- **Preconditions**: Browser blocks audio before initial user gesture.
- **Actions**: App loads; audio context starts suspended.
- **Expected Results**:
  - No uncaught JavaScript exceptions.
  - First user click (Play button or mixer slider) gracefully calls `audioCtx.resume()`.
- **Final State**: Audio context smoothly activated.

### `NF-004`: Corrupted LocalStorage Telemetry
- **Preconditions**: LocalStorage contains invalid JSON under streak key.
- **Actions**: StreakService initializes.
- **Expected Results**:
  - Catches parse error safely, initializes fresh default telemetry.
  - No application crash.
- **Final State**: Valid default streak record loaded.

---

## Edge Cases

### `EC-001`: Tab Minimization & Clock Drift Elimination
- **Preconditions**: User starts timer and minimizes browser tab for 10 minutes.
- **Actions**: Tab is restored.
- **Expected Results**:
  - Timer calculates elapsed time using `Date.now()` delta rather than relying solely on throttled `setInterval`.
  - Remaining time accurately reflects true 10 minutes elapsed.
- **Final State**: Accurate remaining time without drift.

### `EC-002`: Rapid Play / Pause Toggling
- **Preconditions**: Timer is running.
- **Actions**: User clicks Play/Pause rapidly 10 times in 1 second.
- **Expected Results**:
  - No multiple interval timers running concurrently.
  - State cleanly switches between running and paused without audio stutter.
- **Final State**: Single timer state consistent.

### `EC-003`: Skip to Next Phase During Active Session
- **Preconditions**: Work session is halfway through (12:30 / 25:00).
- **Actions**: User clicks "Skip to Break".
- **Expected Results**:
  - Current session halts, transitions immediately to Break (5:00).
  - Incomplete session does not award full focus minutes.
- **Final State**: `mode = shortBreak`, `status = idle`.

### `EC-004`: Session Spanning Midnight
- **Preconditions**: Session starts at 11:50 PM and finishes at 12:15 AM.
- **Actions**: Session completes on the new calendar day.
- **Expected Results**:
  - Streak correctly records on the date of completion without resetting streak to zero.
- **Final State**: Daily streak continues unbroken.

---

## Validation Rules
- `VR-001`: Work duration integer between 1 and 180 minutes.
- `VR-002`: Break duration integer between 1 and 60 minutes.
- `VR-003`: Volume levels clamped to `[0.0, 1.0]`.

---

## State Transitions
- `ST-001`: `mode`: `work` -> `shortBreak` -> `work` -> ... -> `longBreak` -> `work`.
- `ST-002`: `status`: `idle` -> `running` -> `paused` -> `completed` -> `idle`.

---

## Recovery & Retry
- `RR-001`: Reset button resets current mode to full duration at any time.
- `RR-002`: Audio context `resume()` triggered on any interactive user click.
- `RR-003`: LocalStorage fallback to in-memory store if private browsing blocks storage.

---

## Priority Matrix
- **P0 (Critical)**: `HF-001`, `HF-002`, `HF-003`, `HF-004`, `EC-001`, `EC-002`, `NF-001`.
- **P1 (High)**: `HF-005`, `HF-006`, `HF-007`, `EC-003`, `NF-003`, `VR-001`.
- **P2 (Delight)**: Living diorama SVG animations, Canvas confetti, procedural sound synthesis.
