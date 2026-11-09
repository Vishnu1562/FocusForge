import { describe, it, expect, beforeEach } from 'vitest';
import { DioramaComponent } from './diorama.component';

describe('DioramaComponent (TDD Specification)', () => {
  let component: DioramaComponent;

  beforeEach(() => {
    component = new DioramaComponent();
  });

  describe('HF-007: Visual Progression States', () => {
    it('should compute fire scale and stage based on progress percentage', () => {
      component.progress = 0.1;
      expect(component.getFireStage()).toBe('spark');

      component.progress = 0.4;
      expect(component.getFireStage()).toBe('kindle');

      component.progress = 0.7;
      expect(component.getFireStage()).toBe('blaze');

      component.progress = 0.95;
      expect(component.getFireStage()).toBe('inferno');
    });

    it('should determine lantern glow active when progress is >= 50%', () => {
      component.progress = 0.3;
      expect(component.isLanternLit()).toBe(false);

      component.progress = 0.6;
      expect(component.isLanternLit()).toBe(true);
    });

    it('should return break mode styling when mode is shortBreak or longBreak', () => {
      component.mode = 'shortBreak';
      expect(component.isBreakMode()).toBe(true);

      component.mode = 'work';
      expect(component.isBreakMode()).toBe(false);
    });
  });
});
