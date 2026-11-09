import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppComponent } from './app';
import { TimerEngineService } from './services/timer-engine.service';
import { AmbientSoundService } from './services/ambient-sound.service';
import { StreakService } from './services/streak.service';

describe('AppComponent Orchestration Integration (TDD Specification)', () => {
  let app: AppComponent;
  let timer: TimerEngineService;
  let sound: AmbientSoundService;
  let streak: StreakService;

  beforeEach(() => {
    localStorage.clear();
    timer = new TimerEngineService();
    sound = new AmbientSoundService();
    streak = new StreakService();
    app = new AppComponent(timer, sound, streak);
  });

  describe('ST-002, HF-001: Play/Pause Orchestration', () => {
    it('should start timer and ambient sounds when onTogglePlay is called from idle', () => {
      const startSoundSpy = vi.spyOn(sound, 'startAmbientSounds');
      app.onTogglePlay();

      expect(timer.status()).toBe('running');
      expect(startSoundSpy).toHaveBeenCalled();
    });

    it('should pause timer and stop ambient sounds when paused', () => {
      const stopSoundSpy = vi.spyOn(sound, 'stopAmbientSounds');
      app.onTogglePlay(); // start
      app.onTogglePlay(); // pause

      expect(timer.status()).toBe('paused');
      expect(stopSoundSpy).toHaveBeenCalled();
    });
  });

  describe('HF-002: Session Completion Orchestration', () => {
    it('should trigger completion bell, record streak, and notify when work session completes', () => {
      const bellSpy = vi.spyOn(sound, 'playCompletionBell');
      const recordStreakSpy = vi.spyOn(streak, 'recordSession');

      app.ngOnInit();

      // Trigger session completion
      timer.sessionCompleted.emit({
        mode: 'work',
        durationMinutes: 25,
        timestamp: new Date().toISOString(),
        cycleNumber: 1
      });

      expect(bellSpy).toHaveBeenCalled();
      expect(recordStreakSpy).toHaveBeenCalledWith(25, 1);
    });
  });

  describe('Keyboard Shortcuts (HF-001, HF-005, EC-003, RR-001)', () => {
    it('should handle Spacebar to toggle timer', () => {
      const toggleSpy = vi.spyOn(app, 'onTogglePlay');
      const event = new KeyboardEvent('keydown', { code: 'Space' });
      app.handleKeyboardEvent(event);

      expect(toggleSpy).toHaveBeenCalled();
    });

    it('should handle KeyR to reset timer', () => {
      const resetSpy = vi.spyOn(timer, 'reset');
      const event = new KeyboardEvent('keydown', { code: 'KeyR' });
      app.handleKeyboardEvent(event);

      expect(resetSpy).toHaveBeenCalled();
    });

    it('should handle KeyM to toggle sound mute', () => {
      const muteSpy = vi.spyOn(sound, 'toggleMute');
      const event = new KeyboardEvent('keydown', { code: 'KeyM' });
      app.handleKeyboardEvent(event);

      expect(muteSpy).toHaveBeenCalled();
    });
  });
});
