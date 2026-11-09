import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TimerEngineService } from './timer-engine.service';

describe('TimerEngineService (TDD Specification)', () => {
  let service: TimerEngineService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new TimerEngineService();
  });

  afterEach(() => {
    service.reset();
    vi.useRealTimers();
  });

  describe('HF-001 & ST-002: Countdown & Status Transitions', () => {
    it('should initialize with default 25 min work session in idle status', () => {
      expect(service.mode()).toBe('work');
      expect(service.status()).toBe('idle');
      expect(service.remainingSeconds()).toBe(25 * 60);
      expect(service.totalSeconds()).toBe(25 * 60);
      expect(service.progressFraction()).toBe(0);
    });

    it('should transition status to running and count down seconds', () => {
      service.start();
      expect(service.status()).toBe('running');

      vi.advanceTimersByTime(3000);
      expect(service.remainingSeconds()).toBe(25 * 60 - 3);
      expect(service.progressFraction()).toBeCloseTo(3 / (25 * 60), 3);
    });

    it('should pause and resume correctly without losing remaining time', () => {
      service.start();
      vi.advanceTimersByTime(5000);
      expect(service.remainingSeconds()).toBe(25 * 60 - 5);

      service.pause();
      expect(service.status()).toBe('paused');

      vi.advanceTimersByTime(5000); // Should not count down while paused
      expect(service.remainingSeconds()).toBe(25 * 60 - 5);

      service.resume();
      expect(service.status()).toBe('running');
      vi.advanceTimersByTime(2000);
      expect(service.remainingSeconds()).toBe(25 * 60 - 7);
    });
  });

  describe('HF-002, HF-003 & ST-001: Session Completion & Mode Transitions', () => {
    it('should transition to shortBreak when work session completes', () => {
      service.setCustomMinutes(1, 1); // 1 min work, 1 min break
      service.start();

      let sessionCompletedEmitted = false;
      service.sessionCompleted.subscribe((session) => {
        sessionCompletedEmitted = true;
        expect(session.mode).toBe('work');
        expect(session.durationMinutes).toBe(1);
      });

      // Elapse full duration
      vi.advanceTimersByTime(60 * 1000);

      expect(sessionCompletedEmitted).toBe(true);
      expect(service.mode()).toBe('shortBreak');
      expect(service.status()).toBe('idle');
      expect(service.remainingSeconds()).toBe(60);
      expect(service.completedCycles()).toBe(1);
    });

    it('should transition to longBreak after completing configured cycles (HF-003)', () => {
      service.setPreset({
        name: 'Test',
        workMinutes: 1,
        shortBreakMinutes: 1,
        longBreakMinutes: 5,
        cyclesBeforeLongBreak: 2
      });

      // Complete cycle 1
      service.start();
      vi.advanceTimersByTime(60 * 1000);
      expect(service.mode()).toBe('shortBreak');
      expect(service.completedCycles()).toBe(1);

      // Complete break 1
      service.start();
      vi.advanceTimersByTime(60 * 1000);
      expect(service.mode()).toBe('work');

      // Complete cycle 2
      service.start();
      vi.advanceTimersByTime(60 * 1000);
      expect(service.mode()).toBe('longBreak');
      expect(service.completedCycles()).toBe(2);
      expect(service.remainingSeconds()).toBe(5 * 60);
    });
  });

  describe('HF-004: Preset Switching', () => {
    it('should update duration when switching presets', () => {
      service.setPreset({
        name: 'Deep Work',
        workMinutes: 50,
        shortBreakMinutes: 10,
        longBreakMinutes: 30,
        cyclesBeforeLongBreak: 4
      });

      expect(service.totalSeconds()).toBe(50 * 60);
      expect(service.remainingSeconds()).toBe(50 * 60);
      expect(service.progressFraction()).toBe(0);
    });
  });

  describe('NF-001, NF-002 & VR-001: Custom Minutes Validation', () => {
    it('should reject zero or negative custom minutes', () => {
      const initialTotal = service.totalSeconds();
      const valid = service.setCustomMinutes(0);
      expect(valid).toBe(false);
      expect(service.totalSeconds()).toBe(initialTotal);
    });

    it('should clamp or reject duration > 180 minutes', () => {
      const valid = service.setCustomMinutes(200);
      expect(valid).toBe(false);
    });

    it('should accept valid custom minutes between 1 and 180', () => {
      const valid = service.setCustomMinutes(45, 8);
      expect(valid).toBe(true);
      expect(service.totalSeconds()).toBe(45 * 60);
      expect(service.remainingSeconds()).toBe(45 * 60);
    });
  });

  describe('EC-001: Wall-Clock Delta Precision (No Tab Throttle Drift)', () => {
    it('should accurately calculate remaining time via wall-clock timestamp delta', () => {
      service.start();
      // Simulate large 10-minute leap (like when tab is backgrounded)
      service.synchronizeClockDelta(10 * 60 * 1000);
      expect(service.remainingSeconds()).toBe(15 * 60);
    });
  });

  describe('EC-003 & RR-001: Skip and Reset', () => {
    it('should reset current mode back to initial duration', () => {
      service.start();
      vi.advanceTimersByTime(10000);
      expect(service.remainingSeconds()).toBe(25 * 60 - 10);

      service.reset();
      expect(service.status()).toBe('idle');
      expect(service.remainingSeconds()).toBe(25 * 60);
      expect(service.progressFraction()).toBe(0);
    });

    it('should skip from work mode to break mode cleanly without recording full completed focus session', () => {
      let completed = false;
      service.sessionCompleted.subscribe(() => {
        completed = true;
      });

      service.start();
      vi.advanceTimersByTime(5000);
      service.skip();

      expect(completed).toBe(false);
      expect(service.mode()).toBe('shortBreak');
      expect(service.status()).toBe('idle');
    });
  });
});
