import { describe, it, expect, beforeEach } from 'vitest';
import { TimerDisplayComponent } from './timer-display.component';

describe('TimerDisplayComponent (TDD Specification)', () => {
  let component: TimerDisplayComponent;

  beforeEach(() => {
    component = new TimerDisplayComponent();
  });

  describe('Time Formatting & Display', () => {
    it('should format seconds into MM:SS correctly', () => {
      expect(component.formatTime(1500)).toBe('25:00');
      expect(component.formatTime(299)).toBe('04:59');
      expect(component.formatTime(5)).toBe('00:05');
      expect(component.formatTime(0)).toBe('00:00');
    });

    it('should return human-readable mode label', () => {
      component.mode = 'work';
      component.cycleNumber = 1;
      expect(component.getModeLabel()).toContain('FOCUS SESSION #1');

      component.mode = 'shortBreak';
      expect(component.getModeLabel()).toBe('SHORT BREAK');

      component.mode = 'longBreak';
      expect(component.getModeLabel()).toBe('LONG BREAK');
    });
  });

  describe('User Action Emits', () => {
    it('should emit togglePlay when play button is clicked', () => {
      let emitted = false;
      component.togglePlay.subscribe(() => {
        emitted = true;
      });

      component.onTogglePlay();
      expect(emitted).toBe(true);
    });

    it('should emit resetTimer when reset is clicked', () => {
      let emitted = false;
      component.resetTimer.subscribe(() => {
        emitted = true;
      });

      component.onReset();
      expect(emitted).toBe(true);
    });

    it('should emit skipPhase when skip is clicked', () => {
      let emitted = false;
      component.skipPhase.subscribe(() => {
        emitted = true;
      });

      component.onSkip();
      expect(emitted).toBe(true);
    });

    it('should emit selectPreset when a preset is chosen', () => {
      let selectedPreset: any = null;
      component.selectPreset.subscribe((preset) => {
        selectedPreset = preset;
      });

      component.onSelectPreset(component.presets[1]);
      expect(selectedPreset?.name).toBe('Deep Work');
    });
  });
});
