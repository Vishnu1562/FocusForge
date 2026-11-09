# 🔥 FocusForge — Ambient Gamified Pomodoro & Living Diorama

> **A tactile, drift-free ambient Pomodoro timer and living campsite diorama with browser-native Web Audio API nature sound synthesis, precision clock delta tracking, and reputation streak vault.**

[![Angular](https://img.shields.io/badge/Angular-22_Standalone_%2B_Signals-dd0031.svg)](https://angular.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org)
[![Vitest](https://img.shields.io/badge/Vitest-50_Passing_Tests-729B1B.svg)](https://vitest.dev)
[![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Procedural_Synthesis-f59e0b.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
[![PWA](https://img.shields.io/badge/PWA-Offline_First-10b981.svg)](https://web.dev/progressive-web-apps/)

---

## 🌟 Overview & Portfolio Value

**FocusForge** bridges productivity utility with high-craft frontend engineering. Most timer applications suffer from timer drift when tabs are backgrounded in modern browsers, lack immersive sensory feedback, and feel like sterile forms. FocusForge solves these challenges with:

1. **Drift-Free Clock Delta Engine**: Leverages wall-clock timestamp-delta synchronization, preventing the severe browser throttling (up to several minutes of drift) that ruins standard `setInterval` timers.
2. **Zero-Asset Procedural Ambient Synthesizer**: Generates dynamic rainfall, authentic campfire crackles, night wind gusts, and 10Hz alpha binaural entrainment beats using pure Web Audio API math (zero external MP3/audio assets loaded).
3. **Living Campsite Diorama**: An evolving SVG isometric artwork that progressively transforms from a twilight spark into a roaring campfire, illuminates lanterns, steams tea mugs, and shoots stars upon session completion.
4. **Reputation & Streak Vault**: Client-side telemetry tracking total hours focused, 14-day activity heatmaps, and unlockable achievement badges.

---

## 🛠️ Key Technical Features

### 1. Drift-Free Precision Timing Engine (`TimerEngineService`)
- Eliminates browser tab background throttling drift via delta timestamp calculation against `Date.now()`.
- Built entirely on reactive **Angular Signals** (`mode`, `status`, `remainingSeconds`, `progressFraction`, `completedCycles`).
- Supports classic intervals:
  - **Classic Pomodoro**: 25m work / 5m short break / 15m long break (4-cycle cadence)
  - **Deep Work**: 50m work / 10m short break / 30m long break
  - **Quick Sprint**: 15m work / 3m short break / 10m long break
  - **Custom Range**: 1 to 180 minutes with inline validation.

### 2. Multi-Channel Procedural Ambient Soundboard (`AmbientSoundService`)
- Native **Web Audio API** procedural audio graph:
  - 🌧️ **Rainfall**: Looped pink/brown noise algorithm passed through an 750Hz low-pass resonance filter.
  - 🔥 **Campfire Crackle**: Randomized impulse clicks and pops with randomized time offsets and acoustic envelopes.
  - 🌊 **Night Wind**: Bandpass-filtered noise with low-frequency modulation.
  - 🎵 **Binaural Alpha Beats**: Dual 216Hz and 226Hz sine wave oscillators generating a 10Hz alpha brainwave entrainment beat.
  - 🔔 **Tibetan Singing Bowl**: 432Hz fundamental with 864Hz and 1296Hz harmonics and 4.8s exponential ring-down.
- Channel volume sliders, master output slider, soundscape presets ("Rainy Campsite", "Fireplace Study", "Deep Focus Binaural"), and persistent mute preference in `localStorage`.

### 3. Living SVG Campsite Diorama (`DioramaComponent`)
- Responsive vector landscape that dynamically visualizes focus progress:
  - `0% – 25% (Spark)`: Faint campfire kindling, quiet twilight sky.
  - `25% – 50% (Kindle)`: Flame ignites, rising floating embers, stars begin to twinkle.
  - `50% – 75% (Blaze)`: Lantern turns on, steam curls from ceramic mug, golden campfire flaring.
  - `75% – 100% (Inferno)`: Full roaring fire, glowing constellations, shooting stars on completion.
  - `Break Mode`: Soft moonlight campfire simmer with calming blue fire.

### 4. Telemetry & Achievement Vault (`StreakService` & `StreakVaultComponent`)
- Tracks:
  - Total focus time (formatted into hours and minutes).
  - Consecutive day streak with midnight-rollover awareness.
  - 14-day visual activity heatmap.
  - Unlockable achievement badges with toast alerts: *Campfire Spark*, *Night Owl*, *Century Club*, *Marathon Runner*, and *Zen Master*.

---

## 📋 Architecture & Behavioral Contract

FocusForge was developed following strict **Flow-First Test-Driven Development (TDD)**:
👉 [`automation-tests.md`](./automation-tests.md)

### Test Suite Highlights
- **50 Unit & Integration Tests** executed via **Vitest** (100% Passing):
  - `timer-engine.service.spec.ts`: 12 tests (Countdown, cycle transitions, wall-clock delta precision, custom minute validation).
  - `streak.service.spec.ts`: 9 tests (Streak calculation, badge unlocking, corrupt JSON recovery).
  - `ambient-sound.service.spec.ts`: 6 tests (Volume clamping, mute persistence, procedural synthesis).
  - `timer-display.component.spec.ts`: 6 tests (Time formatting, circular progress ring, preset selection).
  - `diorama.component.spec.ts`: 3 tests (Fire stage scale, lantern activation, break mode).
  - `sound-mixer.component.spec.ts`: 5 tests (Sliders, channel toggles, preset application).
  - `streak-vault.component.spec.ts`: 3 tests (Hours formatting, 14-day heatmap generation).
  - `app.spec.ts`: 6 tests (Play/pause orchestration, completion celebration, keyboard shortcuts).

---

## 💼 Resume & Portfolio Talking Points

Ready to paste directly into your resume under **Key Technical Projects**:

```markdown
### FocusForge — Ambient Gamified Pomodoro & Living Diorama
- Developed an offline-first Pomodoro PWA in Angular 22 Signals, eliminating browser tab throttling drift via high-precision clock delta synchronization.
- Engineered a multi-channel procedural ambient sound synthesizer using native Web Audio API, generating dynamic rain, campfire crackles, and 10Hz binaural beats with zero external audio assets.
- Created an interactive SVG living campsite diorama that dynamically morphs and animates in real-time according to session progress.
- Implemented 50 comprehensive unit and integration tests using Vitest following Flow-First TDD, achieving a 100% green test suite.
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `v20+` or `v24+`
- npm `v10+` or `v11+`

### Installation
```bash
cd D:/Projects/FocusForge
npm install
```

### Run Locally
```bash
npm start
```
Navigate to `http://localhost:4200` to ignite your focus session!

### Run Tests
```bash
npm test
```

### Production Build
```bash
npm run build
```
Production assets compiled to `dist/focusforge/browser`.

---

## 📜 License
MIT © 2026. Crafted with passion for delightful frontend engineering.
