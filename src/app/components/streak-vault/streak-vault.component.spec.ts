import { describe, it, expect, beforeEach } from 'vitest';
import { StreakVaultComponent } from './streak-vault.component';
import { StreakData } from '../../models/focus-forge.model';
import { INITIAL_BADGES } from '../../services/streak.service';

describe('StreakVaultComponent (TDD Specification)', () => {
  let component: StreakVaultComponent;

  const mockData: StreakData = {
    totalMinutes: 145,
    completedSessions: 5,
    currentStreak: 3,
    lastActiveDate: '2026-06-15',
    history: { '2026-06-15': 50, '2026-06-14': 50, '2026-06-13': 45 },
    badges: INITIAL_BADGES.map((b, i) => i === 0 ? { ...b, unlocked: true, unlockedAt: '2026-06-15T12:00:00Z' } : b)
  };

  beforeEach(() => {
    component = new StreakVaultComponent();
    component.streakData = mockData;
  });

  describe('Formatting & Badge Computation', () => {
    it('should format total minutes into hours and minutes', () => {
      expect(component.formatHours(145)).toBe('2h 25m');
      expect(component.formatHours(45)).toBe('45m');
      expect(component.formatHours(0)).toBe('0m');
    });

    it('should generate 14-day heatmap array', () => {
      const days = component.getHeatmapDays();
      expect(days.length).toBe(14);
      expect(days[days.length - 1].dateString).toBeDefined();
    });

    it('should count unlocked badges correctly', () => {
      expect(component.getUnlockedBadgeCount()).toBe(1);
    });
  });
});
