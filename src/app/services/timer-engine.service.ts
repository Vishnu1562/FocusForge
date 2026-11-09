import { Injectable, computed, signal, EventEmitter } from '@angular/core';
import { SessionCompletionEvent, TimerMode, TimerPreset, TimerStatus } from '../models/focus-forge.model';

export const DEFAULT_PRESETS: TimerPreset[] = [
  {
    name: 'Classic Pomodoro',
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
    cyclesBeforeLongBreak: 4
  },
  {
    name: 'Deep Work',
    workMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 30,
    cyclesBeforeLongBreak: 4
  },
  {
    name: 'Quick Sprint',
    workMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
    cyclesBeforeLongBreak: 4
  }
];

@Injectable({
  providedIn: 'root'
})
export class TimerEngineService {
  mode = signal<TimerMode>('work');
  status = signal<TimerStatus>('idle');
  totalSeconds = signal<number>(25 * 60);
  remainingSeconds = signal<number>(25 * 60);
  completedCycles = signal<number>(0);

  progressFraction = computed(() => {
    const total = this.totalSeconds();
    if (total <= 0) return 0;
    const remaining = this.remainingSeconds();
    const frac = 1 - remaining / total;
    return Math.max(0, Math.min(1, frac));
  });

  sessionCompleted = new EventEmitter<SessionCompletionEvent>();

  private activePreset: TimerPreset = DEFAULT_PRESETS[0];
  private timerInterval: any = null;
  private lastTimestamp: number = 0;

  get currentPreset(): TimerPreset {
    return this.activePreset;
  }

  setPreset(preset: TimerPreset): void {
    this.reset();
    this.activePreset = { ...preset };
    this.applyCurrentModeDuration();
  }

  setCustomMinutes(workMin: number, breakMin: number = 5): boolean {
    if (!Number.isInteger(workMin) || workMin < 1 || workMin > 180) {
      return false;
    }
    if (breakMin !== undefined && (!Number.isInteger(breakMin) || breakMin < 1 || breakMin > 60)) {
      return false;
    }

    this.reset();
    this.activePreset = {
      name: `Custom (${workMin}m)`,
      workMinutes: workMin,
      shortBreakMinutes: breakMin,
      longBreakMinutes: breakMin * 3,
      cyclesBeforeLongBreak: 4
    };
    this.applyCurrentModeDuration();
    return true;
  }

  start(): void {
    if (this.status() === 'running') return;

    this.status.set('running');
    this.lastTimestamp = Date.now();
    this.clearTimerInterval();

    this.timerInterval = setInterval(() => {
      this.tick();
    }, 250);
  }

  pause(): void {
    if (this.status() !== 'running') return;
    this.clearTimerInterval();
    this.status.set('paused');
  }

  resume(): void {
    if (this.status() !== 'paused') return;
    this.start();
  }

  reset(): void {
    this.clearTimerInterval();
    this.status.set('idle');
    this.applyCurrentModeDuration();
  }

  skip(): void {
    this.clearTimerInterval();
    this.status.set('idle');

    if (this.mode() === 'work') {
      this.mode.set('shortBreak');
    } else {
      this.mode.set('work');
    }
    this.applyCurrentModeDuration();
  }

  synchronizeClockDelta(elapsedMs: number): void {
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    if (elapsedSeconds <= 0) return;

    const nextRemaining = this.remainingSeconds() - elapsedSeconds;
    if (nextRemaining <= 0) {
      this.remainingSeconds.set(0);
      this.completeSession();
    } else {
      this.remainingSeconds.set(nextRemaining);
    }
  }

  private tick(): void {
    if (this.status() !== 'running') return;

    const now = Date.now();
    const deltaMs = now - this.lastTimestamp;

    if (deltaMs >= 1000) {
      const wholeSeconds = Math.floor(deltaMs / 1000);
      this.lastTimestamp += wholeSeconds * 1000;

      const nextRemaining = this.remainingSeconds() - wholeSeconds;
      if (nextRemaining <= 0) {
        this.remainingSeconds.set(0);
        this.completeSession();
      } else {
        this.remainingSeconds.set(nextRemaining);
      }
    }
  }

  private completeSession(): void {
    this.clearTimerInterval();
    const currentMode = this.mode();
    const durationMin = Math.round(this.totalSeconds() / 60);

    // Emit event before state changes so listeners capture it
    this.sessionCompleted.emit({
      mode: currentMode,
      durationMinutes: durationMin,
      timestamp: new Date().toISOString(),
      cycleNumber: this.completedCycles() + 1
    });

    if (currentMode === 'work') {
      const nextCycleCount = this.completedCycles() + 1;
      this.completedCycles.set(nextCycleCount);

      if (nextCycleCount % this.activePreset.cyclesBeforeLongBreak === 0) {
        this.mode.set('longBreak');
      } else {
        this.mode.set('shortBreak');
      }
    } else {
      this.mode.set('work');
    }

    this.status.set('idle');
    this.applyCurrentModeDuration();
  }

  private applyCurrentModeDuration(): void {
    let minutes = this.activePreset.workMinutes;
    if (this.mode() === 'shortBreak') {
      minutes = this.activePreset.shortBreakMinutes;
    } else if (this.mode() === 'longBreak') {
      minutes = this.activePreset.longBreakMinutes;
    }

    const secs = minutes * 60;
    this.totalSeconds.set(secs);
    this.remainingSeconds.set(secs);
  }

  private clearTimerInterval(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
